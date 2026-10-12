import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { showToast } from './Toast';
import HabitHeatmap from './HabitHeatmap';

const PRESET_ICONS = ['✅', '💧', '🏃', '📚', '🧘', '💪', '🍎', '😴', '✍️', '🎯', '🎨', '🎸', '🌱', '☀️', '🚭', '🧹'];
const PRESET_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

export default function HabitsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);

  // Форма создания
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('✅');
  const [color, setColor] = useState('#3b82f6');
  const [targetPerDay, setTargetPerDay] = useState(1);
  const [saving, setSaving] = useState(false);

  // Heatmap
  const [expandedHabitId, setExpandedHabitId] = useState(null);

  const load = async () => {
    try {
      const data = await api.getAllHabits();
      setHabits(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.createHabit({
        title,
        description,
        icon,
        color,
        frequency: 'daily',
        targetPerDay: Number(targetPerDay),
      });
      setTitle('');
      setDescription('');
      setIcon('✅');
      setColor('#3b82f6');
      setTargetPerDay(1);
      setShowForm(false);
      await load();
      showToast('✓', 'success');
    } catch (err) {
      showToast('Error: ' + err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (id) => {
    try {
      await api.toggleHabit(id);
      await load();
    } catch (err) {
      showToast('Error: ' + err.message, 'error');
    }
  };

  const handleIncrement = async (id) => {
    try {
      await api.incrementHabit(id);
      await load();
    } catch (err) {
      showToast('Error: ' + err.message, 'error');
    }
  };

  const handleDelete = async (id, habitTitle) => {
    if (!window.confirm(`Delete "${habitTitle}"?`)) return;
    try {
      await api.deleteHabit(id);
      await load();
      showToast('✓', 'success');
    } catch (err) {
      showToast('Error: ' + err.message, 'error');
    }
  };

  // Прогресс за сегодня
  const totalHabits = habits.length;
  const doneHabits = habits.filter((h) => h.doneToday).length;
  const todayPercent = totalHabits > 0 ? Math.round((doneHabits / totalHabits) * 100) : 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 transition-colors">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
            🔥 {t('habits')}
          </h1>
          <div className="flex gap-2">
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-4 rounded-lg transition"
            >
              {showForm ? '✕' : '＋ ' + t('new_habit')}
            </button>
            <button
              onClick={() => navigate('/goals')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition"
            >
              {t('back_to_goals')}
            </button>
          </div>
        </div>

        {/* Прогресс за сегодня */}
        {totalHabits > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6 animate-fade-in transition-colors">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200">
                {t('habit_progress_today')}
              </h2>
              <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {t('habit_completed_count', { done: doneHabits, total: totalHabits })}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-emerald-500 to-green-500 h-3 rounded-full transition-all duration-700"
                style={{ width: `${todayPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* Форма создания */}
        {showForm && (
          <form
            onSubmit={handleCreate}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6 animate-fade-in transition-colors"
          >
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">
              {t('new_habit')}
            </h3>

            <input
              placeholder={t('habit_title')}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-4 py-2 mb-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              placeholder={t('habit_description')}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 mb-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            {/* Icon picker */}
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
              {t('habit_icon')}
            </label>
            <div className="flex flex-wrap gap-2 mb-4">
              {PRESET_ICONS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setIcon(emoji)}
                  className={`w-10 h-10 text-xl rounded-lg transition ${
                    icon === emoji
                      ? 'bg-emerald-500 ring-2 ring-emerald-300 scale-110'
                      : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>

            {/* Color picker */}
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
              {t('habit_color')}
            </label>
            <div className="flex flex-wrap gap-2 mb-4">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full transition ${
                    color === c ? 'ring-4 ring-offset-2 ring-gray-400 dark:ring-offset-gray-800 scale-110' : ''
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>

            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
              {t('habit_target')}
            </label>
            <input
              type="number"
              min="1"
              max="50"
              value={targetPerDay}
              onChange={(e) => setTargetPerDay(e.target.value)}
              className="w-full px-4 py-2 mb-4 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold py-3 rounded-lg transition"
            >
              {saving ? '...' : t('habit_create')}
            </button>
          </form>
        )}

        {/* Список привычек */}
        {loading ? (
          <p className="text-center text-gray-500 dark:text-gray-400">Loading...</p>
        ) : habits.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400 mt-10">
            {t('habit_no_habits')}
          </p>
        ) : (
          <div className="space-y-3">
            {habits.map((habit) => {
              const isCountable = habit.targetPerDay > 1;
              const progress = isCountable
                ? Math.min((habit.todayCount / habit.targetPerDay) * 100, 100)
                : habit.doneToday ? 100 : 0;

              return (
                <div
                  key={habit.id}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 animate-fade-in-up transition-colors"
                  style={{ borderLeft: `4px solid ${habit.color}` }}
                >
                  <div className="flex items-start gap-4">
                    {/* Кнопка-эмодзи */}
                    <button
                      onClick={() => handleToggle(habit.id)}
                      className={`flex-shrink-0 w-14 h-14 rounded-2xl text-3xl flex items-center justify-center transition-all duration-200 ${
                        habit.doneToday
                          ? 'scale-105'
                          : 'bg-gray-100 dark:bg-gray-700 hover:scale-105 opacity-60'
                      }`}
                      style={{
                        backgroundColor: habit.doneToday ? habit.color : undefined,
                      }}
                      title={habit.doneToday ? t('habit_done') : t('habit_not_done')}
                    >
                      {habit.doneToday ? '✓' : habit.icon}
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className={`font-bold text-lg ${habit.doneToday ? 'line-through text-gray-400' : 'text-gray-800 dark:text-white'}`}>
                          {habit.title}
                        </h3>
                        {habit.currentStreak > 0 && (
                          <span className="text-xs bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 px-2 py-0.5 rounded-full font-semibold">
                            🔥 {habit.currentStreak}
                          </span>
                        )}
                      </div>
                      {habit.description && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                          {habit.description}
                        </p>
                      )}

                      {isCountable && (
                        <div className="mt-2">
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-1">
                            <div
                              className="h-2 rounded-full transition-all duration-500"
                              style={{
                                width: `${progress}%`,
                                backgroundColor: habit.color,
                              }}
                            />
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {habit.todayCount} / {habit.targetPerDay}
                          </p>
                        </div>
                      )}

                      <div className="flex gap-3 mt-2 text-xs text-gray-500 dark:text-gray-400 flex-wrap">
                        <span>🏆 {t('habit_longest')}: {habit.longestStreak} {t('habit_days')}</span>
                        <span>📊 {t('habit_total')}: {habit.totalCompletions}</span>
                      </div>

                      <button
                        onClick={() => setExpandedHabitId(expandedHabitId === habit.id ? null : habit.id)}
                        className="mt-2 text-xs text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        📅 {expandedHabitId === habit.id ? 'Скрыть график' : 'Показать график'}
                      </button>
                    </div>

                    <div className="flex flex-col gap-1 items-end">
                      {isCountable && (
                        <button
                          onClick={() => handleIncrement(habit.id)}
                          className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 font-bold hover:bg-blue-200 dark:hover:bg-blue-900/60 transition"
                          title={t('habit_increment')}
                        >
                          +1
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(habit.id, habit.title)}
                        className="w-9 h-9 rounded-lg bg-red-50 dark:bg-red-900/40 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/60 transition text-sm"
                        title={t('habit_delete')}
                      >
                        🗑
                      </button>
                    </div>
                  </div>

                  {/* Heatmap */}
                  {expandedHabitId === habit.id && (
                    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                      <HabitHeatmap dates={habit.recentDates || []} color={habit.color} weeks={20} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}