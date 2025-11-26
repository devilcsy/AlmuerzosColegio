// utils/auth.js
const getApiBase = () => {
  return 'https://almuerzoscolegio-1.onrender.com/api';
};

const API_BASE = getApiBase(); // Esta línea está bien


console.log(' Auth.js using API URL:', API_BASE); 

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
    console.log(' Auth fetch to:', `${API_BASE}${endpoint}`); // Cambiado API_URL por API_BASE
    const response = await fetch(`${API_BASE}${endpoint}`, config); // Cambiado API_URL por API_BASE
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(' Auth fetch error:', error);
    return { 
      success: false, 
      message: 'Error de conexión con el servidor' 
    };
  }
};

export const getUser = () => {
  const userData = localStorage.getItem('userData');
  return userData ? JSON.parse(userData) : null;
};

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

export const parentAPI = {
  async linkChild(childId) {
    return await apiFetch('/users/link-child', {
      method: 'POST',
      body: { childId }
    });
  },

  async getMyChildren() {
    return await apiFetch('/users/my-children');
  },

  async rechargeChild(childId, amount) {
    return await apiFetch('/users/recharge-child', {
      method: 'POST',
      body: { childId, amount }
    });
  },

  async getChildPurchases(childId) {
    return await apiFetch(`/purchases/child/${childId}`);
  }
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
  purchasesAPI,
  parentAPI 
};