import { useEffect, useState } from 'react';

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Если уже установлено как PWA — не показываем
    if (window.matchMedia('(display-mode: standalone)').matches) return;
    // Если пользователь уже закрывал баннер — не показываем
    if (localStorage.getItem('pwa_install_dismissed') === 'true') return;

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Задержка, чтобы не мешать загрузке страницы
      setTimeout(() => setVisible(true), 3000);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setVisible(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setVisible(false);
    localStorage.setItem('pwa_install_dismissed', 'true');
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 bg-gray-900 dark:bg-gray-800 text-white rounded-2xl shadow-2xl p-4 flex items-center gap-3 max-w-md w-[calc(100%-2rem)] animate-fade-in-up border border-gray-700">
      <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-2xl">
        📱
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-sm">Установить Habit Tracker</p>
        <p className="text-xs text-gray-300 mt-0.5">
          Добавь на главный экран для быстрого доступа
        </p>
      </div>
      <div className="flex flex-col gap-1 flex-shrink-0">
        <button
          onClick={handleInstall}
          className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition whitespace-nowrap"
        >
          Установить
        </button>
        <button
          onClick={handleDismiss}
          className="text-gray-400 hover:text-white text-xs transition"
        >
          Позже
        </button>
      </div>
    </div>
  );
}