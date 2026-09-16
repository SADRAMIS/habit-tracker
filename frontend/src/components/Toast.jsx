import { useEffect, useState } from 'react';

// Простая шина событий для тостов
const listeners = new Set();

export function showToast(message, type = 'info') {
  listeners.forEach((listener) => listener({ id: Date.now() + Math.random(), message, type }));
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const listener = (toast) => {
      setToasts((prev) => [...prev, toast]);
      // Автоудаление через 4 секунды
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== toast.id));
      }, 4000);
    };
    listeners.add(listener);
    return () => listeners.delete(listener);
  }, []);

  const getToastStyles = (type) => {
    switch (type) {
      case 'success':
        return 'bg-green-500 text-white';
      case 'error':
        return 'bg-red-500 text-white';
      case 'warning':
        return 'bg-yellow-500 text-white';
      default:
        return 'bg-blue-500 text-white';
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      default: return 'ℹ️';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`${getToastStyles(toast.type)} px-4 py-3 rounded-lg shadow-lg flex items-start gap-2 animate-fade-in-up`}
        >
          <span className="text-lg">{getIcon(toast.type)}</span>
          <span className="flex-1 font-medium">{toast.message}</span>
          <button
            onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
            className="text-white hover:opacity-75 font-bold"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}