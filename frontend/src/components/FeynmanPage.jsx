import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../api';
import { showToast } from './Toast';

export default function FeynmanPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const presetTopicId = searchParams.get('topic');

  const [topics, setTopics] = useState([]);
  const [entries, setEntries] = useState([]);
  const [streak, setStreak] = useState(null);
  const [selectedTopicId, setSelectedTopicId] = useState(presetTopicId || '');
  const [explanation, setExplanation] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const [allTopics, allEntries, streakData] = await Promise.all([
        api.getAllStudyTopics(),
        api.getAllFeynman(),
        api.getFeynmanStreak(),
      ]);
      setTopics(allTopics);
      setEntries(allEntries);
      setStreak(streakData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTopicId) {
      showToast(t('feynman_select_topic'), 'warning');
      return;
    }
    setSaving(true);
    try {
      await api.createFeynman({
        topicId: Number(selectedTopicId),
        explanation,
      });
      setExplanation('');
      await load();
      showToast('✓', 'success');
    } catch (err) {
      showToast('Error: ' + err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  // Группировка истории по дате
  const groupedByDate = entries.reduce((acc, e) => {
    const d = new Date(e.createdAt).toLocaleDateString();
    if (!acc[d]) acc[d] = [];
    acc[d].push(e);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 transition-colors">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
              ✍️ {t('feynman_title')}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {t('feynman_subtitle')}
            </p>
          </div>
          <button
            onClick={() => navigate('/study')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition"
          >
            {t('back_to_goals')}
          </button>
        </div>

        {/* Streak-панель */}
        {streak && (
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-gradient-to-br from-orange-400 to-red-500 text-white rounded-xl shadow-md p-4 text-center">
              <div className="text-3xl font-bold">🔥 {streak.currentStreak}</div>
              <div className="text-xs mt-1 opacity-90">{t('feynman_streak_days')}</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 text-center transition-colors">
              <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                🏆 {streak.longestStreak}
              </div>
              <div className="text-xs mt-1 text-gray-500 dark:text-gray-400">
                {t('feynman_longest')}
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 text-center transition-colors">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                📝 {streak.totalEntries}
              </div>
              <div className="text-xs mt-1 text-gray-500 dark:text-gray-400">
                {t('feynman_total')}
              </div>
            </div>
          </div>
        )}

        {streak && (
          <div className={`mb-6 p-3 rounded-lg text-center font-semibold ${
            streak.wroteToday
              ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
              : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200'
          }`}>
            {streak.wroteToday ? t('feynman_wrote_today') : t('feynman_not_wrote_today')}
          </div>
        )}

        {/* Форма */}
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6 animate-fade-in transition-colors">
          <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">
            ✍️ {t('feynman_title')}
          </h2>

          <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
            {t('feynman_choose_topic')}
          </label>
          <select
            value={selectedTopicId}
            onChange={(e) => setSelectedTopicId(e.target.value)}
            className="w-full px-4 py-2 mb-4 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">— {t('feynman_select_topic')} —</option>
            {topics.map((topic) => (
              <option key={topic.id} value={topic.id}>
                {topic.module} — {topic.title}
              </option>
            ))}
          </select>

          <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
            {t('feynman_write')}
          </label>
          <textarea
            value={explanation}
            onChange={(e) => setExplanation(e.target.value)}
            required
            rows={6}
            placeholder="Например: HashMap — это как почтовое отделение..."
            className="w-full px-4 py-2 mb-4 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold py-3 rounded-lg transition"
          >
            {saving ? '...' : t('feynman_submit')}
          </button>
        </form>

        {/* История */}
        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
          {t('feynman_history')}
        </h2>

        {loading ? (
          <p className="text-center text-gray-500 dark:text-gray-400">Loading...</p>
        ) : entries.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400">{t('feynman_empty')}</p>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedByDate).map(([date, dayEntries]) => (
              <div key={date}>
                <h3 className="text-sm font-bold text-indigo-600 dark:text-indigo-400 mb-2">
                  📅 {date}
                </h3>
                <div className="space-y-3">
                  {dayEntries.map((entry) => (
                    <div
                      key={entry.id}
                      className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 animate-fade-in-up transition-colors"
                    >
                      <div className="text-xs uppercase tracking-wide text-blue-500 dark:text-blue-400 font-bold mb-1">
                        {entry.topicTitle}
                      </div>
                      <p className="text-gray-700 dark:text-gray-200 whitespace-pre-wrap">
                        {entry.explanation}
                      </p>
                      <div className="text-xs text-gray-400 mt-2">
                        {new Date(entry.createdAt).toLocaleTimeString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}