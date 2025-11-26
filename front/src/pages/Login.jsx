//login.jsx//
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI, saveAuthData } from '../utils/auth';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [lunches, setLunches] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

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

  useEffect(() => {
    const fetchLunches = async () => {
      const meals = await getAvailableLunches();
      setLunches(meals.slice(0, 6)); 
    };
    fetchLunches();
  }, []);


  useEffect(() => {
    if (lunches.length > 0) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % lunches.length);
      }, 4000); 
      return () => clearInterval(interval);
    }
  }, [lunches.length]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    console.log('🔍 DEBUG Login - Iniciando login con:', formData.email);
    const result = await authAPI.login(formData.email, formData.password);
    
    console.log('🔍 DEBUG Login - Respuesta completa:', result);
    
    if (result.success) {
      const token = result.data?.token || result.token;
      const user = result.data?.user || result.data || result.user;
      
      console.log('🔍 DEBUG Login - Token encontrado:', token);
      console.log('🔍 DEBUG Login - Usuario encontrado:', user);
      
      if (token && user) {
        if (user.role) {
          user.role = user.role.toUpperCase();
          console.log('🔍 DEBUG Login - Rol normalizado:', user.role);
        }
        
        saveAuthData(token, user);
        
        console.log('🔍 DEBUG Login - Token guardado:', localStorage.getItem('token'));
        console.log('🔍 DEBUG Login - UserData guardado:', localStorage.getItem('userData'));
        
        if (user.role === 'ADMIN') {
      navigate('/admin');
    } else {
      navigate('/dashboard');
    }
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
      {/* Card principal */}
      <div style={styles.loginCard}>
        
        {/* Header con logo */}
        <div style={styles.header}>
          <div style={styles.logoContainer}>
            <div style={styles.logoText}>
              <span style={styles.logoTitle}>Lunch</span>
              <span style={styles.logoSubtitle}>Manager</span>
            </div>
          </div>
          <h1 style={styles.title}>Bienvenido</h1>
          <p style={styles.subtitle}>Ingresa a tu cuenta para continuar</p>
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
              <span style={styles.labelText}>Correo electrónico</span>
              <div style={styles.inputContainer}>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                  style={styles.input}
                  placeholder="ejemplo@institucion.edu"
                />
              </div>
            </label>
          </div>
          
          <div style={styles.inputGroup}>
            <label style={styles.label}>
              <span style={styles.labelText}>Contraseña</span>
              <div style={styles.inputContainer}>
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
              </div>
            </label>
          </div>

          <div style={styles.rememberForgot}>
            <label style={styles.rememberMe}>
              <input type="checkbox" style={styles.checkbox} />
              <span style={styles.checkboxLabel}>Recordarme</span>
            </label>
            <a href="#" style={styles.forgotLink}>¿Olvidaste tu contraseña?</a>
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


      </div>


      <div style={styles.sidePanel}>
        {/* Overlay oscuro para mejor contraste del texto */}
        <div style={styles.overlay}></div>
        
        {/* Carrusel de imágenes */}
        <div style={styles.carousel}>
          {lunches.map((lunch, index) => (
            <div
              key={lunch.idMeal}
              style={{
                ...styles.carouselSlide,
                opacity: index === currentSlide ? 1 : 0,
                transform: `translateX(${(index - currentSlide) * 100}%)`
              }}
            >
              <img 
                src={lunch.strMealThumb} 
                alt={lunch.strMeal}
                style={styles.carouselImage}
              />
            </div>
          ))}
        </div>

        {/* Contenido superpuesto */}
        <div style={styles.sideContent}>
          
          {/* Logo principal */}
          <div style={styles.mainLogo}>
            <div style={styles.mainLogoText}>Sistema Almuerzos</div>
          </div>

          {/* Título principal */}
          <h1 style={styles.heroTitle}>
            El sistema hecho
            <br />
            a la medida para
            <br />
            <span style={styles.heroHighlight}>instituciones educativas</span>
          </h1>

          {/* Subtítulo */}
          <p style={styles.heroSubtitle}>
            Gestión de almuerzos escolares...
            <br />
            sin complicaciones ni costos adicionales.
          </p>

          {/* Características */}
          <div style={styles.features}>
            <div style={styles.feature}>
              <span style={styles.featureText}>Reservas automáticas</span>
            </div>
            <div style={styles.feature}>
              <span style={styles.featureText}>Pagos integrados</span>
            </div>
            <div style={styles.feature}>
              <span style={styles.featureText}>Control nutricional</span>
            </div>
          </div>

        </div>

        {/* Indicadores del carrusel */}
        <div style={styles.carouselIndicators}>
          {lunches.map((_, index) => (
            <button
              key={index}
              style={{
                ...styles.indicator,
                ...(index === currentSlide ? styles.indicatorActive : {})
              }}
              onClick={() => setCurrentSlide(index)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// Estilos mejorados
const styles = {
  loginContainer: {
    minHeight: '100vh',
    background: '#ffffff',
    display: 'flex',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    position: 'relative',
    overflow: 'hidden',
  },
  loginCard: {
    flex: 1,
    maxWidth: '480px',
    background: 'white',
    padding: '3rem 2.5rem',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    zIndex: 2,
    borderRight: '1px solid #f1f3f4',
  },
  sidePanel: {
    flex: 1,
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    zIndex: 2,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(135deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.4) 100%)',
    zIndex: 1,
  },
  carousel: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
  },
  carouselSlide: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    transition: 'all 0.8s ease-in-out',
  },
  carouselImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  sideContent: {
    maxWidth: '500px',
    textAlign: 'left',
    position: 'relative',
    zIndex: 2,
    padding: '2rem',
  },
  mainLogo: {
    marginBottom: '3rem',
  },
  mainLogoText: {
    fontSize: '1.8rem',
    fontWeight: '700',
    letterSpacing: '-0.02em',
    color: 'white',
  },
  heroTitle: {
    fontSize: '3rem',
    fontWeight: '700',
    lineHeight: 1.1,
    margin: '0 0 1.5rem 0',
    letterSpacing: '-0.03em',
    color: 'white',
    textShadow: '0 2px 4px rgba(210, 12, 12, 0.5)',
  },
  heroHighlight: {
    background: 'linear-gradient(135deg, #ffffffff 0%, #ffffffff 100%)',
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    textShadow: 'none',
  },
  heroSubtitle: {
    fontSize: '1.3rem',
    lineHeight: 1.4,
    margin: '0 0 3rem 0',
    fontWeight: '300',
    letterSpacing: '-0.01em',
    color: 'rgba(255,255,255,0.9)',
    textShadow: '0 1px 2px rgba(0,0,0,0.5)',
  },
  features: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  feature: {
    padding: '0.75rem 0',
    borderBottom: '1px solid rgba(255,255,255,0.2)',
  },
  featureText: {
    fontSize: '1.1rem',
    color: 'rgba(255,255,255,0.9)',
    textShadow: '0 1px 2px rgba(0,0,0,0.5)',
  },
  carouselIndicators: {
    position: 'absolute',
    bottom: '2rem',
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex',
    gap: '0.5rem',
    zIndex: 3,
  },
  indicator: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    border: 'none',
    background: 'rgba(255,255,255,0.4)',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  indicatorActive: {
    background: 'white',
    transform: 'scale(1.2)',
  },
  // Estilos del panel izquierdo
  header: {
    textAlign: 'center',
    marginBottom: '2.5rem',
  },
  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '2rem',
  },
  logoText: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  logoTitle: {
    fontSize: '2rem',
    fontWeight: '800',
    color: '#1e293b',
    lineHeight: 1,
    marginBottom: '0.25rem',
  },
  logoSubtitle: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#667eea',
    lineHeight: 1,
  },
  title: {
    fontSize: '2rem',
    fontWeight: '700',
    color: '#1e293b',
    margin: '0 0 0.5rem 0',
    letterSpacing: '-0.025em',
  },
  subtitle: {
    color: '#64748b',
    fontSize: '1rem',
    margin: 0,
    fontWeight: '400',
  },
  form: {
    marginBottom: '2rem',
  },
  errorMessage: {
    background: 'rgba(239, 68, 68, 0.05)',
    border: '1px solid rgba(239, 68, 68, 0.2)',
    color: '#073cc3ff',
    padding: '1rem',
    borderRadius: '12px',
    marginBottom: '1.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.9rem',
    fontWeight: '500',
  },
  errorIcon: {
    fontSize: '1.1rem',
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
    color: '#374151',
    fontWeight: '600',
    fontSize: '0.9rem',
    letterSpacing: '0.025em',
  },
  inputContainer: {
    position: 'relative',
  },
  input: {
    width: '100%',
    padding: '1rem 1rem',
    border: '2px solid #e5e7eb',
    borderRadius: '12px',
    fontSize: '1rem',
    transition: 'all 0.2s ease',
    background: 'white',
    boxSizing: 'border-box',
    color: '#1f2937',
    fontWeight: '500',
  },
  rememberForgot: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
    fontSize: '0.9rem',
  },
  rememberMe: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    cursor: 'pointer',
  },
  checkbox: {
    width: '16px',
    height: '16px',
    borderRadius: '4px',
    border: '2px solid #d1d5db',
    cursor: 'pointer',
  },
  checkboxLabel: {
    color: '#6b7280',
    fontWeight: '500',
  },
  forgotLink: {
    color: '#667eea',
    textDecoration: 'none',
    fontWeight: '500',
    transition: 'color 0.2s ease',
  },
  button: {
    width: '100%',
    padding: '1rem 1.5rem',
    background: 'linear-gradient(135deg, #262fe5ff 0%, #882bf3ff 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
    letterSpacing: '0.025em',
  },
  buttonLoading: {
    width: '100%',
    padding: '1rem 1.5rem',
    background: 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '1rem',
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
  },
  registerText: {
    color: '#6b7280',
    margin: 0,
    fontSize: '0.95rem',
  },
  registerLink: {
    color: '#667eea',
    textDecoration: 'none',
    fontWeight: '600',
    marginLeft: '0.5rem',
    transition: 'color 0.2s ease',
  },
};

// Estilos globales
const globalStyles = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  input:focus {
    outline: none;
    border-color: #667eea !important;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1) !important;
    transform: translateY(-1px);
  }
  
  button:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4) !important;
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