import { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { showToast } from './Toast';

const MODES = [
  { id: 'BLITZ', icon: '⚡', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200' },
  { id: 'MOCK', icon: '🎤', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200' },
  { id: 'CODE_REVIEW', icon: '🔍', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200' },
  { id: 'TZ', icon: '📋', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200' },
  { id: 'STAR', icon: '🌟', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200' },
  { id: 'REVERSE', icon: '🧩', color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-200' },
];

export default function InterviewPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [sessions, setSessions] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [starting, setStarting] = useState(false);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef(null);

  // Загрузка истории сессий
  const loadSessions = async () => {
    try {
      const data = await api.getInterviewSessions();
      setSessions(data);
    } catch (error) {
      console.error('Ошибка загрузки сессий:', error);
    } finally {
      setLoadingSessions(false);
    }
  };

  useEffect(() => {
    loadSessions();
  }, []);

  // Скролл вниз при новом сообщении
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeSession?.messages]);

  // Старт новой сессии
  const handleStart = async (mode) => {
    setStarting(true);
    try {
      const session = await api.startInterview(mode);
      setActiveSession(session);
      loadSessions(); // обновить список
      showToast('Сессия начата!', 'success');
    } catch (error) {
      showToast('Ошибка старта: ' + error.message, 'error');
    } finally {
      setStarting(false);
    }
  };

  // Открыть существующую сессию
  const handleOpenSession = async (id) => {
    try {
      const session = await api.getInterviewSession(id);
      setActiveSession(session);
    } catch (error) {
      showToast('Ошибка загрузки сессии: ' + error.message, 'error');
    }
  };

  // Отправка сообщения
  const handleSend = async (e) => {
    e.preventDefault();
    if (!message.trim() || sending) return;

    const content = message.trim();
    setMessage('');
    setSending(true);

    // Оптимистичное обновление UI (чтобы сообщение появилось сразу)
    const tempMessage = { role: 'user', content, createdAt: new Date().toISOString() };
    setActiveSession((prev) => ({
      ...prev,
      messages: [...prev.messages, tempMessage],
    }));

    try {
      const updatedSession = await api.sendInterviewMessage(activeSession.id, content);
      setActiveSession(updatedSession);
    } catch (error) {
      showToast('Ошибка отправки: ' + error.message, 'error');
      // Откат при ошибке (можно удалить tempMessage, но для простоты просто перезагрузим)
      handleOpenSession(activeSession.id);
    } finally {
      setSending(false);
    }
  };

  // Экран выбора режима
  if (!activeSession) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 transition-colors">
        <div className="max-w-5xl mx-auto flex flex-col lg:flex-row gap-6">

          {/* Левая колонка: режимы */}
          <div className="flex-1">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">🤖 {t('interview_title')}</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">{t('interview_subtitle')}</p>
              </div>
              <button
                onClick={() => navigate('/goals')}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition"
              >
                {t('back_to_goals')}
              </button>
            </div>

            <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">
              {t('interview_select_mode')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {MODES.map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => handleStart(mode.id)}
                  disabled={starting}
                  className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 text-left hover:shadow-md hover:border-blue-400 dark:hover:border-blue-600 transition group disabled:opacity-50 flex items-start gap-4"
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 ${mode.color}`}>
                    {mode.icon}
                  </div>
                  <div>
                    <div className="font-bold text-gray-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                      {t(`interview_mode_${mode.id.toLowerCase()}`)}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {starting ? 'Запуск...' : 'Нажми, чтобы начать'}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Правая колонка: история */}
          <div className="w-full lg:w-80 flex-shrink-0">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 sticky top-6">
              <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-4">
                📜 {t('interview_history')}
              </h2>
              {loadingSessions ? (
                <p className="text-gray-500 text-sm">Загрузка...</p>
              ) : sessions.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-sm">{t('interview_no_sessions')}</p>
              ) : (
                <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                  {sessions.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => handleOpenSession(s.id)}
                      className="w-full text-left p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 border border-transparent hover:border-gray-200 dark:hover:border-gray-600 transition"
                    >
                      <div className="font-semibold text-gray-800 dark:text-white text-sm flex items-center gap-2">
                        {MODES.find(m => m.id === s.mode)?.icon} {t(`interview_mode_${s.mode.toLowerCase()}`)}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {new Date(s.createdAt).toLocaleString()}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Экран чата
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col h-screen transition-colors">
      {/* Шапка чата */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex justify-between items-center shadow-sm z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveSession(null)}
            className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white transition text-xl"
          >
            ←
          </button>
          <div>
            <h1 className="font-bold text-gray-800 dark:text-white flex items-center gap-2">
              {MODES.find(m => m.id === activeSession.mode)?.icon}
              {t(`interview_mode_${activeSession.mode.toLowerCase()}`)}
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">ID: {activeSession.id}</p>
          </div>
        </div>
        <button
          onClick={() => setActiveSession(null)}
          className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm font-semibold py-2 px-4 rounded-lg transition"
        >
          {t('interview_new')}
        </button>
      </div>

      {/* Лента сообщений */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
        <div className="max-w-3xl mx-auto space-y-4">
          {activeSession.messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] md:max-w-[75%] rounded-2xl p-4 shadow-sm ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white rounded-br-none'
                    : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700 rounded-bl-none'
                }`}
              >
                <div className="whitespace-pre-wrap text-sm md:text-base leading-relaxed">
                  {msg.content}
                </div>
              </div>
            </div>
          ))}

          {/* Индикатор печати */}
          {sending && (
            <div className="flex justify-start">
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl rounded-bl-none p-4 shadow-sm">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">{t('interview_ai_typing')}</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Поле ввода */}
      <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 z-10">
        <form onSubmit={handleSend} className="max-w-3xl mx-auto flex gap-2">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend(e);
              }
            }}
            placeholder={t('interview_placeholder')}
            rows={1}
            className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none max-h-32"
            style={{ minHeight: '48px' }}
          />
          <button
            type="submit"
            disabled={!message.trim() || sending}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold px-6 rounded-xl transition flex items-center justify-center"
          >
            {sending ? '...' : t('interview_send')}
          </button>
        </form>
        <p className="text-center text-xs text-gray-400 mt-2">
          Enter — отправить, Shift+Enter — новая строка
        </p>
      </div>
    </div>
  );
}