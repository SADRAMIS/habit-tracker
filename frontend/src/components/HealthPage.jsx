import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { api } from '../api';
import { showToast } from './Toast';

export default function HealthPage() {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Форма (по умолчанию сегодняшние данные)
  const [formData, setFormData] = useState({
    steps: 10000,
    sleepHours: 8,
    sleepMinutes: 0,
    proteinGrams: 120,
    fiberGrams: 30,
    fruitsVegGrams: 400,
  });

  const loadDashboard = async () => {
    try {
      const data = await api.getHealthDashboard();
      setDashboard(data);
    } catch (error) {
      console.error(error);
      showToast('Ошибка загрузки дашборда', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.saveHealthLog({
        logDate: new Date().toISOString().split('T')[0], // YYYY-MM-DD
        ...formData,
      });
      showToast('Данные сохранены!', 'success');
      await loadDashboard();
    } catch (error) {
      showToast('Ошибка сохранения: ' + error.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-center mt-20 text-gray-500">Загрузка...</div>;

  // Компонент карточки метрики
  const MetricCard = ({ title, icon, value, unit, target, color }) => {
    const percent = Math.min((value / target) * 100, 100);
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 transition-colors">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xl">{icon}</span>
            <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">{title}</span>
          </div>
          <div className="text-sm font-bold text-gray-800 dark:text-white">
            {Math.round(value)} <span className="text-xs text-gray-400 font-normal">{unit}</span>
          </div>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-500`}
            style={{ width: `${percent}%`, backgroundColor: color }}
          ></div>
        </div>
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>0</span>
          <span>{target}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 transition-colors">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">❤️ Дашборд Здоровья</h1>
          <button onClick={() => navigate('/goals')} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition">
            ← Назад
          </button>
        </div>

        {/* Главная карточка: Продолжительность жизни */}
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 dark:from-indigo-900 dark:to-purple-900 rounded-3xl shadow-xl p-8 text-white mb-8 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
          <h2 className="text-lg font-semibold mb-2 opacity-90 relative z-10">Ожидаемая продолжительность жизни</h2>
          <div className="flex justify-center items-baseline gap-4 relative z-10">
            <span className="text-6xl font-black">{dashboard?.currentLifeExpectancy || 80}</span>
            <span className="text-xl font-medium">лет</span>
          </div>

          <div className="mt-4 inline-flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full relative z-10 backdrop-blur-sm">
            <span className="text-sm">Потенциал: {dashboard?.potentialLifeExpectancy || 90} лет</span>
            <span className="text-green-300 font-bold text-sm">(+{dashboard?.yearsDifference || 10} лет)</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Левая колонка: Форма ввода */}
          <div className="lg:col-span-1">
            <form onSubmit={handleSave} className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 sticky top-6 transition-colors">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Внести данные за сегодня</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-500 mb-1">Шаги</label>
                  <input type="number" value={formData.steps} onChange={(e) => setFormData({...formData, steps: parseInt(e.target.value)})} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:text-white" />
                </div>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="block text-sm text-gray-500 mb-1">Сон (часы)</label>
                    <input type="number" value={formData.sleepHours} onChange={(e) => setFormData({...formData, sleepHours: parseInt(e.target.value)})} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:text-white" />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm text-gray-500 mb-1">Мин.</label>
                    <input type="number" value={formData.sleepMinutes} onChange={(e) => setFormData({...formData, sleepMinutes: parseInt(e.target.value)})} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:text-white" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-500 mb-1">Белок (г)</label>
                  <input type="number" value={formData.proteinGrams} onChange={(e) => setFormData({...formData, proteinGrams: parseInt(e.target.value)})} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm text-gray-500 mb-1">Клетчатка (г)</label>
                  <input type="number" value={formData.fiberGrams} onChange={(e) => setFormData({...formData, fiberGrams: parseInt(e.target.value)})} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm text-gray-500 mb-1">Овощи/Фрукты (г)</label>
                  <input type="number" value={formData.fruitsVegGrams} onChange={(e) => setFormData({...formData, fruitsVegGrams: parseInt(e.target.value)})} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:text-white" />
                </div>
              </div>

              <button type="submit" disabled={saving} className="mt-6 w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold py-3 rounded-lg transition">
                {saving ? 'Сохранение...' : 'Сохранить'}
              </button>
            </form>
          </div>

          {/* Правая колонка: Метрики и График */}
          <div className="lg:col-span-2 space-y-6">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white">Средние за 28 дней</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <MetricCard title="Шаги" icon="👣" value={dashboard?.avgSteps || 0} unit="шт" target={10000} color="#3b82f6" />
              <MetricCard title="Сон" icon="😴" value={dashboard?.avgSleepHours || 0} unit="ч" target={8} color="#8b5cf6" />
              <MetricCard title="Белок" icon="🥩" value={dashboard?.avgProtein || 0} unit="г" target={120} color="#ef4444" />
              <MetricCard title="Клетчатка" icon="🥦" value={dashboard?.avgFiber || 0} unit="г" target={30} color="#10b981" />
            </div>

            {/* График шагов */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 transition-colors">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Тренд шагов</h3>
              <div style={{ width: '100%', height: 250 }}>
                <ResponsiveContainer>
                  <LineChart data={dashboard?.trend || []}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} tickFormatter={(tick) => tick.slice(5)} />
                    <YAxis stroke="#9ca3af" fontSize={12} />
                    <Tooltip
                      contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.9)', borderRadius: '8px', border: 'none', color: '#fff' }}
                    />
                    <Line type="monotone" dataKey="steps" stroke="#3b82f6" strokeWidth={3} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}