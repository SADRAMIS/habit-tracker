import { useEffect, useState } from 'react';
import { api } from '../api';
import { useNavigate } from 'react-router-dom';

export default function GoalsPage({ onLogout }) {
  const navigate = useNavigate();
  const [goals, setGoals] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetValue, setTargetValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [progressValues, setProgressValues] = useState({});
  const [loadingGoalId, setLoadingGoalId] = useState(null);

  const loadGoals = async () => {
    const data = await api.getGoals();
    setGoals(data);
  };

  useEffect(() => {
    loadGoals();
  }, []);

  const handleCreateGoal = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.createGoal({
        title,
        description,
        targetValue: parseFloat(targetValue),
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      });
      setTitle('');
      setDescription('');
      setTargetValue('');
      await loadGoals();
    } catch (error) {
      alert('Ошибка при создании цели: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const completeGoal = async (goalId) => {
    try {
      await api.completeGoal(goalId);
      setLoadingGoalId(goalId);
      setTimeout(async () => {
        await loadGoals();
        setLoadingGoalId(null);
      }, 3000);
    } catch (error) {
      console.error('Ошибка при завершении цели:', error);
      alert('Не удалось завершить цель');
      setLoadingGoalId(null);
    }
  };

  const handleAddProgress = async (goalId) => {
    const value = progressValues[goalId];
    if (!value || isNaN(value)) {
      alert('Введите число для прогресса');
      return;
    }
    try {
      await api.addProgress({ goalId, progressValue: parseFloat(value), date: new Date().toISOString() });
      setProgressValues((prev) => ({ ...prev, [goalId]: '' }));
      await loadGoals();
    } catch (error) {
      alert('Ошибка при добавлении прогресса: ' + error.message);
    }
  };

  // Функция выхода
  const handleLogout = () => {
    localStorage.removeItem('token');
    onLogout(); // Обновляем состояние в App (token становится null)
    navigate('/'); // Переходим на страницу логина
  };

  return (
    <div style={{ maxWidth: 800, margin: '20px auto' }}>
      <h1>Мои цели</h1>
      <form onSubmit={handleCreateGoal} style={{ marginBottom: 30, padding: 20, border: '1px solid #ccc' }}>
        <h3>Новая цель</h3>
        <input placeholder="Название" value={title} onChange={(e) => setTitle(e.target.value)} required style={{ marginRight: 10 }} />
        <input placeholder="Описание" value={description} onChange={(e) => setDescription(e.target.value)} style={{ marginRight: 10 }} />
        <input placeholder="Целевое значение" type="number" value={targetValue} onChange={(e) => setTargetValue(e.target.value)} required style={{ marginRight: 10 }} />
        <button type="submit" disabled={loading}>{loading ? 'Создание...' : 'Создать'}</button>
      </form>

      {goals.length === 0 ? <p>Пока нет целей. Создайте первую!</p> : (
        <ul>
          {goals.map((goal) => (
            <li key={goal.id} style={{ border: '1px solid #ddd', padding: 15, marginBottom: 10, listStyle: 'none' }}>
              <strong>{goal.title}</strong> — {goal.status}
              <p>{goal.description}</p>
              <p>Прогресс: {goal.currentValue ?? 0} / {goal.targetValue}</p>

              {goal.status === 'IN_PROGRESS' && (
                <>
                  <button
                    onClick={() => completeGoal(goal.id)}
                    disabled={loadingGoalId === goal.id}
                    style={{ marginTop: 10, padding: '5px 10px', cursor: loadingGoalId === goal.id ? 'not-allowed' : 'pointer' }}
                  >
                    {loadingGoalId === goal.id ? 'Обработка...' : 'Завершить'}
                  </button>

                  <div style={{ marginTop: 10 }}>
                    <input
                      type="number"
                      placeholder="Сколько добавить?"
                      value={progressValues[goal.id] || ''}
                      onChange={(e) => setProgressValues((prev) => ({ ...prev, [goal.id]: e.target.value }))}
                      style={{ marginRight: 10, padding: '5px', width: '120px' }}
                    />
                    <button onClick={() => handleAddProgress(goal.id)} style={{ padding: '5px 10px' }}>
                      Добавить
                    </button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
      <button onClick={handleLogout} style={{ marginTop: 20 }}>
        Выйти
      </button>
    </div>
  );
}