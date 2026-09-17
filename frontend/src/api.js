const API_URL = '/api/v1';

function getToken() {
  return localStorage.getItem('token');
}

async function request(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  const token = getToken();

  if (token) headers['Authorization'] = `Bearer ${token}`;

  const response = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/'; // редирект на логин
    }
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Ошибка запроса');
  }

  if (response.status === 204 || response.headers.get('content-length') === '0') {
      return null;
    }

  return response.json();
}
async function requestText(path, options = {}) {
  const headers = { ...options.headers };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const response = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/';
    }
    throw new Error('Ошибка запроса');
  }

  return response.text();
}

export const api = {
  register: (data) => request('/users/register', { method: 'POST', body: JSON.stringify(data) }),
  login: (data) => request('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  getGoals: () => request('/goals'),
  getGoalById: (goalId) => request(`/goals/${goalId}`),          // <-- ЭТОГО НЕ ХВАТАЛО
  createGoal: (data) => request('/goals', { method: 'POST', body: JSON.stringify(data) }),
  completeGoal: (goalId) => request(`/goals/${goalId}/complete`, { method: 'POST' }),
  deleteGoal: (goalId) => request(`/goals/${goalId}`, { method: 'DELETE' }),
  addProgress: (data) => request('/progress', { method: 'POST', body: JSON.stringify(data) }),
  getProgressHistory: (goalId) => request(`/progress/${goalId}`),
  startExport: () => request('/export/goals', { method: 'POST' }),
  getExport: (taskId) => request(`/export/${taskId}`),
  getExportRaw: (taskId) => requestText(`/export/${taskId}`),
  updateGoal: (goalId, data) => request(`/goals/${goalId}`, { method: 'PUT', body: JSON.stringify(data) }),
};