import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './components/LoginPage';
import GoalsPage from './components/GoalsPage';
import DashboardPage from './components/DashboardPage';
import GoalDetailPage from './components/GoalDetailPage';
import ExportPage from './components/ExportPage';
import ToastContainer from './components/Toast';
import ThemeToggle from './components/ThemeToggle';
import LanguageToggle from './components/LanguageToggle';
import ProfilePage from './components/ProfilePage';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));

  const handleLogin = (newToken) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  return (
    <BrowserRouter>
      <ThemeToggle />
      <LanguageToggle />
      <ToastContainer />
      <Routes>
        <Route path="/" element={token ? <Navigate to="/goals" /> : <LoginPage onLogin={handleLogin} />} />
        <Route path="/goals" element={token ? <GoalsPage onLogout={handleLogout} /> : <Navigate to="/" />} />
        <Route path="/dashboard" element={token ? <DashboardPage /> : <Navigate to="/" />} />
        <Route path="/goals/:id" element={token ? <GoalDetailPage /> : <Navigate to="/" />} />
        <Route path="/export" element={token ? <ExportPage /> : <Navigate to="/" />} />
        <Route path="/profile" element={token ? <ProfilePage onLogout={handleLogout} /> : <Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;