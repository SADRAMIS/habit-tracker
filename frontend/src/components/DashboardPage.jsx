import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend
} from 'recharts';
import { api } from '../api';
import { SkeletonStatCard } from './Skeleton';

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

  // Данные для круговой диаграммы
  const pieData = [
    { name: 'Завершено', value: completed, color: '#10b981' },
    { name: 'В процессе', value: inProgress, color: '#f59e0b' },
    { name: 'Просрочено', value: expired, color: '#ef4444' },
  ].filter((item) => item.value > 0);

  // Данные для столбчатой диаграммы (прогресс каждой цели в %)
  const barData = goals.map((g) => ({
    name: g.title.length > 12 ? g.title.slice(0, 12) + '…' : g.title,
    Прогресс: Math.round(Math.min((g.currentValue / g.targetValue) * 100, 100)),
  }));

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 transition-colors">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Статистика</h1>
          <button
            onClick={() => navigate('/goals')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition"
          >
            ← К целям
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <SkeletonStatCard key={i} />
            ))}
          </div>
        ) : (
          <>
            {/* Карточки */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="animate-fade-in-up" style={{ animationDelay: '0ms' }}>
                <StatCard title="Всего целей" value={total} color="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" />
              </div>
              <div className="animate-fade-in-up" style={{ animationDelay: '80ms' }}>
                <StatCard title="Завершено" value={completed} color="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" />
              </div>
              <div className="animate-fade-in-up" style={{ animationDelay: '160ms' }}>
                <StatCard title="В процессе" value={inProgress} color="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" />
              </div>
              <div className="animate-fade-in-up" style={{ animationDelay: '240ms' }}>
                <StatCard title="Просрочено" value={expired} color="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" />
              </div>
            </div>

            {/* Общий прогресс */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 animate-fade-in transition-colors mb-6">
              <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">Общий прогресс</h2>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 mb-2">
                <div
                  className="bg-gradient-to-r from-blue-500 to-purple-600 h-4 rounded-full transition-all duration-700"
                  style={{ width: `${overallPercent}%` }}
                ></div>
              </div>
              <p className="text-right text-sm text-gray-600 dark:text-gray-400">{overallPercent}%</p>
            </div>

            {/* Графики */}
            {goals.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Круговая диаграмма статусов */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 animate-fade-in transition-colors">
                  <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">
                    Распределение по статусам
                  </h2>
                  <div style={{ width: '100%', height: 280 }}>
                    <ResponsiveContainer>
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={4}
                          dataKey="value"
                          label={(entry) => `${entry.name}: ${entry.value}`}
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={index} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Столбчатая диаграмма прогресса */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 animate-fade-in transition-colors">
                  <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">
                    Прогресс по целям (%)
                  </h2>
                  <div style={{ width: '100%', height: 280 }}>
                    <ResponsiveContainer>
                      <BarChart data={barData}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                        <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
                        <YAxis stroke="#9ca3af" fontSize={12} domain={[0, 100]} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'rgba(31, 41, 55, 0.9)',
                            borderRadius: '8px',
                            border: 'none',
                            color: '#fff',
                          }}
                        />
                        <Legend />
                        <Bar dataKey="Прогресс" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function StatCard({ title, value, color }) {
  return (
    <div className={`rounded-xl shadow-md p-5 text-center transition-colors ${color}`}>
      <p className="text-sm font-medium opacity-80">{title}</p>
      <p className="text-3xl font-bold mt-1">{value}</p>
    </div>
  );
}