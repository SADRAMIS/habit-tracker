import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { requestNotificationPermission } from '../utils/notifications';
import { showToast } from './Toast';

export default function NotificationToggle() {
  const { t } = useTranslation();
  const [permission, setPermission] = useState(
    typeof Notification !== 'undefined' ? Notification.permission : 'unsupported'
  );

  useEffect(() => {
    if (typeof Notification !== 'undefined') {
      setPermission(Notification.permission);
    }
  }, []);

  const handleClick = async () => {
    const result = await requestNotificationPermission();
    setPermission(result);

    if (result === 'granted') {
      showToast(t('notifications_enabled'), 'success');
    } else if (result === 'denied') {
      showToast(t('notifications_denied'), 'warning');
    } else if (result === 'unsupported') {
      showToast('Notification API не поддерживается', 'error');
    }
  };

  const isEnabled = permission === 'granted';

  return (
    <button
      onClick={handleClick}
      title={isEnabled ? t('notifications_enabled') : t('enable_notifications')}
      className={`fixed bottom-4 right-20 z-40 w-12 h-12 rounded-full shadow-lg border flex items-center justify-center text-xl hover:scale-110 transition-transform ${
        isEnabled
          ? 'bg-green-500 border-green-600 text-white'
          : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-800 dark:text-white'
      }`}
    >
      {isEnabled ? '🔔' : '🔕'}
    </button>
  );
}