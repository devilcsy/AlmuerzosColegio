//login.jsx//
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI, saveAuthData } from '../utils/auth';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Limpiar error cuando el usuario empiece a escribir
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setIsLoading(true);
  setError('');

  console.log('🔍 DEBUG Login - Iniciando login con:', formData.email);
  const result = await authAPI.login(formData.email, formData.password);
  
  console.log('🔍 DEBUG Login - Respuesta completa:', result);
  console.log('🔍 DEBUG Login - Keys de result:', Object.keys(result));
  
  if (result.success) {
    // DEBUG: Verificar la estructura real
    console.log('🔍 DEBUG Login - ¿Tiene result.data?:', !!result.data);
    console.log('🔍 DEBUG Login - ¿Tiene result.token?:', !!result.token);
    console.log('🔍 DEBUG Login - ¿Tiene result.user?:', !!result.user);
    
    // CORRECCIÓN: Buscar token y usuario en diferentes ubicaciones posibles
    const token = result.data?.token || result.token;
    const user = result.data?.user || result.data || result.user;
    
    console.log('🔍 DEBUG Login - Token encontrado:', token);
    console.log('🔍 DEBUG Login - Usuario encontrado:', user);
    
    if (token && user) {
      // Asegurar que el rol esté en mayúsculas
      if (user.role) {
        user.role = user.role.toUpperCase();
        console.log('🔍 DEBUG Login - Rol normalizado:', user.role);
      }
      
      saveAuthData(token, user);
      
      // Verificar que se guardó correctamente
      console.log('🔍 DEBUG Login - Token guardado:', localStorage.getItem('token'));
      console.log('🔍 DEBUG Login - UserData guardado:', localStorage.getItem('userData'));
      
      navigate('/dashboard');
    } else {
      console.error('❌ DEBUG Login - Faltan token o usuario');
      setError('Error: No se recibieron datos de usuario');
    }
  } else {
    setError(result.message || 'Error al iniciar sesión');
  }
  
  setIsLoading(false);
};

  return (
    <div style={styles.loginContainer}>
      <div style={styles.backgroundAnimation}>
        <div style={styles.floatingCircle1}></div>
        <div style={styles.floatingCircle2}></div>
        <div style={styles.floatingCircle3}></div>
      </div>
      
      <div style={styles.loginCard}>
        {/* Logo y título */}
        <div style={styles.header}>
          <div style={styles.logo}>
            <span style={styles.logoIcon}>🍽️</span>
          </div>
          <h1 style={styles.title}>Sistema de Almuerzos</h1>
          <p style={styles.subtitle}>Ingresa a tu cuenta</p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} style={styles.form}>
          {error && (
            <div style={styles.errorMessage}>
              <span style={styles.errorIcon}>⚠️</span>
              {error}
            </div>
          )}
          
          <div style={styles.inputGroup}>
            <label style={styles.label}>
              <span style={styles.labelText}>Email</span>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={isLoading}
                style={styles.input}
                placeholder="tu@email.com"
              />
            </label>
          </div>
          
          <div style={styles.inputGroup}>
            <label style={styles.label}>
              <span style={styles.labelText}>Contraseña</span>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                disabled={isLoading}
                style={styles.input}
                placeholder="••••••••"
              />
            </label>
          </div>
          
          <button 
            type="submit" 
            disabled={isLoading}
            style={isLoading ? styles.buttonLoading : styles.button}
          >
            {isLoading ? (
              <div style={styles.loadingSpinner}>
                <div style={styles.spinner}></div>
                Iniciando sesión...
              </div>
            ) : (
              'Iniciar Sesión'
            )}
          </button>
        </form>

        {/* Enlace de registro */}
        <div style={styles.footer}>
          <p style={styles.registerText}>
            ¿No tienes una cuenta? 
            <Link to="/register" style={styles.registerLink}>
              Regístrate aquí
            </Link>
          </p>
        </div>

        {/* Información adicional */}
        <div style={styles.infoSection}>
          <div style={styles.infoItem}>
            <span style={styles.infoIcon}>👨‍🎓</span>
            <span>Estudiantes</span>
          </div>
          <div style={styles.infoItem}>
            <span style={styles.infoIcon}>👨‍🏫</span>
            <span>Personal</span>
          </div>
          <div style={styles.infoItem}>
            <span style={styles.infoIcon}>👑</span>
            <span>Administradores</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Estilos modernos
const styles = {
  loginContainer: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '1rem',
    position: 'relative',
    overflow: 'hidden',
  },
  backgroundAnimation: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
    zIndex: 1,
  },
  floatingCircle1: {
    position: 'absolute',
    top: '10%',
    left: '10%',
    width: '100px',
    height: '100px',
    background: 'rgba(255,255,255,0.1)',
    borderRadius: '50%',
    animation: 'float 6s ease-in-out infinite',
  },
  floatingCircle2: {
    position: 'absolute',
    top: '60%',
    right: '10%',
    width: '150px',
    height: '150px',
    background: 'rgba(255,255,255,0.05)',
    borderRadius: '50%',
    animation: 'float 8s ease-in-out infinite 1s',
  },
  floatingCircle3: {
    position: 'absolute',
    bottom: '10%',
    left: '20%',
    width: '80px',
    height: '80px',
    background: 'rgba(255,255,255,0.08)',
    borderRadius: '50%',
    animation: 'float 7s ease-in-out infinite 0.5s',
  },
  loginCard: {
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(20px)',
    padding: '3rem',
    borderRadius: '24px',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.2)',
    width: '100%',
    maxWidth: '440px',
    zIndex: 2,
    position: 'relative',
  },
  header: {
    textAlign: 'center',
    marginBottom: '2.5rem',
  },
  logo: {
    marginBottom: '1.5rem',
  },
  logoIcon: {
    fontSize: '4rem',
    display: 'block',
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    margin: '0 0 0.5rem 0',
  },
  subtitle: {
    color: '#6c757d',
    fontSize: '1.1rem',
    margin: 0,
  },
  form: {
    marginBottom: '2rem',
  },
  errorMessage: {
    background: 'rgba(220, 53, 69, 0.1)',
    border: '1px solid rgba(220, 53, 69, 0.2)',
    color: '#dc3545',
    padding: '1rem',
    borderRadius: '12px',
    marginBottom: '1.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.9rem',
  },
  errorIcon: {
    fontSize: '1.2rem',
  },
  inputGroup: {
    marginBottom: '1.5rem',
  },
  label: {
    display: 'block',
  },
  labelText: {
    display: 'block',
    marginBottom: '0.5rem',
    color: '#495057',
    fontWeight: '600',
    fontSize: '0.9rem',
  },
  input: {
    width: '100%',
    padding: '1rem 1.25rem',
    border: '2px solid #e9ecef',
    borderRadius: '12px',
    fontSize: '1rem',
    transition: 'all 0.3s ease',
    background: 'white',
    boxSizing: 'border-box',
  },
  button: {
    width: '100%',
    padding: '1rem 1.25rem',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '1.1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
  },
  buttonLoading: {
    width: '100%',
    padding: '1rem 1.25rem',
    background: 'linear-gradient(135deg, #6c757d 0%, #495057 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '1.1rem',
    fontWeight: '600',
    cursor: 'not-allowed',
    opacity: 0.8,
  },
  loadingSpinner: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
  },
  spinner: {
    width: '16px',
    height: '16px',
    border: '2px solid transparent',
    borderTop: '2px solid white',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  footer: {
    textAlign: 'center',
    marginBottom: '2rem',
  },
  registerText: {
    color: '#6c757d',
    margin: 0,
  },
  registerLink: {
    color: '#667eea',
    textDecoration: 'none',
    fontWeight: '600',
    marginLeft: '0.5rem',
    transition: 'color 0.3s ease',
  },
  infoSection: {
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: '2rem',
    borderTop: '1px solid #e9ecef',
  },
  infoItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.5rem',
    color: '#6c757d',
    fontSize: '0.8rem',
  },
  infoIcon: {
    fontSize: '1.5rem',
  },
};

// Agregar estilos globales para las animaciones
const globalStyles = `
  @keyframes float {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    50% { transform: translateY(-20px) rotate(5deg); }
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  input:focus {
    outline: none;
    border-color: #667eea !important;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1) !important;
    transform: translateY(-2px);
  }
  
  button:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6) !important;
  }
  
  a:hover {
    color: #764ba2 !important;
  }
`;

// Inyectar estilos globales
const styleSheet = document.createElement('style');
styleSheet.innerText = globalStyles;
document.head.appendChild(styleSheet);

export default Login;
