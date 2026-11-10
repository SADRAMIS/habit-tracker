import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';

export default function CharacterPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.getCharacterStats().then(setStats).catch(console.error);
  }, []);

  if (!stats) return <div className="text-center mt-20 text-gray-500 dark:text-gray-400">Загрузка...</div>;

  const xpNeeded = stats.level * 100;
  const xpPercent = Math.min((stats.xp / xpNeeded) * 100, 100);

  return (
    <div className="max-w-2xl mx-auto p-6 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors">
      <button onClick={() => navigate('/goals')} className="mb-4 text-blue-600 dark:text-blue-400 hover:underline font-semibold">
        ← Назад к целям
      </button>

      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 text-center transition-colors">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Твой Персонаж</h1>
        <div className="text-6xl mb-4">🧙‍♂️</div>

        <div className="inline-block bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 font-bold px-4 py-1 rounded-full mb-6 text-lg">
          Уровень {stats.level}
        </div>

        {/* XP Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm mb-1 text-gray-500 dark:text-gray-400 font-semibold">
            <span>Опыт (XP)</span>
            <span>{stats.xp} / {xpNeeded}</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 shadow-inner">
            <div
              className="bg-gradient-to-r from-blue-400 to-blue-600 h-4 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${xpPercent}%` }}
            ></div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border border-red-100 dark:border-red-900/50">
            <div className="text-2xl mb-1">❤️</div>
            <div className="font-bold text-red-600 dark:text-red-400">HP</div>
            <div className="text-2xl font-black text-gray-800 dark:text-white">{stats.hp}</div>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-900/50">
            <div className="text-2xl mb-1">🔷</div>
            <div className="font-bold text-blue-600 dark:text-blue-400">MP</div>
            <div className="text-2xl font-black text-gray-800 dark:text-white">{stats.mp}</div>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-xl border border-purple-100 dark:border-purple-900/50">
            <div className="text-2xl mb-1">🧠</div>
            <div className="font-bold text-purple-600 dark:text-purple-400">INT</div>
            <div className="text-2xl font-black text-gray-800 dark:text-white">{stats.intelligence}</div>
          </div>
        </div>

        <div className="flex justify-around border-t border-gray-100 dark:border-gray-700 pt-6">
          <div>
            <span className="text-gray-500 dark:text-gray-400 text-sm block mb-1">STR (Дисциплина)</span>
            <span className="font-black text-2xl text-gray-800 dark:text-white">{stats.strength}</span>
          </div>
          <div className="w-px bg-gray-200 dark:bg-gray-700"></div>
          <div>
            <span className="text-gray-500 dark:text-gray-400 text-sm block mb-1">WIS (Мудрость)</span>
            <span className="font-black text-2xl text-gray-800 dark:text-white">{stats.wisdom}</span>
          </div>
        </div>
      </div>
    </div>
  );
}