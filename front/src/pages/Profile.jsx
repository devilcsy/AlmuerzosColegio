import React from 'react';
import { getStoredUser } from '../utils/auth';

const Profile = () => {
  const user = getStoredUser();

  if (!user) {
    return (
      <div style={styles.errorContainer}>
        <div style={styles.errorCard}>
          <span style={styles.errorIcon}>⚠️</span>
          <h2 style={styles.errorTitle}>Error al cargar perfil</h2>
          <p style={styles.errorText}>No se pudo cargar la información del usuario</p>
        </div>
      </div>
    );
  }

  const getRoleBadge = (role) => {
    const roleStyles = {
      ADMIN: { background: '#ef4444', color: 'white' },
      PARENT: { background: '#3b82f6', color: 'white' },
      STUDENT: { background: '#10b981', color: 'white' },
    };
    
    return {
      ...roleStyles[role] || { background: '#6b7280', color: 'white' },
      padding: '0.25rem 0.75rem',
      borderRadius: '20px',
      fontSize: '0.8rem',
      fontWeight: '600',
      textTransform: 'capitalize',
    };
  };

  return (
    <div style={styles.container}>
      {/* Header del perfil */}
      <div style={styles.header}>
        <h1 style={styles.title}>Mi Perfil</h1>
        <p style={styles.subtitle}>Gestiona tu información personal y cuenta</p>
      </div>

      {/* Tarjeta principal */}
      <div style={styles.profileCard}>
        {/* Avatar y información básica */}
        <div style={styles.profileHeader}>
          <div style={styles.avatarSection}>
            <div style={styles.avatar}>
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <div style={styles.avatarInfo}>
              <h2 style={styles.userName}>{user.name}</h2>
              <span style={getRoleBadge(user.role)}>
                {user.role?.toLowerCase()}
              </span>
            </div>
          </div>
          
          <div style={styles.balanceSection}>
            <span style={styles.balanceLabel}>Saldo disponible</span>
            <span style={styles.balanceAmount}>${user.balance?.toFixed(2) || '0.00'}</span>
          </div>
        </div>

        {/* Información detallada */}
        <div style={styles.detailsGrid}>
          <div style={styles.detailItem}>
            <div style={styles.detailIcon}>📧</div>
            <div style={styles.detailContent}>
              <span style={styles.detailLabel}>Correo electrónico</span>
              <span style={styles.detailValue}>{user.email}</span>
            </div>
          </div>

          {user.studentId && (
            <div style={styles.detailItem}>
              <div style={styles.detailIcon}>🎓</div>
              <div style={styles.detailContent}>
                <span style={styles.detailLabel}>ID Estudiante</span>
                <span style={styles.detailValue}>{user.studentId}</span>
              </div>
            </div>
          )}

          {user.department && (
            <div style={styles.detailItem}>
              <div style={styles.detailIcon}>🏫</div>
              <div style={styles.detailContent}>
                <span style={styles.detailLabel}>Departamento/Grado</span>
                <span style={styles.detailValue}>{user.department}</span>
              </div>
            </div>
          )}

          <div style={styles.detailItem}>
            <div style={styles.detailIcon}>👤</div>
            <div style={styles.detailContent}>
              <span style={styles.detailLabel}>Tipo de cuenta</span>
              <span style={styles.detailValue}>
                {user.role === 'ADMIN' && 'Administrador'}
                {user.role === 'PARENT' && 'Padre/Madre'}
                {user.role === 'STUDENT' && 'Estudiante'}
              </span>
            </div>
          </div>

         
        </div>

        {/* Información adicional según el rol */}
        {user.role === 'STUDENT' && (
          <div style={styles.additionalInfo}>
            <h3 style={styles.infoTitle}>Información Académica</h3>
            <p style={styles.infoText}>
              Tu cuenta está vinculada al sistema de almuerzos escolares. 
              Puedes realizar compras directamente desde el catálogo.
            </p>
          </div>
        )}

        {user.role === 'PARENT' && (
          <div style={styles.additionalInfo}>
            <h3 style={styles.infoTitle}>Gestión Familiar</h3>
            <p style={styles.infoText}>
              Como padre/madre, puedes gestionar los almuerzos de tus hijos 
              y recargar sus saldos desde el dashboard principal.
            </p>
          </div>
        )}

        {user.role === 'ADMIN' && (
          <div style={styles.additionalInfo}>
            <h3 style={styles.infoTitle}>Panel de Administración</h3>
            <p style={styles.infoText}>
              Tienes acceso completo al sistema. Puedes gestionar usuarios, 
              ver estadísticas y configurar el sistema desde el panel de admin.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// Estilos modernos
const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
    padding: '2rem',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  header: {
    textAlign: 'center',
    marginBottom: '2rem',
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: '700',
    color: '#1e293b',
    margin: '0 0 0.5rem 0',
    background: 'linear-gradient(135deg, #3b82f6, #1e40af)',
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  subtitle: {
    fontSize: '1.1rem',
    color: '#64748b',
    margin: 0,
  },
  profileCard: {
    background: 'white',
    borderRadius: '20px',
    padding: '2.5rem',
    boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
    maxWidth: '600px',
    margin: '0 auto',
    border: '1px solid rgba(255,255,255,0.2)',
  },
  profileHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '2rem',
    paddingBottom: '2rem',
    borderBottom: '1px solid #f1f5f9',
  },
  avatarSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  avatar: {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #3b82f6, #1e40af)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontSize: '1.5rem',
    fontWeight: '700',
    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
  },
  avatarInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  userName: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#1e293b',
    margin: 0,
  },
  balanceSection: {
    textAlign: 'right',
  },
  balanceLabel: {
    display: 'block',
    fontSize: '0.9rem',
    color: '#64748b',
    marginBottom: '0.25rem',
  },
  balanceAmount: {
    fontSize: '2rem',
    fontWeight: '700',
    color: '#10b981',
  },
  detailsGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
    marginBottom: '2rem',
  },
  detailItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '1rem',
    background: '#f8fafc',
    borderRadius: '12px',
    border: '1px solid #e5e7eb',
  },
  detailIcon: {
    fontSize: '1.2rem',
    width: '40px',
    textAlign: 'center',
  },
  detailContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  },
  detailLabel: {
    fontSize: '0.8rem',
    color: '#64748b',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  detailValue: {
    fontSize: '1rem',
    color: '#1e293b',
    fontWeight: '600',
  },
  additionalInfo: {
    background: 'linear-gradient(135deg, #f0f9ff, #e0f2fe)',
    padding: '1.5rem',
    borderRadius: '12px',
    border: '1px solid #bae6fd',
  },
  infoTitle: {
    fontSize: '1.1rem',
    fontWeight: '600',
    color: '#0369a1',
    margin: '0 0 0.5rem 0',
  },
  infoText: {
    fontSize: '0.9rem',
    color: '#0c4a6e',
    lineHeight: 1.5,
    margin: 0,
  },
  errorContainer: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
  },
  errorCard: {
    background: 'white',
    padding: '3rem',
    borderRadius: '20px',
    textAlign: 'center',
    boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
    maxWidth: '400px',
  },
  errorIcon: {
    fontSize: '3rem',
    marginBottom: '1rem',
  },
  errorTitle: {
    fontSize: '1.5rem',
    fontWeight: '600',
    color: '#1e293b',
    margin: '0 0 1rem 0',
  },
  errorText: {
    color: '#64748b',
    margin: 0,
  },
};

export default Profile;