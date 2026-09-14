import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';

export default function DashboardPage() {
  const navigate = useNavigate();
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.getGoals();
        setGoals(data);
      } catch (error) {
        console.error('Ошибка загрузки целей:', error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Подсчет статистики
  const total = goals.length;
  const completed = goals.filter(g => g.status === 'COMPLETED').length;
  const inProgress = goals.filter(g => g.status === 'IN_PROGRESS').length;
  const expired = goals.filter(g => g.status === 'EXPIRED').length;

  const totalProgress = goals.reduce((acc, g) => {
    const current = g.currentValue || 0;
    const target = g.targetValue || 1;
    return acc + Math.min(current / target, 1);
  }, 0);
  const overallPercent = total > 0 ? Math.round((totalProgress / total) * 100) : 0;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Статистика</h1>
          <button
            onClick={() => navigate('/goals')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition"
          >
            ← К целям
          </button>
        </div>

        {loading ? (
          <p className="text-center text-gray-500 mt-10">Загрузка...</p>
        ) : (
          <>
            {/* Карточки с числами */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <StatCard title="Всего целей" value={total} color="bg-blue-100 text-blue-800" />
              <StatCard title="Завершено" value={completed} color="bg-green-100 text-green-800" />
              <StatCard title="В процессе" value={inProgress} color="bg-yellow-100 text-yellow-800" />
              <StatCard title="Просрочено" value={expired} color="bg-red-100 text-red-800" />
            </div>

            {/* Общий прогресс */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-700 mb-4">Общий прогресс</h2>
              <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
                <div
                  className="bg-gradient-to-r from-blue-500 to-purple-600 h-4 rounded-full transition-all duration-700"
                  style={{ width: `${overallPercent}%` }}
                ></div>
              </div>
              <p className="text-right text-sm text-gray-600">{overallPercent}%</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function StatCard({ title, value, color }) {
  return (
    <div className={`rounded-xl shadow-md p-5 text-center ${color}`}>
      <p className="text-sm font-medium opacity-80">{title}</p>
      <p className="text-3xl font-bold mt-1">{value}</p>
    </div>
  );
}