/**
 * Возвращает количество дней до дедлайна.
 * 0 — сегодня, 1 — завтра, -1 — просрочено вчера и т.д.
 */
export function getDaysLeft(deadline) {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const d = new Date(deadline);
  d.setHours(0, 0, 0, 0);
  const diff = Math.round((d - now) / (1000 * 60 * 60 * 24));
  return diff;
}

/**
 * Возвращает true, если до дедлайна осталось 0-3 дня и цель не завершена.
 */
export function isDeadlineSoon(goal) {
  if (!goal || goal.status === 'COMPLETED') return false;
  const days = getDaysLeft(goal.deadline);
  return days >= 0 && days <= 3;
}

/**
 * Возвращает true, если дедлайн уже прошёл, а цель не завершена.
 */
export function isOverdue(goal) {
  if (!goal || goal.status === 'COMPLETED') return false;
  return getDaysLeft(goal.deadline) < 0;
}

/**
 * Форматирует красивую строку "осталось X дней" с учетом правил языка.
 */
export function formatDaysLeft(days, t) {
  if (days < 0) return t('expired_badge');
  if (days === 0) return t('today');
  if (days === 1) return t('tomorrow');
  if (days >= 2 && days <= 4) return t('days_left_2', { days });
  return t('days_left', { days });
}