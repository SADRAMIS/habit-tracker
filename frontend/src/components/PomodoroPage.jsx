import { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { api } from '../api';
import { showToast } from './Toast';

// Простой звук окончания через Web Audio API
const playBeep = () => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.5, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 1);
  } catch (e) {
    console.warn('Audio error:', e);
  }
};

export default function PomodoroPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Настройки
  const [workMin, setWorkMin] = useState(25);
  const [breakMin, setBreakMin] = useState(5);
  const [showSettings, setShowSettings] = useState(false);

  // Состояние таймера
  const [mode, setMode] = useState('WORK'); // WORK | BREAK
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionStart, setSessionStart] = useState(null);

  // Цели
  const [goals, setGoals] = useState([]);
  const [selectedGoalId, setSelectedGoalId] = useState('');

  // Статистика
  const [stats, setStats] = useState(null);

  const timerRef = useRef(null);

  useEffect(() => {
    // Загружаем цели
    api.getGoals().then(setGoals).catch(console.error);
    // Загружаем статистику
    api.getFocusStats().then(setStats).catch(console.error);
  }, []);

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleTimerEnd();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isRunning]);

  const handleTimerEnd = async () => {
    setIsRunning(false);
    playBeep();

    if (mode === 'WORK') {
      // Записываем сессию
      const endedAt = new Date();
      const startedAt = new Date(endedAt.getTime() - workMin * 60 * 1000);
      try {
        await api.createFocusSession({
          goalId: selectedGoalId ? Number(selectedGoalId) : null,
          startedAt: startedAt.toISOString(),
          endedAt: endedAt.toISOString(),
          durationSeconds: workMin * 60,
          sessionType: 'WORK'
        });
        // Обновляем статистику
        api.getFocusStats().then(setStats);
      } catch (err) {
        console.error('Ошибка сохранения сессии:', err);
      }

      showToast(t('pomodoro_finished'), 'success');
      // Переключаем на отдых
      setMode('BREAK');
      setTimeLeft(breakMin * 60);
    } else {
      // Отдых закончился — обратно на работу
      showToast(t('pomodoro_work') + '!', 'info');
      setMode('WORK');
      setTimeLeft(workMin * 60);
    }
  };

  const handleStart = () => {
    if (!isRunning && !sessionStart) setSessionStart(new Date());
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setMode('WORK');
    setTimeLeft(workMin * 60);
    setSessionStart(null);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const totalDuration = mode === 'WORK' ? workMin * 60 : breakMin * 60;
  const progress = ((totalDuration - timeLeft) / totalDuration) * 100;

  // Форматируем общее время для статистики
  const formatHours = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h > 0) return `${h}ч ${m}м`;
    return `${m}м`;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 transition-colors">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">🍅 {t('pomodoro')}</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold py-2 px-4 rounded-lg transition"
            >
              ⚙️ {t('pomodoro_settings')}
            </button>
            <button
              onClick={() => navigate('/goals')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition"
            >
              {t('back_to_goals')}
            </button>
          </div>
        </div>

        {/* Настройки */}
        {showSettings && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 mb-6 animate-fade-in flex gap-4 flex-wrap">
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">{t('pomodoro_work_min')}</label>
              <input
                type="number" min="1" max="120"
                value={workMin}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  setWorkMin(v);
                  if (!isRunning && mode === 'WORK') setTimeLeft(v * 60);
                }}
                className="w-24 px-3 py-1 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">{t('pomodoro_break_min')}</label>
              <input
                type="number" min="1" max="60"
                value={breakMin}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  setBreakMin(v);
                  if (!isRunning && mode === 'BREAK') setTimeLeft(v * 60);
                }}
                className="w-24 px-3 py-1 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg"
              />
            </div>
          </div>
        )}

        {/* Таймер */}
        <div className={`rounded-3xl shadow-2xl p-8 mb-8 text-center transition-all duration-500 ${
          mode === 'WORK'
            ? 'bg-gradient-to-br from-red-500 to-pink-600'
            : 'bg-gradient-to-br from-green-500 to-emerald-600'
        }`}>
          <h2 className="text-2xl font-bold text-white mb-4 uppercase tracking-widest">
            {mode === 'WORK' ? `🎯 ${t('pomodoro_work')}` : `☕ ${t('pomodoro_break')}`}
          </h2>

          <div className="relative w-64 h-64 mx-auto mb-8 flex items-center justify-center">
            {/* Круговой прогресс (SVG) */}
            <svg className="absolute inset-0 w-full h-full transform -rotate-90">
              <circle cx="128" cy="128" r="120" stroke="rgba(255,255,255,0.2)" strokeWidth="8" fill="none" />
              <circle
                cx="128" cy="128" r="120"
                stroke="white" strokeWidth="8" fill="none"
                strokeDasharray={2 * Math.PI * 120}
                strokeDashoffset={2 * Math.PI * 120 * (1 - progress / 100)}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-linear"
              />
            </svg>
            <div className="text-6xl font-bold text-white font-mono">
              {formatTime(timeLeft)}
            </div>
          </div>

          <div className="flex justify-center gap-4">
            <button
              onClick={handleStart}
              className="bg-white text-gray-900 font-bold py-3 px-8 rounded-full shadow-lg hover:scale-105 transition"
            >
              {isRunning ? `⏸ ${t('pomodoro_pause')}` : `▶ ${t('pomodoro_start')}`}
            </button>
            <button
              onClick={handleReset}
              className="bg-white/20 text-white font-bold py-3 px-8 rounded-full hover:bg-white/30 transition"
            >
              🔄 {t('pomodoro_reset')}
            </button>
          </div>
        </div>

        {/* Привязка к цели */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 mb-8">
          <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
            {t('pomodoro_goal')}
          </label>
          <select
            value={selectedGoalId}
            onChange={(e) => setSelectedGoalId(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">— {t('pomodoro_no_goal')} —</option>
            {goals.map((g) => (
              <option key={g.id} value={g.id}>{g.title}</option>
            ))}
          </select>
        </div>

        {/* Статистика */}
        {stats && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 text-center">
                <div className="text-sm text-gray-500 dark:text-gray-400">{t('pomodoro_total_time')}</div>
                <div className="text-2xl font-bold text-gray-800 dark:text-white mt-1">{formatHours(stats.totalSeconds)}</div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 text-center">
                <div className="text-sm text-gray-500 dark:text-gray-400">{t('pomodoro_today_time')}</div>
                <div className="text-2xl font-bold text-gray-800 dark:text-white mt-1">{formatHours(stats.todaySeconds)}</div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 text-center col-span-2 md:col-span-1">
                <div className="text-sm text-gray-500 dark:text-gray-400">{t('pomodoro_sessions')}</div>
                <div className="text-2xl font-bold text-gray-800 dark:text-white mt-1">{stats.totalSessions}</div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">{t('pomodoro_weekly')}</h3>
              <div style={{ width: '100%', height: 250 }}>
                <ResponsiveContainer>
                  <BarChart data={stats.weeklyDistribution}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="day" stroke="#9ca3af" />
                    <YAxis
                      stroke="#9ca3af"
                      tickFormatter={(v) => `${Math.round(v / 60)}м`}
                    />
                    <Tooltip
                      formatter={(value) => [`${Math.round(value / 60)} мин`, t('pomodoro_total_time')]}
                      contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.9)', borderRadius: '8px', border: 'none', color: '#fff' }}
                    />
                    <Bar dataKey="seconds" fill="#ef4444" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}