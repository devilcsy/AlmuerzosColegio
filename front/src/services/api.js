// front/src/services/api.js
const getApiBase = () => {
  return 'https://almuerzoscolegio-1.onrender.com/api';
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

    console.log('🌐 Making request to:', `${API_BASE}${endpoint}`);
    
    const response = await fetch(`${API_BASE}${endpoint}`, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || `HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API Request error:', error);
    return { 
      success: false, 
      message: error.message || 'Error de conexión con el servidor' 
    };
  }
};

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

const linkParentChild = async (parentId, childId) => {
  return await makeRequest('/admin/link-parent-child', {
    method: 'POST',
    body: { parentId, childId }
  });
};

const deleteUser = async (userId) => {
  return await makeRequest(`/admin/users/${userId}`, {
    method: 'DELETE'
  });
};

const getUserProfile = async (userId) => {
  return await makeRequest(`/admin/users/${userId}/profile`);
};

const updateUserRole = async (userId, newRole) => {
  return await makeRequest(`/admin/users/${userId}/role`, {
    method: 'PUT',
    body: { role: newRole }
  });
};

const toggleUserStatus = async (userId) => {
  return await makeRequest(`/admin/users/${userId}/toggle-status`, {
    method: 'PUT'
  });
};

// Funciones de padres
const getMyChildren = async () => {
  return await makeRequest('/parents/my-children'); 
};

const linkChild = async (identifier) => {
  return await makeRequest('/parents/link-child', {
    method: 'POST',
    body: { identifier },
  });
};

const rechargeChild = async (childId, amount) => {
  return await makeRequest('/parents/recharge-child', {
    method: 'POST',
    body: { childId, amount },
  });
};

const searchChild = async (query) => {
  return await makeRequest(`/parents/search-child?query=${encodeURIComponent(query)}`);
};

// Funciones de autenticación
const login = async (email, password) => {
  return await makeRequest('/auth/login', {
    method: 'POST',
    body: { email, password }
  });
};

const register = async (userData) => {
  return await makeRequest('/auth/register', {
    method: 'POST',
    body: userData
  });
};

// Exportar como objeto único
const api = {
  // Auth
  login,
  register,
  
  // Lunches
  getLunches,
  addLunch,
  getAvailableLunches,
  getLunchesByCategory,
  
  // Purchases
  makePurchase,
  getUserPurchases,
  getAllPurchases,
  
  // Users
  addBalance,
  updateProfile,
  
  // Admin
  getAdminStats,
  getAllUsers,
  updateUser,           
  addUserBalance,
  linkParentChild,       
  deleteUser,            
  getUserProfile,      
  updateUserRole,        
  toggleUserStatus,       
  
  // Parents
  getMyChildren,
  linkChild,
  rechargeChild,
  searchChild,
};

export default api;