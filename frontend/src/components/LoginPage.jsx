import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../api';
import { showToast } from './Toast';

export default function LoginPage({ onLogin }) {
  const { t } = useTranslation();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const data = isLogin
        ? await api.login({ email, password })
        : await api.register({ email, password });

      if (isLogin) {
        onLogin(data.token);
      } else {
        const loginData = await api.login({ email, password });
        onLogin(loginData.token);
      }
    } catch (err) {
      setError(err.message);
      showToast('Error: ' + err.message, 'error');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4 transition-colors">
      <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-2xl shadow-2xl p-8 transition-colors">
        <h1 className="text-3xl font-bold text-center text-gray-800 dark:text-white mb-2">
          {t('app_name')}
        </h1>
        <h2 className="text-xl font-semibold text-center text-gray-600 dark:text-gray-300 mb-8">
          {isLogin ? t('login') : t('register')}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder={t('email')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          />
          <input
            type="password"
            placeholder={t('password')}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          />
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition duration-200 shadow-md hover:shadow-lg"
          >
            {isLogin ? t('login_button') : t('register_button')}
          </button>
        </form>

        <p
          onClick={() => setIsLogin(!isLogin)}
          className="mt-6 text-center text-blue-600 dark:text-blue-400 cursor-pointer hover:underline"
        >
          {isLogin ? t('no_account') : t('have_account')}
        </p>

        {error && <p className="mt-4 text-red-500 text-center">{error}</p>}
      </div>
    </div>
  );
}