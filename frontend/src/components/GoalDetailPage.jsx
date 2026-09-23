import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { showToast } from './Toast';
import { SkeletonHistoryItem } from './Skeleton';

export default function GoalDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [goal, setGoal] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editTargetValue, setEditTargetValue] = useState('');
  const [editDeadline, setEditDeadline] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const goalData = await api.getGoalById(id);
        const historyData = await api.getProgressHistory(id);
        setGoal(goalData);
        setHistory(historyData);
      } catch (error) {
        console.error('Ошибка загрузки:', error);
        showToast('Error', 'error');
        navigate('/goals');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, navigate]);

  const startEditing = () => {
    setEditTitle(goal.title);
    setEditDescription(goal.description || '');
    setEditTargetValue(goal.targetValue.toString());
    const d = new Date(goal.deadline);
    const localISO = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    setEditDeadline(localISO);
    setIsEditing(true);
  };

  const cancelEditing = () => setIsEditing(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await api.updateGoal(id, {
        title: editTitle,
        description: editDescription,
        targetValue: parseFloat(editTargetValue),
        deadline: new Date(editDeadline).toISOString(),
      });
      setGoal(updated);
      setIsEditing(false);
      showToast('✓', 'success');
    } catch (error) {
      showToast('Error: ' + error.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('OK?')) return;
    try {
      await api.deleteGoal(id);
      showToast('✓', 'success');
      navigate('/goals');
    } catch (error) {
      showToast('Error: ' + error.message, 'error');
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6 animate-pulse">
          <div className="h-8 w-1/2 bg-gray-200 dark:bg-gray-700 rounded mb-3" />
          <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
          <div className="h-3 w-full bg-gray-200 dark:bg-gray-700 rounded-full mb-2" />
          <div className="h-4 w-1/3 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <div className="h-6 w-1/3 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
          {[1, 2, 3].map((i) => (
            <SkeletonHistoryItem key={i} />
          ))}
        </div>
      </div>
    </div>
  );

  if (!goal) return <p className="text-center mt-10 text-red-500">Not found</p>;

  const percent = Math.min((goal.currentValue / goal.targetValue) * 100, 100);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 transition-colors">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => navigate('/goals')}
          className="mb-4 text-blue-600 dark:text-blue-400 hover:underline font-semibold"
        >
          {t('back_to_goals')}
        </button>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6 animate-fade-in transition-colors">
          <div className="flex justify-between items-start mb-3">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">{goal.title}</h1>
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
              goal.status === 'COMPLETED' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
              goal.status === 'EXPIRED' ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' :
              'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
            }`}>
              {goal.status}
            </span>
          </div>
          <p className="text-gray-600 dark:text-gray-300 mb-4">{goal.description}</p>

          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-2">
            <div
              className="bg-blue-600 h-3 rounded-full transition-all duration-700"
              style={{ width: `${percent}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            {t('progress')}: {goal.currentValue} / {goal.targetValue} ({Math.round(percent)}%)
          </p>

          {!isEditing ? (
            <div className="flex gap-3 flex-wrap">
              <button
                onClick={startEditing}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition"
              >
                {t('edit')}
              </button>
              <button
                onClick={handleDelete}
                className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition"
              >
                {t('delete_goal')}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSave} className="space-y-4 border-t dark:border-gray-700 pt-4 mt-4">
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200">{t('editing_goal')}</h3>
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">{t('title')}</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">{t('description')}</label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">{t('target_value')}</label>
                  <input
                    type="number"
                    step="any"
                    value={editTargetValue}
                    onChange={(e) => setEditTargetValue(e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">{t('deadline')}</label>
                  <input
                    type="datetime-local"
                    value={editDeadline}
                    onChange={(e) => setEditDeadline(e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="flex gap-3 flex-wrap">
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-semibold py-2 px-4 rounded-lg transition"
                >
                  {saving ? t('saving') : t('save')}
                </button>
                <button
                  type="button"
                  onClick={cancelEditing}
                  className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold py-2 px-4 rounded-lg transition"
                >
                  {t('cancel')}
                </button>
              </div>
            </form>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 animate-fade-in transition-colors">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">{t('history')}</h2>
          {history.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-4">{t('no_history')}</p>
          ) : (
            <ul className="space-y-2">
              {history.map((entry) => (
                <li
                  key={entry.id}
                  className="flex justify-between items-center border-b border-gray-100 dark:border-gray-700 py-2 last:border-0"
                >
                  <span className="text-gray-600 dark:text-gray-300">
                    {new Date(entry.date).toLocaleString()}
                  </span>
                  <span className="font-semibold text-blue-600 dark:text-blue-400">
                    +{entry.progressValue}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}