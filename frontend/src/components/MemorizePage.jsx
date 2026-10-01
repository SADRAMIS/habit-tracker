import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { showToast } from './Toast';
import MindMap from './MindMap';

export default function MemorizePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [cards, setCards] = useState([]);
  const [dueCards, setDueCards] = useState([]);
  const [loading, setLoading] = useState(true);

  // Форма создания
  const [topic, setTopic] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');

  // Режим учёбы
  const [studyMode, setStudyMode] = useState(false);
  const [studyQueue, setStudyQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [showMindMap, setShowMindMap] = useState(false);

  const load = async () => {
    try {
      const [all, due] = await Promise.all([api.getAllCards(), api.getDueCards()]);
      setCards(all);
      setDueCards(due);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.createCard({ topic, content, tags });
      setTopic('');
      setContent('');
      setTags('');
      await load();
      showToast('✓', 'success');
    } catch (err) {
      showToast('Error: ' + err.message, 'error');
    }
  };

  const startStudy = () => {
    if (dueCards.length === 0) {
      showToast(t('no_cards_due'), 'warning');
      return;
    }
    setStudyQueue([...dueCards]);
    setCurrentIndex(0);
    setShowAnswer(false);
    setShowMindMap(false);
    setStudyMode(true);
  };

  const handleReview = async (quality) => {
    const card = studyQueue[currentIndex];
    try {
      await api.reviewCard(card.id, quality);
      const next = currentIndex + 1;
      if (next >= studyQueue.length) {
        showToast(t('study_finished') + ' 🎉', 'success');
        setStudyMode(false);
        await load();
      } else {
        setCurrentIndex(next);
        setShowAnswer(false);
        setShowMindMap(false);
      }
    } catch (err) {
      showToast('Error: ' + err.message, 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this card?')) return;
    try {
      await api.deleteCard(id);
      await load();
      showToast('✓', 'success');
    } catch (err) {
      showToast('Error: ' + err.message, 'error');
    }
  };

  // === РЕЖИМ УЧЁБЫ ===
  if (studyMode) {
    const card = studyQueue[currentIndex];
    const remaining = studyQueue.length - currentIndex;
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 dark:from-gray-900 dark:to-gray-800 p-6 flex items-center justify-center">
        <div className="w-full max-w-2xl">
          <div className="flex justify-between items-center mb-4 text-white">
            <button onClick={() => setStudyMode(false)} className="hover:underline">
              ← {t('back_to_goals')}
            </button>
            <span className="text-sm font-semibold">
              {t('study_progress', { count: remaining })}
            </span>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 min-h-[400px] flex flex-col">
            <div className="text-xs uppercase tracking-wide text-blue-500 dark:text-blue-400 font-bold mb-2">
              {t('card_topic')}
            </div>
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">
              {card.topic}
            </h2>

            {!showAnswer ? (
              <>
                <p className="text-gray-500 dark:text-gray-400 mb-6 italic">
                  {t('card_front_hint')}
                </p>
                <button
                  onClick={() => setShowAnswer(true)}
                  className="mt-auto w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition"
                >
                  {t('show_answer')}
                </button>
              </>
            ) : (
              <>
                <div className="prose dark:prose-invert max-w-none mb-6 whitespace-pre-wrap text-gray-700 dark:text-gray-200">
                  {card.content}
                </div>

                {showMindMap && (
                  <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
                    <MindMap topic={card.topic} content={card.content} />
                  </div>
                )}

                <button
                  onClick={() => setShowMindMap(!showMindMap)}
                  className="mb-4 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {showMindMap ? t('hide_visualization') : '🧠 ' + t('visualization')}
                </button>

                <div className="grid grid-cols-3 gap-3 mt-auto">
                  <button
                    onClick={() => handleReview(1)}
                    className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-lg transition"
                  >
                    {t('rate_dont_know')}
                  </button>
                  <button
                    onClick={() => handleReview(3)}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 rounded-lg transition"
                  >
                    {t('rate_almost')}
                  </button>
                  <button
                    onClick={() => handleReview(5)}
                    className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-lg transition"
                  >
                    {t('rate_known')}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  // === ОБЫЧНЫЙ РЕЖИМ ===
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 transition-colors">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
            🧠 {t('memory_cards')}
          </h1>
          <button
            onClick={() => navigate('/goals')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition"
          >
            {t('back_to_goals')}
          </button>
        </div>

        {/* Кнопка «Начать повторение» */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6 animate-fade-in transition-colors">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200">
                {t('cards_due')}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {dueCards.length} {t('memory_cards').toLowerCase()}
              </p>
            </div>
            <button
              onClick={startStudy}
              disabled={dueCards.length === 0}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold py-3 px-6 rounded-lg transition"
            >
              ▶ {t('start_study')}
            </button>
          </div>
        </div>

        {/* Форма создания */}
        <form onSubmit={handleCreate} className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6 animate-fade-in transition-colors">
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">{t('new_card')}</h3>
          <div className="space-y-3">
            <input
              placeholder={t('card_topic')}
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <textarea
              placeholder={t('card_content')}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              placeholder={t('card_tags')}
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button type="submit" className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg transition">
            {t('create')}
          </button>
        </form>

        {/* Список карточек */}
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">{t('cards_all')}</h2>
        {loading ? (
          <p className="text-center text-gray-500 dark:text-gray-400">Loading...</p>
        ) : cards.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400">{t('no_cards')}</p>
        ) : (
          <div className="space-y-3">
            {cards.map((card) => (
              <div
                key={card.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 animate-fade-in-up transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-800 dark:text-white">{card.topic}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                      {card.content}
                    </p>
                    <div className="flex gap-3 mt-2 text-xs text-gray-500 dark:text-gray-400">
                      <span>🔁 {t('repetitions')}: {card.repetitions}</span>
                      <span>📅 {t('interval_days')}: {card.intervalDays}</span>
                      <span>⏭ {new Date(card.nextReview).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(card.id)}
                    className="text-red-500 hover:text-red-700 ml-4"
                  >
                    {t('delete_card')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}