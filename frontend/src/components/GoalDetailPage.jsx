import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { showToast } from './Toast';

export default function GoalDetailPage() {
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
        showToast('Не удалось загрузить цель', 'error');
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
      showToast('Цель обновлена!', 'success');
    } catch (error) {
      showToast('Ошибка при сохранении: ' + error.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Вы уверены, что хотите удалить эту цель?')) return;
    try {
      await api.deleteGoal(id);
      showToast('Цель удалена', 'success');
      navigate('/goals');
    } catch (error) {
      showToast('Ошибка при удалении: ' + error.message, 'error');
    }
  };

  if (loading) return <p className="text-center mt-10 text-gray-500 dark:text-gray-400">Загрузка...</p>;
  if (!goal) return <p className="text-center mt-10 text-red-500">Цель не найдена</p>;

  const percent = Math.min((goal.currentValue / goal.targetValue) * 100, 100);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 transition-colors">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => navigate('/goals')}
          className="mb-4 text-blue-600 dark:text-blue-400 hover:underline font-semibold"
        >
          ← Назад к целям
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
            Прогресс: {goal.currentValue} / {goal.targetValue} ({Math.round(percent)}%)
          </p>

          {!isEditing ? (
            <div className="flex gap-3 flex-wrap">
              <button
                onClick={startEditing}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition"
              >
                ✏️ Редактировать
              </button>
              <button
                onClick={handleDelete}
                className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition"
              >
                🗑️ Удалить цель
              </button>
            </div>
          ) : (
            <form onSubmit={handleSave} className="space-y-4 border-t dark:border-gray-700 pt-4 mt-4">
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200">Редактирование цели</h3>
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Название</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Описание</label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Целевое значение</label>
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
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Дедлайн</label>
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
                  {saving ? 'Сохранение...' : '💾 Сохранить'}
                </button>
                <button
                  type="button"
                  onClick={cancelEditing}
                  className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold py-2 px-4 rounded-lg transition"
                >
                  Отмена
                </button>
              </div>
            </form>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 animate-fade-in transition-colors">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">История прогресса</h2>
          {history.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-4">Прогресс ещё не добавлялся</p>
          ) : (
            <ul className="space-y-2">
              {history.map((entry) => (
                <li
                  key={entry.id}
                  className="flex justify-between items-center border-b border-gray-100 dark:border-gray-700 py-2 last:border-0"
                >
                  <span className="text-gray-600 dark:text-gray-300">
                    {new Date(entry.date).toLocaleString('ru-RU')}
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