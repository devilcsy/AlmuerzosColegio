
// Configuración dinámica para API
const getApiBase = () => {
  if (typeof window !== 'undefined' && window.location.hostname.includes('app.github.dev')) {
    return 'https://solid-space-chainsaw-4j9wq5x447j9h5x6p-5000.app.github.dev/api';
  }
  return 'http://localhost:5001/api';
};

const API_URL = getApiBase();

console.log(' Auth.js using API URL:', API_URL);

// Función principal para fetch
export const apiFetch = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body);
  }

  try {
    console.log('🔗 Auth fetch to:', `${API_URL}${endpoint}`);
    const response = await fetch(`${API_URL}${endpoint}`, config);
    return await response.json();
  } catch (error) {
    console.error('❌ Auth fetch error:', error);
    return { 
      success: false, 
      message: 'Error de conexión con el servidor' 
    };
  }
};

// [MANTÉN TODO EL RESTO DEL CÓDIGO IGUAL]
// Alias para compatibilidad - getUser es igual a getStoredUser
export const getUser = () => {
  const userData = localStorage.getItem('userData');
  return userData ? JSON.parse(userData) : null;
};

// Funciones de autenticación
export const authAPI = {
  async login(email, password) {
    return await apiFetch('/auth/login', {
      method: 'POST',
      body: { email, password }
    });
  },

  async register(userData) {
    return await apiFetch('/auth/register', {
      method: 'POST',
      body: userData
    });
  },

  async getProfile() {
    return await apiFetch('/auth/me');
  },

  async checkAuth() {
    return await apiFetch('/auth/me');
  }
};

// Funciones de usuario
export const userAPI = {
  async updateProfile(profileData) {
    return await apiFetch('/users/profile', {
      method: 'PUT',
      body: profileData
    });
  },

  async addBalance(amount) {
    return await apiFetch('/users/balance', {
      method: 'POST',
      body: { amount }
    });
  },

  async getAllUsers() {
    return await apiFetch('/users/all');
  }
};

// Funciones de compras
export const purchasesAPI = {
  async getUserPurchases() {
    return await apiFetch('/purchases/my-purchases');
  },

  async getAllPurchases() {
    return await apiFetch('/purchases/all');
  },

  async createPurchase(purchaseData) {
    return await apiFetch('/purchases', {
      method: 'POST',
      body: purchaseData
    });
  }
};

// Helpers de almacenamiento
export const saveAuthData = (token, user) => {
  localStorage.setItem('token', token);
  localStorage.setItem('userData', JSON.stringify(user));
};

export const clearAuthData = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('userData');
};

export const getStoredUser = () => {
  const userData = localStorage.getItem('userData');
  return userData ? JSON.parse(userData) : null;
};

export const getToken = () => {
  return localStorage.getItem('token');
};

// Exportaciones para compatibilidad con componentes existentes
export default {
  apiFetch,
  getUser,
  getStoredUser,
  getToken,
  saveAuthData,
  clearAuthData,
  authAPI,
  userAPI,
  purchasesAPI
};
