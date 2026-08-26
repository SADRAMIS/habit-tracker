import { useEffect, useState } from 'react';
import { api } from '../api';

export default function GoalsPage() {
  const [goals, setGoals] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetValue, setTargetValue] = useState('');
  const [loading, setLoading] = useState(false);

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
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // через месяц
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
            </li>
          ))}
        </ul>
      )}
      <button onClick={() => localStorage.removeItem('token') && window.location.reload()} style={{ marginTop: 20 }}>
        Выйти
      </button>
    </div>
  );
}