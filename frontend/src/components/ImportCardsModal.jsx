import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../api';
import { showToast } from './Toast';

export default function ImportCardsModal({ onClose, onImported }) {
  const { t } = useTranslation();
  const [text, setText] = useState('');
  const [splitBy, setSplitBy] = useState('paragraphs');
  const [tags, setTags] = useState('');
  const [loading, setLoading] = useState(false);

  const handleImport = async () => {
    if (text.trim().length < 10) {
      showToast('Text is too short', 'warning');
      return;
    }
    setLoading(true);
    try {
      const created = await api.importCards({ text, splitBy, tags });
      showToast(t('import_success', { count: created.length }), 'success');
      onImported();
      onClose();
    } catch (error) {
      showToast('Error: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl p-6 animate-fade-in">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
          {t('import_from_text')}
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          {t('import_hint')}
        </p>

        <textarea
          placeholder="..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={10}
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
        />

        <div className="mt-4 space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('import_split_mode')}
            </label>
            <div className="flex gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => setSplitBy('paragraphs')}
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition ${
                  splitBy === 'paragraphs'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                {t('import_split_paragraphs')}
              </button>
              <button
                type="button"
                onClick={() => setSplitBy('lines')}
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition ${
                  splitBy === 'lines'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                {t('import_split_lines')}
              </button>
              <button
                type="button"
                onClick={() => setSplitBy('colon')}
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition ${
                  splitBy === 'colon'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                {t('import_split_colon')}
              </button>
            </div>
          </div>

          <input
            type="text"
            placeholder={t('card_tags')}
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="mt-6 flex gap-3">
          <button
            onClick={handleImport}
            disabled={loading}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-2 rounded-lg transition"
          >
            {loading ? '...' : t('import_button')}
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-bold py-2 rounded-lg transition"
          >
            {t('import_close')}
          </button>
        </div>
      </div>
    </div>
  );
}