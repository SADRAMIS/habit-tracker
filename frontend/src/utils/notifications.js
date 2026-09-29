import { getDaysLeft } from './dateUtils';

/**
 * Проверяет разрешение и запрашивает его у пользователя.
 */
export async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    return 'unsupported';
  }
  if (Notification.permission === 'granted') return 'granted';
  if (Notification.permission === 'denied') return 'denied';

  const result = await Notification.requestPermission();
  return result;
}

/**
 * Показывает одно системное уведомление.
 */
export function showNotification(title, body, tag = 'habit-tracker') {
  if (!('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;

  try {
    new Notification(title, {
      body,
      icon: '/vite.svg', // можешь заменить на свой логотип в /public
      tag,
      requireInteraction: false,
    });
  } catch (error) {
    console.warn('Не удалось показать уведомление:', error);
  }
}

/**
 * Проверяет все цели и отправляет уведомления о ближайших дедлайнах.
 * Не отправляет повторно те же уведомления (отслеживает их в localStorage).
 */
export function checkDeadlines(goals, t) {
  if (!('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;

  const notified = JSON.parse(localStorage.getItem('notified_deadlines') || '{}');
  const today = new Date().toISOString().slice(0, 10);
  const updatedNotified = { ...notified };

  goals.forEach((goal) => {
    if (goal.status === 'COMPLETED') return;

    const days = getDaysLeft(goal.deadline);
    if (days < 0 || days > 3) return;

    const key = `${goal.id}_${today}`;
    if (updatedNotified[key]) return; // уже уведомляли сегодня

    let title = '';
    let body = '';
    if (days === 0) {
      title = t('notification_deadline_today', { title: goal.title });
      body = goal.description || '';
    } else if (days === 1) {
      title = t('notification_deadline_tomorrow', { title: goal.title });
      body = goal.description || '';
    } else {
      title = t('notification_deadline_soon', { title: goal.title });
      body = `${t('progress')}: ${goal.currentValue} / ${goal.targetValue}`;
    }

    showNotification(title, body, `goal_${goal.id}`);
    updatedNotified[key] = true;
  });

  // Чистим старые записи (старше 7 дней)
  const cleanNotified = {};
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  Object.entries(updatedNotified).forEach(([key, value]) => {
    const datePart = key.split('_').pop();
    if (new Date(datePart) >= sevenDaysAgo) {
      cleanNotified[key] = value;
    }
  });

  localStorage.setItem('notified_deadlines', JSON.stringify(cleanNotified));
}