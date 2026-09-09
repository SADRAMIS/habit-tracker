import { useEffect, useState } from 'react';
import { api } from '../api';
import { useNavigate } from 'react-router-dom';

export default function GoalsPage({ onLogout }) {
  const navigate = useNavigate();
  const [goals, setGoals] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetValue, setTargetValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [progressValues, setProgressValues] = useState({});
  const [loadingGoalId, setLoadingGoalId] = useState(null);

  const loadGoals = async () => {
    const data = await api.getGoals();
    setGoals(data);
  };

  useEffect(() => {
    loadGoals();
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
    } catch (error) {
      alert('Ошибка при создании цели: ' + error.message);
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
      alert('Не удалось завершить цель');
      setLoadingGoalId(null);
    }
  };

  const handleAddProgress = async (goalId) => {
    const value = progressValues[goalId];
    if (!value || isNaN(value)) {
      alert('Введите число для прогресса');
      return;
    }
    try {
      await api.addProgress({ goalId, progressValue: parseFloat(value), date: new Date().toISOString() });
      setProgressValues((prev) => ({ ...prev, [goalId]: '' }));
      await loadGoals();
    } catch (error) {
      alert('Ошибка при добавлении прогресса: ' + error.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    onLogout();
    navigate('/');
  };

  const getStatusColor = (status) => {
    if (status === 'COMPLETED') return 'bg-green-100 text-green-700';
    if (status === 'EXPIRED') return 'bg-red-100 text-red-700';
    return 'bg-yellow-100 text-yellow-700';
  };

  return (
    <div className="max-w-4xl mx-auto p-4 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">Мои цели</h1>

      {/* Форма создания */}
      <form onSubmit={handleCreateGoal} className="bg-white rounded-xl shadow-md p-6 mb-8">
        <h3 className="text-xl font-semibold text-gray-700 mb-4">Новая цель</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input placeholder="Название" value={title} onChange={(e) => setTitle(e.target.value)} required className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <input placeholder="Описание" value={description} onChange={(e) => setDescription(e.target.value)} className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <input placeholder="Целевое значение" type="number" value={targetValue} onChange={(e) => setTargetValue(e.target.value)} required className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <button type="submit" disabled={loading} className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg transition">
          {loading ? 'Создание...' : 'Создать'}
        </button>
      </form>

      {/* Список целей */}
      {goals.length === 0 ? (
        <p className="text-center text-gray-500 mt-10">Пока нет целей. Создайте первую!</p>
      ) : (
        <div className="space-y-4">
          {goals.map((goal) => (
            <div key={goal.id} className="bg-white rounded-xl shadow-md p-5">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-bold text-gray-800">{goal.title}</h3>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(goal.status)}`}>
                  {goal.status}
                </span>
              </div>
              <p className="text-gray-600 mb-4">{goal.description}</p>

              {/* Прогресс-бар */}
              <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                <div
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((goal.currentValue / goal.targetValue) * 100, 100)}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-500 mb-4">
                Прогресс: {goal.currentValue} / {goal.targetValue}
              </p>

              {/* Кнопки действий */}
              {goal.status === 'IN_PROGRESS' && (
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => completeGoal(goal.id)}
                    disabled={loadingGoalId === goal.id}
                    className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition disabled:opacity-50"
                  >
                    {loadingGoalId === goal.id ? 'Обработка...' : 'Завершить'}
                  </button>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Сколько добавить?"
                      value={progressValues[goal.id] || ''}
                      onChange={(e) => setProgressValues((prev) => ({ ...prev, [goal.id]: e.target.value }))}
                      className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={() => handleAddProgress(goal.id)}
                      className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg transition"
                    >
                      Добавить
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <button
        onClick={handleLogout}
        className="mt-10 w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2 rounded-lg transition"
      >
        Выйти
      </button>
    </div>
  );
}