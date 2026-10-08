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
import CalendarPage from './components/CalendarPage';
import NotificationToggle from './components/NotificationToggle';
import MemorizePage from './components/MemorizePage';
import StudyPage from './components/StudyPage';
import FeynmanPage from './components/FeynmanPage';
import MemoryStatsPage from './components/MemoryStatsPage';

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
      <NotificationToggle />
      <ToastContainer />
      <Routes>
        <Route path="/" element={token ? <Navigate to="/goals" /> : <LoginPage onLogin={handleLogin} />} />
        <Route path="/goals" element={token ? <GoalsPage onLogout={handleLogout} /> : <Navigate to="/" />} />
        <Route path="/dashboard" element={token ? <DashboardPage /> : <Navigate to="/" />} />
        <Route path="/goals/:id" element={token ? <GoalDetailPage /> : <Navigate to="/" />} />
        <Route path="/export" element={token ? <ExportPage /> : <Navigate to="/" />} />
        <Route path="/profile" element={token ? <ProfilePage onLogout={handleLogout} /> : <Navigate to="/" />} />
        <Route path="/calendar" element={token ? <CalendarPage /> : <Navigate to="/" />} />
        <Route path="/memorize" element={token ? <MemorizePage /> : <Navigate to="/" />} />
        <Route path="/study" element={token ? <StudyPage /> : <Navigate to="/" />} />
        <Route path="/feynman" element={token ? <FeynmanPage /> : <Navigate to="/" />} />
        <Route path="/memory-stats" element={token ? <MemoryStatsPage /> : <Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;