import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from 'recharts';
import { api } from '../api';

export default function MemoryStatsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.getMemoryStats();
        setStats(data);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 flex items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400">Loading...</p>
      </div>
    );
  }

  if (!stats || stats.totalCards === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate('/memorize')}
            className="mb-4 text-blue-600 dark:text-blue-400 hover:underline font-semibold"
          >
            {t('memory_back')}
          </button>
          <p className="text-center text-gray-500 dark:text-gray-400 mt-20">
            {t('memory_empty')}
          </p>
        </div>
      </div>
    );
  }

  // Цвета для кривой забывания
  const bucketColors = ['#ef4444', '#f59e0b', '#eab308', '#10b981', '#059669'];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 transition-colors">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
              📊 {t('memory_stats')}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {t('memory_stats_subtitle')}
            </p>
          </div>
          <button
            onClick={() => navigate('/memorize')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition"
          >
            {t('memory_back')}
          </button>
        </div>

        {/* Карточки-показатели */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard label={t('memory_total')} value={stats.totalCards} color="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" icon="🗂" />
          <StatCard label={t('memory_due_today')} value={stats.dueToday} color="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" icon="⏰" />
          <StatCard label={t('memory_mature')} value={stats.matureCards} color="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" icon="🌳" />
          <StatCard label={t('memory_new')} value={stats.newCards} color="bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200" icon="🆕" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          <MiniStat label={t('memory_young')} value={stats.youngCards} />
          <MiniStat label={t('memory_avg_ease')} value={stats.avgEaseFactor.toFixed(2)} />
          <MiniStat label={t('memory_avg_interval')} value={`${stats.avgIntervalDays.toFixed(1)} д.`} />
          <MiniStat label={t('memory_total_reviews')} value={stats.totalReviews} />
        </div>

        {/* Кривая забывания */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6 animate-fade-in transition-colors">
          <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-1">
            {t('memory_curve')}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            {t('memory_curve_desc')}
          </p>
          <div style={{ width: '100%', height: 320 }}>
            <ResponsiveContainer>
              <BarChart data={stats.intervalDistribution}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="label" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" fontSize={12} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(31, 41, 55, 0.95)',
                    borderRadius: '8px',
                    border: 'none',
                    color: '#fff',
                  }}
                />
                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                  {stats.intervalDistribution.map((entry, index) => (
                    <Cell key={index} fill={bucketColors[index]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Легенда */}
          <div className="flex justify-center gap-4 mt-4 flex-wrap text-xs">
            <span className="text-gray-600 dark:text-gray-300">
              🔴 <strong>0–1 д.</strong> — забываешь
            </span>
            <span className="text-gray-600 dark:text-gray-300">
              🟡 <strong>2–6 д.</strong> — учишь
            </span>
            <span className="text-gray-600 dark:text-gray-300">
              🟢 <strong>21+ д.</strong> — в долгой памяти
            </span>
          </div>
        </div>

        {/* Самые сложные карточки */}
        {stats.hardestCards.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 animate-fade-in transition-colors">
            <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-1">
              {t('memory_hardest')}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              {t('memory_hardest_desc')}
            </p>
            <div className="space-y-2">
              {stats.hardestCards.map((card) => (
                <div
                  key={card.id}
                  className="flex justify-between items-center p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="font-semibold text-gray-800 dark:text-white">
                      {card.topic}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {t('memory_ease_short')}: {card.easeFactor.toFixed(2)} · {t('memory_interval_short')}: {card.intervalDays} д. · {t('memory_reps_short')}: {card.repetitions}
                    </div>
                  </div>
                  <span className="text-red-500 text-2xl ml-4">🔥</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, color, icon }) {
  return (
    <div className={`rounded-xl shadow-md p-5 text-center transition-colors ${color}`}>
      <div className="text-3xl mb-1">{icon}</div>
      <div className="text-3xl font-bold">{value}</div>
      <div className="text-xs font-medium opacity-80 mt-1">{label}</div>
    </div>
  );
}

function MiniStat({ label, value }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 text-center transition-colors">
      <div className="text-2xl font-bold text-gray-800 dark:text-white">{value}</div>
      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{label}</div>
    </div>
  );
}