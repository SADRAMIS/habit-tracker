import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { showToast } from './Toast';

export default function ProfilePage({ onLogout }) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingEmail, setSavingEmail] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const handleChangeEmail = async (e) => {
    e.preventDefault();
    setSavingEmail(true);
    try {
      await api.changeEmail({ newEmail: email });
      showToast('✓', 'success');
      setTimeout(() => {
        localStorage.removeItem('token');
        onLogout();
        navigate('/');
      }, 1500);
    } catch (error) {
      showToast('Error: ' + error.message, 'error');
    } finally {
      setSavingEmail(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showToast('Passwords do not match', 'warning');
      return;
    }
    setSavingPassword(true);
    try {
      await api.changePassword({ oldPassword, newPassword });
      showToast('✓', 'success');
      setTimeout(() => {
        localStorage.removeItem('token');
        onLogout();
        navigate('/');
      }, 1500);
    } catch (error) {
      showToast('Error: ' + error.message, 'error');
    } finally {
      setSavingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm('Are you sure?');
    if (!confirmed) return;
    const doubleCheck = window.prompt('Type "DELETE" or "УДАЛИТЬ" to confirm:');
    if (doubleCheck !== 'DELETE' && doubleCheck !== 'УДАЛИТЬ') {
      showToast('Cancelled', 'warning');
      return;
    }

    try {
      await api.deleteAccount();
      showToast('✓', 'success');
      localStorage.removeItem('token');
      onLogout();
      navigate('/');
    } catch (error) {
      showToast('Error: ' + error.message, 'error');
    }
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

        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">{t('profile_title')}</h1>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6 animate-fade-in transition-colors">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">{t('change_email')}</h2>
          <form onSubmit={handleChangeEmail} className="space-y-3">
            <input
              type="email"
              placeholder={t('new_email')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={savingEmail}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-2 rounded-lg transition"
            >
              {savingEmail ? t('saving') : t('change_email_button')}
            </button>
          </form>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6 animate-fade-in transition-colors">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">{t('change_password')}</h2>
          <form onSubmit={handleChangePassword} className="space-y-3">
            <input
              type="password"
              placeholder={t('current_password')}
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="password"
              placeholder={t('new_password')}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="password"
              placeholder={t('confirm_password')}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={savingPassword}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-2 rounded-lg transition"
            >
              {savingPassword ? t('saving') : t('change_password_button')}
            </button>
          </form>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border-2 border-red-200 dark:border-red-900 animate-fade-in transition-colors">
          <h2 className="text-xl font-bold text-red-600 dark:text-red-400 mb-2">{t('danger_zone')}</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">{t('danger_description')}</p>
          <button
            onClick={handleDeleteAccount}
            className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2 rounded-lg transition"
          >
            {t('delete_account')}
          </button>
        </div>
      </div>
    </div>
  );
}