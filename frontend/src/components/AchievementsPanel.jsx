import { useTranslation } from 'react-i18next';
import { ACHIEVEMENTS, getUnlockedAchievements } from '../utils/achievements';

export default function AchievementsPanel() {
  const { t } = useTranslation();
  const unlocked = getUnlockedAchievements();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 animate-fade-in transition-colors mb-6">
      <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">
        🏅 {t('achievements')}
      </h2>

      {unlocked.size === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 text-center py-4">
          {t('achievements_empty')}
        </p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {ACHIEVEMENTS.map((ach) => {
            const isUnlocked = unlocked.has(ach.id);
            return (
              <div
                key={ach.id}
                className={`rounded-lg p-3 text-center transition-all ${
                  isUnlocked
                    ? 'bg-gradient-to-br from-yellow-100 to-orange-100 dark:from-yellow-900/40 dark:to-orange-900/40 border-2 border-yellow-400 dark:border-yellow-700'
                    : 'bg-gray-100 dark:bg-gray-700 opacity-40 border-2 border-transparent'
                }`}
                title={t(ach.descKey)}
              >
                <div className="text-3xl mb-1">{isUnlocked ? ach.icon : '🔒'}</div>
                <div className="text-xs font-bold text-gray-800 dark:text-gray-100 leading-tight">
                  {t(ach.nameKey)}
                </div>
                <div className="text-[10px] text-gray-600 dark:text-gray-400 mt-1 leading-tight">
                  {t(ach.descKey)}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}