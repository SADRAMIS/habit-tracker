import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { showToast } from './Toast';

export default function ExportPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [status, setStatus] = useState(null);
  const [csvData, setCsvData] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleStartExport = async () => {
    setLoading(true);
    setStatus('PROCESSING');
    setCsvData(null);
    setErrorMessage('');
    try {
      const response = await api.startExport();
      const id = response?.taskId || response?.id || response;
      pollStatus(id);
    } catch (error) {
      showToast('Error: ' + error.message, 'error');
      setLoading(false);
    }
  };

  const pollStatus = async (id) => {
    let attempts = 0;
    const maxAttempts = 30;

    const check = async () => {
      attempts++;
      try {
        const raw = await api.getExportRaw(id);

        try {
          const data = JSON.parse(raw);
          const statusValue = data.exportStatus || data.status;
          setStatus(statusValue);

          if (statusValue === 'DONE') {
            setCsvData(data.csvData || data.data);
            setLoading(false);
            showToast('✓', 'success');
            return;
          }
          if (statusValue === 'FAILED') {
            setErrorMessage(data.errorMessage || 'Error');
            showToast('Error', 'error');
            setLoading(false);
            return;
          }
        } catch {
          if (raw && raw.length > 0) {
            setCsvData(raw);
            setStatus('DONE');
            setLoading(false);
            showToast('✓', 'success');
            return;
          }
        }

        if (attempts < maxAttempts) {
          setTimeout(check, 1500);
        } else {
          setErrorMessage('Timeout');
          showToast('Timeout', 'error');
          setLoading(false);
        }
      } catch (error) {
        setErrorMessage('Error: ' + error.message);
        showToast('Error', 'error');
        setLoading(false);
      }
    };

    check();
  };

  const handleDownload = () => {
    if (!csvData) return;

    let blob;
    try {
      const binary = atob(csvData);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      blob = new Blob([bytes], { type: 'text/csv;charset=utf-8;' });
    } catch {
      blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    }

    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `goals_export_${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);

    showToast('✓', 'success');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 transition-colors">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => navigate('/goals')}
          className="mb-4 text-blue-600 dark:text-blue-400 hover:underline font-semibold"
        >
          {t('back_to_goals')}
        </button>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 animate-fade-in transition-colors">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">{t('export_title')}</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">{t('export_description')}</p>

          <button
            onClick={handleStartExport}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-3 rounded-lg transition"
          >
            {loading ? t('exporting') : t('start_export')}
          </button>

          {status && !errorMessage && (
            <div className="mt-6 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800">
              <p className="text-blue-800 dark:text-blue-200 font-semibold">
                Status: {status}
              </p>
            </div>
          )}

          {errorMessage && (
            <div className="mt-6 p-4 rounded-lg bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800">
              <p className="text-red-800 dark:text-red-200 font-semibold">{errorMessage}</p>
            </div>
          )}

          {csvData && (
            <button
              onClick={handleDownload}
              className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition"
            >
              {t('download_csv')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}