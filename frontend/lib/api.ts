const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
const TOKEN_KEY = 'ablespace-token';

export function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

async function request(path: string, options: RequestInit = {}) {
  const token = getToken();
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || `Request failed: ${res.status}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  guestLogin: (displayName?: string) =>
    request('/auth/guest', { method: 'POST', body: JSON.stringify({ displayName }) }),

  getTasks: (projectId?: string) =>
    request(`/tasks${projectId ? `?projectId=${projectId}` : ''}`),
  getTask: (id: string) => request(`/tasks/${id}`),
  createTask: (data: any) => request('/tasks', { method: 'POST', body: JSON.stringify(data) }),
  updateTask: (id: string, data: any) =>
    request(`/tasks/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteTask: (id: string) => request(`/tasks/${id}`, { method: 'DELETE' }),

  getProjects: () => request('/projects'),
  createProject: (data: any) => request('/projects', { method: 'POST', body: JSON.stringify(data) }),

  getComments: (taskId: string) => request(`/tasks/${taskId}/comments`),
  addComment: (taskId: string, body: string) =>
    request(`/tasks/${taskId}/comments`, { method: 'POST', body: JSON.stringify({ body }) }),

  getMe: () => request('/users/me'),
  updateMe: (data: any) => request('/users/me', { method: 'PATCH', body: JSON.stringify(data) }),
};
