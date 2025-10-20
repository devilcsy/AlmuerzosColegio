
import React from 'react';
import { Navigate } from 'react-router-dom';
import { getStoredUser } from '../utils/auth';

const ProtectedRoute = ({ children, roles = [] }) => {
  const user = getStoredUser();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (roles.length > 0 && !roles.includes(user.role)) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>Acceso Denegado</h2>
        <p>No tienes permisos para acceder a esta página.</p>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
