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

export const api = {
  register: (data) => request('/users/register', { method: 'POST', body: JSON.stringify(data) }),
  login: (data) => request('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  getGoals: () => request('/goals'),
  createGoal: (data) => request('/goals', { method: 'POST', body: JSON.stringify(data) }),
  addProgress: (data) => request('/progress', { method: 'POST', body: JSON.stringify(data) }),
  startExport: () => request('/export/goals', { method: 'POST' }),
  getExport: (taskId) => request(`/export/${taskId}`),
  completeGoal: (goalId) => request(`/goals/${goalId}/complete`, { method: 'POST' }),
};