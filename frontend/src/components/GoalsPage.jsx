import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../api';
import { useNavigate } from 'react-router-dom';
import { showToast } from './Toast';
import { SkeletonGoalCard } from './Skeleton';

export default function GoalsPage({ onLogout }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [goals, setGoals] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetValue, setTargetValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [progressValues, setProgressValues] = useState({});
  const [loadingGoalId, setLoadingGoalId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const loadGoals = async () => {
    try {
      const data = await api.getGoals();
      setGoals(data);
    } finally {
      setInitialLoading(false);
    }
  };

      useEffect(() => {
        loadGoals();

        const interval = setInterval(() => {
          // Обновляем только если вкладка активна
          if (!document.hidden) {
            loadGoals();
          }
        }, 10000);

        return () => clearInterval(interval);
      }, []);

  const handleCreateGoal = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.createGoal({
        title,
        description,
        targetValue: parseFloat(targetValue),
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      });
      setTitle('');
      setDescription('');
      setTargetValue('');
      await loadGoals();
      showToast('✓', 'success');
    } catch (error) {
      showToast('Error: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const completeGoal = async (goalId) => {
    try {
      await api.completeGoal(goalId);
      setLoadingGoalId(goalId);
      setTimeout(async () => {
        await loadGoals();
        setLoadingGoalId(null);
      }, 3000);
    } catch (error) {
      console.error('Ошибка при завершении цели:', error);
      showToast('Error', 'error');
      setLoadingGoalId(null);
    }
  };

  const handleAddProgress = async (goalId) => {
    const value = progressValues[goalId];
    if (!value || isNaN(value)) {
      showToast('Warning', 'warning');
      return;
    }
    try {
      await api.addProgress({ goalId, progressValue: parseFloat(value), date: new Date().toISOString() });
      setProgressValues((prev) => ({ ...prev, [goalId]: '' }));
      showToast('✓', 'success');
      await loadGoals();
    } catch (error) {
      showToast('Error: ' + error.message, 'error');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    onLogout();
    navigate('/');
  };

  const getStatusColor = (status) => {
    if (status === 'COMPLETED') return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300';
    if (status === 'EXPIRED') return 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300';
    return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300';
  };

  const filteredGoals = goals.filter((goal) => {
    const matchesSearch =
      goal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (goal.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || goal.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="max-w-4xl mx-auto p-4 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors">
      <h1 className="text-3xl font-bold text-center text-gray-800 dark:text-white mb-6">
        {t('my_goals')}
      </h1>

      <form onSubmit={handleCreateGoal} className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6 animate-fade-in transition-colors">
        <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">{t('new_goal')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input placeholder={t('title')} value={title} onChange={(e) => setTitle(e.target.value)} required className="px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <input placeholder={t('description')} value={description} onChange={(e) => setDescription(e.target.value)} className="px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <input placeholder={t('target_value')} type="number" value={targetValue} onChange={(e) => setTargetValue(e.target.value)} required className="px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <button type="submit" disabled={loading} className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg transition">
          {loading ? t('creating') : t('create')}
        </button>
      </form>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 mb-6 animate-fade-in transition-colors">
        <div className="flex flex-col md:flex-row gap-3">
          <input
            type="text"
            placeholder={t('search_placeholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex gap-2 flex-wrap">
            <FilterButton active={statusFilter === 'ALL'} onClick={() => setStatusFilter('ALL')}>{t('filter_all')}</FilterButton>
            <FilterButton active={statusFilter === 'IN_PROGRESS'} onClick={() => setStatusFilter('IN_PROGRESS')}>{t('filter_active')}</FilterButton>
            <FilterButton active={statusFilter === 'COMPLETED'} onClick={() => setStatusFilter('COMPLETED')}>{t('filter_completed')}</FilterButton>
            <FilterButton active={statusFilter === 'EXPIRED'} onClick={() => setStatusFilter('EXPIRED')}>{t('filter_expired')}</FilterButton>
          </div>
        </div>
      </div>

      {initialLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <SkeletonGoalCard key={i} />
          ))}
        </div>
      ) : filteredGoals.length === 0 ? (
        <p className="text-center text-gray-500 dark:text-gray-400 mt-10">
          {goals.length === 0 ? t('no_goals') : t('nothing_found')}
        </p>
      ) : (
        <div className="space-y-4">
          {filteredGoals.map((goal, index) => (
            <div
              key={goal.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-5 animate-fade-in-up hover:shadow-lg transition-shadow duration-300"
              style={{ animationDelay: `${index * 60}ms` }}
            >
              <div className="flex justify-between items-start mb-2">
                <h3
                  onClick={() => navigate(`/goals/${goal.id}`)}
                  className="text-xl font-bold text-gray-800 dark:text-white cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition"
                >
                  {goal.title}
                </h3>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(goal.status)}`}>
                  {goal.status}
                </span>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-4">{goal.description}</p>

              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-2">
                <div
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${Math.min((goal.currentValue / goal.targetValue) * 100, 100)}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                {t('progress')}: {goal.currentValue} / {goal.targetValue}
              </p>

              {goal.status === 'IN_PROGRESS' && (
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => completeGoal(goal.id)}
                    disabled={loadingGoalId === goal.id}
                    className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition disabled:opacity-50"
                  >
                    {loadingGoalId === goal.id ? t('processing') : t('complete')}
                  </button>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder={t('add_placeholder')}
                      value={progressValues[goal.id] || ''}
                      onChange={(e) => setProgressValues((prev) => ({ ...prev, [goal.id]: e.target.value }))}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={() => handleAddProgress(goal.id)}
                      className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg transition"
                    >
                      {t('add')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="mt-10 flex gap-3 flex-wrap">
        <button onClick={() => navigate('/dashboard')} className="flex-1 min-w-[120px] bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg transition">{t('statistics')}</button>
        <button onClick={() => navigate('/export')} className="flex-1 min-w-[120px] bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded-lg transition">{t('export')}</button>
        <button onClick={() => navigate('/profile')} className="flex-1 min-w-[120px] bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 rounded-lg transition">{t('profile')}</button>
        <button onClick={handleLogout} className="flex-1 min-w-[120px] bg-red-500 hover:bg-red-600 text-white font-bold py-2 rounded-lg transition">{t('logout')}</button>
      </div>
    </div>
  );
}

function FilterButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
        active
          ? 'bg-blue-600 text-white shadow-md'
          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
      }`}
    >
      {children}
    </button>
  );
}