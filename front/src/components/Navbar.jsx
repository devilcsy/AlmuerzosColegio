
import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { getStoredUser, clearAuthData } from '../utils/auth';

const Navbar = () => {
  const user = getStoredUser();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    clearAuthData();
    navigate('/login');
  };

  const isActiveLink = (path) => {
    return location.pathname === path;
  };

  return (
    <nav style={styles.navbar}>
      <div style={styles.navContainer}>
        {/* Logo y marca */}
        <div style={styles.brand}>
          <Link to="/dashboard" style={styles.brandLink}>
            <span style={styles.logo}>🍽️</span>
            <span style={styles.brandText}>Sistema Almuerzos</span>
          </Link>
        </div>

        {/* Navegación */}
        <div style={styles.navSection}>
          {user ? (
            <>
              {/* Enlaces de navegación */}
              <div style={styles.navLinks}>
                <Link 
                  to="/dashboard" 
                  style={{
                    ...styles.navLink,
                    ...(isActiveLink('/dashboard') && styles.navLinkActive)
                  }}
                >
                  <span style={styles.navIcon}>📊</span>
                  Dashboard
                </Link>
                
                <Link 
                  to="/lunches" 
                  style={{
                    ...styles.navLink,
                    ...(isActiveLink('/lunches') && styles.navLinkActive)
                  }}
                >
                  <span style={styles.navIcon}>🍽️</span>
                  Almuerzos
                </Link>
                
                <Link 
                  to="/purchases" 
                  style={{
                    ...styles.navLink,
                    ...(isActiveLink('/purchases') && styles.navLinkActive)
                  }}
                >
                  <span style={styles.navIcon}>🛒</span>
                  Mis Compras
                </Link>
                
                <Link 
                  to="/profile" 
                  style={{
                    ...styles.navLink,
                    ...(isActiveLink('/profile') && styles.navLinkActive)
                  }}
                >
                  <span style={styles.navIcon}>👤</span>
                  Perfil
                </Link>
                
                {user.role === 'ADMIN' && (
                  <Link 
                    to="/admin" 
                    style={{
                      ...styles.navLink,
                      ...styles.adminLink,
                      ...(isActiveLink('/admin') && styles.navLinkActive)
                    }}
                  >
                    <span style={styles.navIcon}>👑</span>
                    Admin
                  </Link>
                )}
              </div>

              {/* Información del usuario */}
              <div style={styles.userSection}>
                <div style={styles.userInfo}>
                  <div style={styles.userWelcome}>
                    <span style={styles.userName}>Hola, {user.name}</span>
                    <div style={styles.userDetails}>
                      <span style={styles.userRole}>{user.role}</span>
                      {user.balance !== undefined && (
                        <span style={styles.userBalance}>
                          ${user.balance}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <button 
                  onClick={handleLogout} 
                  style={styles.logoutButton}
                  title="Cerrar sesión"
                >
                  <span style={styles.logoutIcon}>🚪</span>
                  Salir
                </button>
              </div>
            </>
          ) : (
            /* Enlaces para usuarios no autenticados */
            <div style={styles.authLinks}>
              <Link 
                to="/login" 
                style={{
                  ...styles.authLink,
                  ...styles.loginLink,
                  ...(isActiveLink('/login') && styles.authLinkActive)
                }}
              >
                Iniciar Sesión
              </Link>
              <Link 
                to="/register" 
                style={{
                  ...styles.authLink,
                  ...styles.registerLink,
                  ...(isActiveLink('/register') && styles.authLinkActive)
                }}
              >
                Registrarse
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

// Estilos modernos para el Navbar
const styles = {
  navbar: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    backdropFilter: 'blur(10px)',
    padding: '0',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    position: 'sticky',
    top: 0,
    zIndex: 1000,
  },
  navContainer: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0 1rem',
    height: '70px',
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
  },
  brandLink: {
    display: 'flex',
    alignItems: 'center',
    textDecoration: 'none',
    color: 'white',
    fontWeight: 'bold',
    fontSize: '1.3rem',
    transition: 'transform 0.2s ease',
  },
  logo: {
    fontSize: '2rem',
    marginRight: '0.5rem',
    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
  },
  brandText: {
    background: 'linear-gradient(135deg, #fff 0%, #e0e7ff 100%)',
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    fontWeight: '700',
  },
  navSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '2rem',
  },
  navLinks: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  navLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    padding: '0.6rem 1rem',
    textDecoration: 'none',
    color: 'rgba(255, 255, 255, 0.8)',
    borderRadius: '12px',
    fontSize: '0.9rem',
    fontWeight: '500',
    transition: 'all 0.3s ease',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  },
  navLinkActive: {
    background: 'rgba(255, 255, 255, 0.15)',
    color: 'white',
    boxShadow: '0 4px 12px rgba(255, 255, 255, 0.1)',
    transform: 'translateY(-1px)',
  },
  adminLink: {
    background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)',
    color: 'white',
  },
  navIcon: {
    fontSize: '1.1rem',
  },
  userSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '0.5rem',
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '16px',
    border: '1px solid rgba(255, 255, 255, 0.2)',
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  userWelcome: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  userName: {
    color: 'white',
    fontWeight: '600',
    fontSize: '0.9rem',
  },
  userDetails: {
    display: 'flex',
    gap: '0.75rem',
    fontSize: '0.75rem',
  },
  userRole: {
    background: 'rgba(255, 255, 255, 0.2)',
    color: 'white',
    padding: '0.2rem 0.6rem',
    borderRadius: '20px',
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  userBalance: {
    background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    color: 'white',
    padding: '0.2rem 0.6rem',
    borderRadius: '20px',
    fontWeight: '600',
  },
  logoutButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    background: 'rgba(255, 255, 255, 0.1)',
    color: 'white',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    padding: '0.5rem 1rem',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '0.85rem',
    fontWeight: '500',
    transition: 'all 0.3s ease',
  },
  logoutIcon: {
    fontSize: '0.9rem',
  },
  authLinks: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  authLink: {
    padding: '0.6rem 1.5rem',
    textDecoration: 'none',
    borderRadius: '12px',
    fontSize: '0.9rem',
    fontWeight: '600',
    transition: 'all 0.3s ease',
    border: '2px solid transparent',
  },
  loginLink: {
    background: 'transparent',
    color: 'white',
    border: '2px solid rgba(255, 255, 255, 0.3)',
  },
  registerLink: {
    background: 'rgba(255, 255, 255, 0.9)',
    color: '#667eea',
  },
  authLinkActive: {
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 20px rgba(255, 255, 255, 0.2)',
  },
};

// Estilos globales para hover effects
const globalNavStyles = `
  .nav-link:hover {
    background: rgba(255, 255, 255, 0.15) !important;
    color: white !important;
    transform: translateY(-1px) !important;
  }
  
  .logout-button:hover {
    background: rgba(255, 255, 255, 0.2) !important;
    transform: translateY(-1px) !important;
  }
  
  .auth-link:hover {
    transform: translateY(-2px) !important;
    box-shadow: 0 6px 20px rgba(255, 255, 255, 0.2) !important;
  }
  
  .brand-link:hover {
    transform: scale(1.05) !important;
  }
  
  /* Responsive */
  @media (max-width: 968px) {
    .nav-links {
      gap: 0.25rem !important;
    }
    
    .nav-link {
      padding: 0.5rem 0.75rem !important;
      font-size: 0.85rem !important;
    }
    
    .user-details {
      flex-direction: column !important;
      gap: 0.25rem !important;
    }
  }
  
  @media (max-width: 768px) {
    .nav-container {
      padding: 0 0.5rem !important;
    }
    
    .brand-text {
      display: none !important;
    }
    
    .nav-link span:last-child {
      display: none !important;
    }
    
    .user-name {
      display: none !important;
    }
  }
`;

// Inyectar estilos globales
const styleSheet = document.createElement('style');
styleSheet.innerText = globalNavStyles;
document.head.appendChild(styleSheet);

export default Navbar;
