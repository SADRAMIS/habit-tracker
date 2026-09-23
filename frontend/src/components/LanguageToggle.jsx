import { useTranslation } from 'react-i18next';

export default function LanguageToggle() {
  const { i18n } = useTranslation();

  const toggleLang = () => {
    const newLang = i18n.language === 'ru' ? 'en' : 'ru';
    i18n.changeLanguage(newLang);
    localStorage.setItem('lang', newLang);
  };

  return (
    <button
      onClick={toggleLang}
      className="fixed bottom-4 left-4 z-40 w-12 h-12 rounded-full bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center text-sm font-bold hover:scale-110 transition-transform"
      title={i18n.language === 'ru' ? 'Switch to English' : 'Переключить на русский'}
    >
      {i18n.language === 'ru' ? 'RU' : 'EN'}
    </button>
  );
}