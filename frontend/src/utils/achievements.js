/**
 * Список всех возможных достижений.
 * check(goals) → true, если достижение разблокировано.
 */
export const ACHIEVEMENTS = [
  {
    id: 'first_goal',
    icon: '🌱',
    nameKey: 'ach_first_goal',
    descKey: 'ach_first_goal_desc',
    check: (goals) => goals.length >= 1,
  },
  {
    id: 'first_completed',
    icon: '🎯',
    nameKey: 'ach_first_completed',
    descKey: 'ach_first_completed_desc',
    check: (goals) => goals.some((g) => g.status === 'COMPLETED'),
  },
  {
    id: 'five_goals',
    icon: '📋',
    nameKey: 'ach_five_goals',
    descKey: 'ach_five_goals_desc',
    check: (goals) => goals.length >= 5,
  },
  {
    id: 'ten_goals',
    icon: '🏆',
    nameKey: 'ach_ten_goals',
    descKey: 'ach_ten_goals_desc',
    check: (goals) => goals.length >= 10,
  },
  {
    id: 'five_completed',
    icon: '🥇',
    nameKey: 'ach_five_completed',
    descKey: 'ach_five_completed_desc',
    check: (goals) => goals.filter((g) => g.status === 'COMPLETED').length >= 5,
  },
  {
    id: 'half_progress',
    icon: '⚡',
    nameKey: 'ach_half_progress',
    descKey: 'ach_half_progress_desc',
    check: (goals) =>
      goals.some((g) => (g.currentValue / g.targetValue) >= 0.5),
  },
  {
    id: 'perfect',
    icon: '💯',
    nameKey: 'ach_perfect',
    descKey: 'ach_perfect_desc',
    check: (goals) =>
      goals.some((g) => (g.currentValue / g.targetValue) >= 1),
  },
  {
    id: 'all_completed',
    icon: '👑',
    nameKey: 'ach_all_completed',
    descKey: 'ach_all_completed_desc',
    check: (goals) =>
      goals.length > 0 && goals.every((g) => g.status === 'COMPLETED'),
  },
];

const STORAGE_KEY = 'unlocked_achievements';

/**
 * Возвращает Set уже разблокированных достижений (по id).
 */
export function getUnlockedAchievements() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
}

/**
 * Проверяет цели, разблокирует новые достижения.
 * Возвращает массив только что разблокированных (для тостов).
 */
export function checkAchievements(goals) {
  const unlocked = getUnlockedAchievements();
  const newlyUnlocked = [];

  ACHIEVEMENTS.forEach((ach) => {
    if (!unlocked.has(ach.id) && ach.check(goals)) {
      unlocked.add(ach.id);
      newlyUnlocked.push(ach);
    }
  });

  if (newlyUnlocked.length > 0) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...unlocked]));
  }

  return newlyUnlocked;
}