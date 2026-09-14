import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api';

export default function GoalDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [goal, setGoal] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const goalData = await api.getGoalById(id);
        const historyData = await api.getProgressHistory(id);
        setGoal(goalData);
        setHistory(historyData);
      } catch (error) {
        console.error('Ошибка загрузки:', error);
        alert('Не удалось загрузить цель');
        navigate('/goals');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, navigate]);

  const handleDelete = async () => {
    if (!window.confirm('Вы уверены, что хотите удалить эту цель?')) return;
    try {
      await api.deleteGoal(id);
      navigate('/goals');
    } catch (error) {
      alert('Ошибка при удалении: ' + error.message);
    }
  };

  if (loading) return <p className="text-center mt-10 text-gray-500">Загрузка...</p>;
  if (!goal) return <p className="text-center mt-10 text-red-500">Цель не найдена</p>;

  const percent = Math.min((goal.currentValue / goal.targetValue) * 100, 100);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => navigate('/goals')}
          className="mb-4 text-blue-600 hover:underline font-semibold"
        >
          ← Назад к целям
        </button>

        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex justify-between items-start mb-3">
            <h1 className="text-3xl font-bold text-gray-800">{goal.title}</h1>
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
              goal.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
              goal.status === 'EXPIRED' ? 'bg-red-100 text-red-700' :
              'bg-yellow-100 text-yellow-700'
            }`}>
              {goal.status}
            </span>
          </div>
          <p className="text-gray-600 mb-4">{goal.description}</p>

          <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
            <div
              className="bg-blue-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${percent}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-500 mb-6">
            Прогресс: {goal.currentValue} / {goal.targetValue} ({Math.round(percent)}%)
          </p>

          <button
            onClick={handleDelete}
            className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition"
          >
            Удалить цель
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">История прогресса</h2>
          {history.length === 0 ? (
            <p className="text-gray-500 text-center py-4">Прогресс ещё не добавлялся</p>
          ) : (
            <ul className="space-y-2">
              {history.map((entry) => (
                <li
                  key={entry.id}
                  className="flex justify-between items-center border-b border-gray-100 py-2 last:border-0"
                >
                  <span className="text-gray-600">
                    {new Date(entry.date).toLocaleString('ru-RU')}
                  </span>
                  <span className="font-semibold text-blue-600">
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