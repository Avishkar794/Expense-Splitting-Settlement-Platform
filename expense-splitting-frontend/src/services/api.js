const BASE_URL = 'http://localhost:8080';

const getHeaders = () => {
  const headers = {
    'Content-Type': 'application/json',
  };
  const token = localStorage.getItem('expense_jwt_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

const handleResponse = async (response) => {
  if (response.status === 401) {
    // Session expired or invalid token
    localStorage.removeItem('expense_jwt_token');
    localStorage.removeItem('expense_user');
    // Dispatch custom event to notify App to redirect to auth
    window.dispatchEvent(new Event('auth-unauthorized'));
    throw new Error('Session expired. Please log in again.');
  }

  const contentType = response.headers.get('content-type');
  let data;
  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    const errorMessage = typeof data === 'string' ? data : (data.message || 'An error occurred');
    throw new Error(errorMessage);
  }

  return data;
};

export const api = {
  get: async (endpoint) => {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  post: async (endpoint, body) => {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(body),
    });
    return handleResponse(response);
  },

  delete: async (endpoint) => {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(response);
  },
};

// API Services mapped to backend endpoints
export const authService = {
  login: async (email, password) => {
    const data = await api.post('/api/auth/login', { email, password });
    if (data && data.token) {
      localStorage.setItem('expense_jwt_token', data.token);
      // Fetch profile details right away
      const userProfile = await api.get('/api/users/me');
      localStorage.setItem('expense_user', JSON.stringify(userProfile));
      return { token: data.token, user: userProfile };
    }
    throw new Error('Authentication failed');
  },

  register: async (username, email, password) => {
    return api.post('/api/auth/register', { username, email, password });
  },

  logout: () => {
    localStorage.removeItem('expense_jwt_token');
    localStorage.removeItem('expense_user');
    window.dispatchEvent(new Event('auth-logout'));
  },

  getCurrentUser: () => {
    const userJson = localStorage.getItem('expense_user');
    return userJson ? JSON.parse(userJson) : null;
  },
};

export const groupService = {
  getAll: async () => {
    return api.get('/api/groups');
  },

  getById: async (groupId) => {
    return api.get(`/api/groups/${groupId}`);
  },

  create: async (groupName, groupDescription) => {
    return api.post('/api/groups/create', { groupName, groupDescription });
  },

  addMembers: async (groupId, memberIds) => {
    return api.post(`/api/groups/${groupId}/add-member`, { memberIds });
  },
};

export const userService = {
  search: async (query) => {
    return api.get(`/api/search?query=${encodeURIComponent(query)}`);
  },
  
  getMe: async () => {
    return api.get('/api/users/me');
  }
};

export const expenseService = {
  create: async (groupId, expenseData) => {
    return api.post(`/api/groups/${groupId}/expenses`, expenseData);
  },

  getByGroup: async (groupId) => {
    return api.get(`/api/groups/${groupId}/expenses`);
  },

  getDetails: async (expenseId) => {
    return api.get(`/api/expenses/${expenseId}`);
  },

  delete: async (expenseId) => {
    return api.delete(`/api/expenses/${expenseId}`);
  },
};

export const balanceService = {
  getBalances: async (groupId) => {
    return api.get(`/api/groups/${groupId}/balances`);
  },

  getSimplifiedDebts: async (groupId) => {
    return api.get(`/api/groups/${groupId}/simplified-debts`);
  },
};

export const settlementService = {
  settleUp: async (groupId) => {
    return api.post(`/api/groups/${groupId}/settle-up`);
  },
};
