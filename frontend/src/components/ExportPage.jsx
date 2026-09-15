import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';

export default function ExportPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState(null);
  const [csvData, setCsvData] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleStartExport = async () => {
    setLoading(true);
    setErrorMessage('');
    setStatus('PROCESSING');
    setCsvData(null);
    try {
      const response = await api.startExport();
      const id = response?.taskId || response?.id || response;
      pollStatus(id);
    } catch (error) {
      setErrorMessage('Не удалось запустить экспорт: ' + error.message);
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

        // Пробуем распарсить как JSON (если бэкенд возвращает статус)
        try {
          const data = JSON.parse(raw);
          const statusValue = data.exportStatus || data.status;
          setStatus(statusValue);

          if (statusValue === 'DONE') {
            setCsvData(data.csvData || data.data);
            setLoading(false);
            return;
          }
          if (statusValue === 'FAILED') {
            setErrorMessage(data.errorMessage || 'Ошибка при экспорте');
            setLoading(false);
            return;
          }
        } catch {
          // Не JSON → значит это уже готовый CSV
          if (raw && raw.length > 0) {
            setCsvData(raw);
            setStatus('DONE');
            setLoading(false);
            return;
          }
        }

        if (attempts < maxAttempts) {
          setTimeout(check, 1500);
        } else {
          setErrorMessage('Превышено время ожидания экспорта');
          setLoading(false);
        }
      } catch (error) {
        setErrorMessage('Ошибка при проверке статуса: ' + error.message);
        setLoading(false);
      }
    };

    check();
  };

  const handleDownload = () => {
    if (!csvData) return;

    let blob;
    try {
      // Пробуем base64
      const binary = atob(csvData);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      blob = new Blob([bytes], { type: 'text/csv;charset=utf-8;' });
    } catch {
      // Иначе — обычная строка
      blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    }

    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `goals_export_${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => navigate('/goals')}
          className="mb-4 text-blue-600 hover:underline font-semibold"
        >
          ← Назад к целям
        </button>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Экспорт целей</h1>
          <p className="text-gray-600 mb-6">
            Выгрузите все свои цели и прогресс в CSV-файл для анализа в Excel или Google Sheets.
          </p>

          <button
            onClick={handleStartExport}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-3 rounded-lg transition"
          >
            {loading ? 'Экспорт...' : 'Начать экспорт'}
          </button>

          {status && !errorMessage && (
            <div className="mt-6 p-4 rounded-lg bg-blue-50 border border-blue-200">
              <p className="text-blue-800 font-semibold">
                Статус:{' '}
                {status === 'PENDING' && '⏳ Ожидание...'}
                {status === 'PROCESSING' && '⚙️ Обработка...'}
                {status === 'DONE' && '✅ Готово!'}
                {status === 'FAILED' && '❌ Ошибка'}
              </p>
            </div>
          )}

          {errorMessage && (
            <div className="mt-6 p-4 rounded-lg bg-red-50 border border-red-200">
              <p className="text-red-800 font-semibold">{errorMessage}</p>
            </div>
          )}

          {csvData && (
            <button
              onClick={handleDownload}
              className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition"
            >
              📥 Скачать CSV
            </button>
          )}
        </div>
      </div>
    </div>
  );
}