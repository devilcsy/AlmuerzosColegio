// services/api.js

// Configuración dinámica para API - VERSIÓN CODESPACES
const getApiBase = () => {
  // Si estamos en Codespaces, usar la URL del puerto 5000
  if (typeof window !== 'undefined' && window.location.hostname.includes('app.github.dev')) {
    return 'https://solid-space-chainsaw-4j9wq5x447j9h5x6p-5000.app.github.dev/api';
  }
  // Si estamos en desarrollo local
  return 'http://localhost:5001/api';
};

const API_BASE = getApiBase();

// Función helper para hacer requests
const makeRequest = async (endpoint, options = {}) => {
  try {
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

    console.log('Making request to:', `${API_BASE}${endpoint}`); // Para debug
    
    const response = await fetch(`${API_BASE}${endpoint}`, config);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API Request error:', error);
    return { 
      success: false, 
      message: 'Error de conexión con el servidor' 
    };
  }
};

// [MANTÉN TODAS LAS DEMÁS FUNCIONES IGUAL]
// Funciones para almuerzos
const getLunches = async () => {
  return await makeRequest('/lunches');
};

const addLunch = async (lunchData) => {
  return await makeRequest('/lunches', {
    method: 'POST',
    body: lunchData
  });
};

const getAvailableLunches = async () => {
  try {
    const response = await fetch('https://www.themealdb.com/api/json/v1/1/search.php?s=chicken');
    const data = await response.json();
    return data.meals || [];
  } catch (error) {
    console.error('Error fetching available lunches:', error);
    return [];
  }
};

const getLunchesByCategory = async (category = 'chicken') => {
  try {
    const response = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?c=${category}`);
    const data = await response.json();
    return data.meals || [];
  } catch (error) {
    console.error('Error fetching lunches by category:', error);
    return [];
  }
};

// Funciones para compras
const makePurchase = async (purchaseData) => {
  return await makeRequest('/purchases', {
    method: 'POST',
    body: purchaseData
  });
};

const getUserPurchases = async () => {
  return await makeRequest('/purchases/my-purchases');
};

const getAllPurchases = async () => {
  return await makeRequest('/admin/purchases');
};

// Funciones para usuarios
const addBalance = async (amount) => {
  return await makeRequest('/users/balance', {
    method: 'POST',
    body: { amount }
  });
};

const updateProfile = async (profileData) => {
  return await makeRequest('/users/profile', {
    method: 'PUT',
    body: profileData
  });
};

// Funciones de administración
const getAdminStats = async () => {
  return await makeRequest('/admin/stats');
};

const getAllUsers = async () => {
  return await makeRequest('/admin/users');
};

const updateUser = async (userId, userData) => {
  return await makeRequest(`/admin/users/${userId}`, {
    method: 'PUT',
    body: userData
  });
};

const addUserBalance = async (userId, amount) => {
  return await makeRequest(`/admin/users/${userId}/balance`, {
    method: 'POST',
    body: { amount }
  });
};

// Exportar todas las funciones como objeto api
const api = {
  getLunches,
  addLunch,
  getAvailableLunches,
  getLunchesByCategory,
  makePurchase,
  getUserPurchases,
  getAllPurchases,
  addBalance,
  updateProfile,
  getAdminStats,
  getAllUsers,
  updateUser,
  addUserBalance
};

// Exportar por defecto el objeto api
export default api;

// También exportar funciones individualmente para compatibilidad
export {
  getLunches,
  addLunch,
  getAvailableLunches,
  getLunchesByCategory,
  makePurchase,
  getUserPurchases,
  getAllPurchases,
  addBalance,
  updateProfile,
  getAdminStats,
  getAllUsers,
  updateUser,
  addUserBalance
};