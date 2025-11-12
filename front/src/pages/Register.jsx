import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI, saveAuthData } from '../utils/auth';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'STUDENT',
    studentId: '',
    department: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

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
    setSuccess('');

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      setIsLoading(false);
      return;
    }

    const { confirmPassword, ...userData } = formData;

    try {
      const result = await authAPI.register(userData);
      if (result.success) {
        setSuccess('¡Usuario registrado exitosamente! Redirigiendo...');

        const loginResult = await authAPI.login(userData.email, userData.password);
        if (loginResult.success) {
          saveAuthData(loginResult.token, loginResult.user);
          setTimeout(() => navigate('/dashboard'), 2000);
        } else {
          setTimeout(() => navigate('/login'), 2000);
        }
      } else {
        setError(result.message || 'Error al registrar usuario');
      }
    } catch (error) {
      setError('Error de conexión con el servidor');
    }

    setIsLoading(false);
  };

  return (
    <div style={styles.registerContainer}>
      <div style={styles.backgroundAnimation}>
        <div style={styles.floatingCircle1}></div>
        <div style={styles.floatingCircle2}></div>
        <div style={styles.floatingCircle3}></div>
      </div>

      <div style={styles.registerCard}>
        <div style={styles.header}>
          <div style={styles.logo}>
            <span style={styles.logoIcon}>🍽️</span>
          </div>
          <h1 style={styles.title}>Crear Cuenta</h1>
          <p style={styles.subtitle}>Únete al sistema de almuerzos</p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          {error && (
            <div style={styles.errorMessage}>
              <span style={styles.errorIcon}>⚠️</span>
              {error}
            </div>
          )}
          {success && (
            <div style={styles.successMessage}>
              <span style={styles.successIcon}>✅</span>
              {success}
            </div>
          )}

          <div style={styles.twoColumns}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>
                <span style={styles.labelText}>Nombre Completo</span>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                  style={styles.input}
                  placeholder="Ej: Juan Pérez"
                />
              </label>
            </div>

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
          </div>

          <div style={styles.twoColumns}>
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
                  placeholder="Mínimo 6 caracteres"
                />
              </label>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>
                <span style={styles.labelText}>Confirmar Contraseña</span>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                  style={styles.input}
                  placeholder="Repite tu contraseña"
                />
              </label>
            </div>
          </div>

          {/* Cambiamos STAFF -> PARENT */}
          <div style={styles.twoColumns}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>
                <span style={styles.labelText}>Tipo de Usuario</span>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  disabled={isLoading}
                  style={styles.select}
                >
                  <option value="STUDENT">Estudiante</option>
                  <option value="PARENT">Padre</option>
                  <option value="ADMIN">Administrador</option>
                </select>
              </label>
            </div>

            {formData.role === 'STUDENT' && (
              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  <span style={styles.labelText}>ID de Estudiante</span>
                  <input
                    type="text"
                    name="studentId"
                    value={formData.studentId}
                    onChange={handleChange}
                    disabled={isLoading}
                    style={styles.input}
                    placeholder="Ej: 2024001"
                  />
                </label>
              </div>
            )}
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>
              <span style={styles.labelText}>Departamento/Grado</span>
              <input
                type="text"
                name="department"
                value={formData.department}
                onChange={handleChange}
                disabled={isLoading}
                style={styles.input}
                placeholder="Ej: 10mo Grado o Contabilidad"
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
                Creando cuenta...
              </div>
            ) : (
              'Crear Cuenta'
            )}
          </button>
        </form>

        <div style={styles.footer}>
          <p style={styles.loginText}>
            ¿Ya tienes una cuenta?
            <Link to="/login" style={styles.loginLink}>
              Inicia sesión aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

// Estilos (similar al Login pero adaptado)
const styles = {
  registerContainer: {
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
    top: '15%',
    left: '15%',
    width: '120px',
    height: '120px',
    background: 'rgba(255,255,255,0.1)',
    borderRadius: '50%',
    animation: 'float 6s ease-in-out infinite',
  },
  floatingCircle2: {
    position: 'absolute',
    top: '65%',
    right: '15%',
    width: '180px',
    height: '180px',
    background: 'rgba(255,255,255,0.05)',
    borderRadius: '50%',
    animation: 'float 8s ease-in-out infinite 1s',
  },
  floatingCircle3: {
    position: 'absolute',
    bottom: '15%',
    left: '25%',
    width: '100px',
    height: '100px',
    background: 'rgba(255,255,255,0.08)',
    borderRadius: '50%',
    animation: 'float 7s ease-in-out infinite 0.5s',
  },
  registerCard: {
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(20px)',
    padding: '3rem',
    borderRadius: '24px',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.2)',
    width: '100%',
    maxWidth: '600px',
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
  twoColumns: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem',
    '@media (max-width: 768px)': {
      gridTemplateColumns: '1fr',
    },
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
  successMessage: {
    background: 'rgba(40, 167, 69, 0.1)',
    border: '1px solid rgba(40, 167, 69, 0.2)',
    color: '#28a745',
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
  successIcon: {
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
  select: {
    width: '100%',
    padding: '1rem 1.25rem',
    border: '2px solid #e9ecef',
    borderRadius: '12px',
    fontSize: '1rem',
    transition: 'all 0.3s ease',
    background: 'white',
    boxSizing: 'border-box',
    cursor: 'pointer',
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
    marginTop: '1rem',
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
    marginTop: '1rem',
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
  loginText: {
    color: '#6c757d',
    margin: 0,
  },
  loginLink: {
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

export default Register;
