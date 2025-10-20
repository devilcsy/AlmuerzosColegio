
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getStoredUser, clearAuthData } from '../utils/auth';

const Navbar = () => {
  const user = getStoredUser();
  const navigate = useNavigate();

  const handleLogout = () => {
    clearAuthData();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="nav-brand">
        <Link to="/dashboard">Sistema Almuerzos</Link>
      </div>
      
      <div className="nav-links">
        {user ? (
          <>
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/lunches">Almuerzos</Link>
            <Link to="/purchases">Mis Compras</Link>
            <Link to="/profile">Perfil</Link>
            
            {user.role === 'ADMIN' && (
              <Link to="/admin">Admin</Link>
            )}
            
            <div className="user-info">
              <span>Hola, {user.name}</span>
              <span className="user-role">({user.role})</span>
              {user.balance !== undefined && (
                <span className="user-balance">Saldo: ${user.balance}</span>
              )}
              <button onClick={handleLogout} className="logout-btn">
                Cerrar Sesión
              </button>
            </div>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Registrarse</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
