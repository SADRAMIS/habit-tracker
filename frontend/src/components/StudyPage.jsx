import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';

export default function StudyPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTopic, setActiveTopic] = useState(null);
  const [showTheory, setShowTheory] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.getAllStudyTopics();
        setTopics(data);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Группировка по модулю
  const grouped = topics.reduce((acc, t) => {
    if (!acc[t.module]) acc[t.module] = [];
    acc[t.module].push(t);
    return acc;
  }, {});

  // === ДЕТАЛЬНЫЙ ПРОСМОТР ===
  if (activeTopic) {
    const facts = (activeTopic.facts || '').split('\n---\n').filter(Boolean);
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 transition-colors">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => setActiveTopic(null)}
            className="mb-4 text-blue-600 dark:text-blue-400 hover:underline font-semibold"
          >
            {t('study_back_to_list')}
          </button>

          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg p-6 mb-6 text-white animate-fade-in">
            <div className="text-xs uppercase tracking-wide opacity-80 mb-1">
              {activeTopic.module}
            </div>
            <h1 className="text-3xl font-bold mb-2">{activeTopic.title}</h1>
            <p className="opacity-90">{activeTopic.summary}</p>
          </div>

          {/* Дворец памяти */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6 animate-fade-in transition-colors">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
              {t('study_visualization')}
            </h2>
            <pre className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-2 border-dashed border-yellow-400 dark:border-yellow-700 rounded-xl p-5 text-sm text-gray-800 dark:text-gray-100 whitespace-pre-wrap font-mono overflow-x-auto">
              {activeTopic.visualization}
            </pre>
          </div>

          {/* Факты */}
          {facts.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6 animate-fade-in transition-colors">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
                {t('study_facts')}
              </h2>
              <ul className="space-y-3">
                {facts.map((fact, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 rounded-r-lg text-gray-800 dark:text-gray-200"
                  >
                    <span className="flex-1">{fact}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Теория */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 animate-fade-in transition-colors">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                {t('study_theory')}
              </h2>
              <button
                onClick={() => setShowTheory(!showTheory)}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                {showTheory ? t('study_hide_theory') : t('study_show_theory')}
              </button>
            </div>
            {showTheory && (
              <pre className="whitespace-pre-wrap text-gray-700 dark:text-gray-200 font-sans leading-relaxed">
                {activeTopic.content}
              </pre>
            )}
          </div>
        </div>
      </div>
    );
  }

  // === СПИСОК ТЕМ ===
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 transition-colors">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
            📚 {t('study')}
          </h1>
          <button
            onClick={() => navigate('/goals')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition"
          >
            {t('back_to_goals')}
          </button>
        </div>

        {loading ? (
          <p className="text-center text-gray-500 dark:text-gray-400">Loading...</p>
        ) : Object.keys(grouped).length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400">
            {t('study_no_topics')}
          </p>
        ) : (
          <div className="space-y-8">
            {Object.entries(grouped).map(([module, items]) => (
              <div key={module}>
                <h2 className="text-lg font-bold text-indigo-600 dark:text-indigo-400 mb-3 flex items-center gap-2">
                  <span className="w-1 h-6 bg-indigo-500 rounded"></span>
                  {module}
                </h2>
                <div className="space-y-3">
                  {items.map((topic) => (
                    <div
                      key={topic.id}
                      onClick={() => { setActiveTopic(topic); setShowTheory(true); }}
                      className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 cursor-pointer hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 animate-fade-in-up"
                    >
                      <h3 className="font-bold text-gray-800 dark:text-white text-lg">
                        {topic.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                        {topic.summary}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}