//DashboardStudent.jsx
import React, { useEffect, useState } from 'react';
import { getStoredUser } from '../utils/auth';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

const DashboardStudent = () => {
  const [user, setUser] = useState(null);
  const [recentPurchases, setRecentPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBalanceModal, setShowBalanceModal] = useState(false);
  const [balanceAmount, setBalanceAmount] = useState('');
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [backgroundImage, setBackgroundImage] = useState('');
  const navigate = useNavigate();
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    const storedUser = getStoredUser();
    setUser(storedUser);

    // Cargar compras recientes
    const purchasesData = await api.getUserPurchases();
    if (purchasesData.success) {
      setRecentPurchases(purchasesData.purchases?.slice(0, 3) || []);
    }

    // Cargar imagen de fondo
    try {
      const lunchesData = await api.getAvailableLunches();
      if (lunchesData.length > 0) {
        setBackgroundImage(lunchesData[0].strMealThumb);
      }
    } catch (error) {
      console.error('Error loading background image:', error);
    }

    setLoading(false);
  };

  const handleAddBalance = async () => {
    if (!balanceAmount || balanceAmount <= 0) {
      alert('Por favor ingresa un monto válido');
      return;
    }

    setBalanceLoading(true);
    const result = await api.addBalance(parseFloat(balanceAmount));
    
    if (result.success) {
      alert(`¡Saldo recargado exitosamente! Nuevo saldo: $${result.balance}`);
      setShowBalanceModal(false);
      setBalanceAmount('');
      
      // Actualizar datos del usuario
      const userData = getStoredUser();
      if (userData) {
        userData.balance = result.balance;
        localStorage.setItem('userData', JSON.stringify(userData));
        setUser(userData);
      }
    } else {
      alert(result.message || 'Error al recargar saldo');
    }
    
    setBalanceLoading(false);
  };

  const handleQuickAction = (action) => {
    switch (action) {
      case 'lunches':
         navigate('/lunches');
        break;
      case 'purchases':
        navigate('/purchases');
        break;
      case 'balance':
        setShowBalanceModal(true);
        break;
      default:
        break;
    }
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p style={styles.loadingText}>Cargando dashboard...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Fondo con overlay */}
      <div style={styles.backgroundSection}>
        {backgroundImage && (
          <div 
            style={{
              ...styles.backgroundImage,
              backgroundImage: `url(${backgroundImage})`
            }}
          />
        )}
        <div style={styles.backgroundOverlay}></div>
      </div>

      {/* Contenido principal */}
      <div style={styles.content}>
        {user && (
          <div style={styles.headerSection}>
            <div style={styles.headerCard}>
              <div style={styles.headerContent}>
                <h1 style={styles.welcomeTitle}>¡Bienvenido, {user.name}!</h1>
                <p style={styles.welcomeSubtitle}>Panel de estudiante - Sistema de almuerzos</p>
              </div>
              <div style={styles.userBadge}>
                <span style={styles.userRole}>Estudiante</span>
              </div>
            </div>

            {/* Estadísticas rápidas */}
            <div style={styles.statsGrid}>
              <div style={styles.statCard}>
                <div style={styles.statContent}>
                  <span style={styles.statLabel}>Saldo Actual</span>
                  <span style={styles.balanceAmount}>${user.balance || 0}</span>
                </div>
                <div style={styles.statIcon}>💰</div>
              </div>

              <div style={styles.statCard}>
                <div style={styles.statContent}>
                  <span style={styles.statLabel}>ID Estudiante</span>
                  <span style={styles.studentId}>{user.studentId || 'No asignado'}</span>
                </div>
                <div style={styles.statIcon}>🎓</div>
              </div>
            </div>
          </div>
        )}

        {/* Acciones Rápidas */}
        <div style={styles.actionsSection}>
          <div style={styles.actionsCard}>
            <h2 style={styles.sectionTitle}>Acciones Rápidas</h2>
            <p style={styles.sectionDescription}>Gestiona tus almuerzos y saldo</p>
            
            <div style={styles.actionsGrid}>
              <button 
                onClick={() => handleQuickAction('lunches')} 
                style={styles.actionButtonPrimary}
              >
                <span style={styles.actionIcon}>🍽️</span>
                <span style={styles.actionText}>Ver Almuerzos</span>
                <span style={styles.actionDescription}>Explora el menú disponible</span>
              </button>
              
              <button 
                onClick={() => handleQuickAction('balance')} 
                style={styles.actionButtonSecondary}
              >
                <span style={styles.actionIcon}>💰</span>
                <span style={styles.actionText}>Recargar Saldo</span>
                <span style={styles.actionDescription}>Agrega fondos a tu cuenta</span>
              </button>
              
              <button 
                onClick={() => handleQuickAction('purchases')} 
                style={styles.actionButtonTertiary}
              >
                <span style={styles.actionIcon}>📊</span>
                <span style={styles.actionText}>Mi Historial</span>
                <span style={styles.actionDescription}>Revisa tus compras</span>
              </button>
            </div>
          </div>
        </div>

        {/* Compras Recientes */}
        <div style={styles.historySection}>
          <div style={styles.historyCard}>
            <h2 style={styles.sectionTitle}>Compras Recientes</h2>
            <p style={styles.sectionDescription}>Tus últimas transacciones</p>
            
            <div style={styles.purchasesList}>
              {recentPurchases.length > 0 ? (
                recentPurchases.map(purchase => (
                  <div key={purchase._id} style={styles.purchaseItem}>
                    <div style={styles.purchaseInfo}>
                      <div style={styles.purchaseHeader}>
                        <span style={styles.purchaseDate}>
                          {new Date(purchase.createdAt).toLocaleDateString()}
                        </span>
                        <span style={styles.purchaseType}>
                          {purchase.type}
                        </span>
                      </div>
                      <span style={styles.purchaseName}>
                        {purchase.lunchName || 'Compra de almuerzo'}
                      </span>
                    </div>
                    <div style={styles.purchaseAmountSection}>
                      <span style={styles.purchaseAmount}>${purchase.totalAmount}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div style={styles.emptyState}>
                  <span style={styles.emptyIcon}>🛒</span>
                  <h3 style={styles.emptyTitle}>No hay compras recientes</h3>
                  <p style={styles.emptyText}>
                    Cuando realices compras, aparecerán aquí.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Recarga */}
      {showBalanceModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h3 style={styles.modalTitle}>Recargar Saldo</h3>
            <p style={styles.modalDescription}>
              Ingresa el monto que deseas agregar a tu cuenta
            </p>
            
            <input
              type="number"
              value={balanceAmount}
              onChange={(e) => setBalanceAmount(e.target.value)}
              placeholder="Ej: 20.00"
              style={styles.modalInput}
            />
            
            <div style={styles.modalActions}>
              <button 
                onClick={() => setShowBalanceModal(false)} 
                style={styles.modalCancel}
              >
                Cancelar
              </button>
              <button 
                onClick={handleAddBalance} 
                style={styles.modalConfirm}
                disabled={balanceLoading}
              >
                {balanceLoading ? (
                  <>
                    <div style={styles.miniSpinner}></div>
                    Procesando...
                  </>
                ) : (
                  'Recargar'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Estilos mejorados
const styles = {
  container: {
    minHeight: '100vh',
    background: '#f8fafc',
    position: 'relative',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  backgroundSection: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundAttachment: 'fixed',
  },
  backgroundOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(135deg, rgba(57, 3, 3, 0.85) 0%, rgba(23, 9, 9, 0.8) 100%)',
  },
  content: {
    position: 'relative',
    zIndex: 1,
    padding: '2rem',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    background: '#f8fafc',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #e5e7eb',
    borderTop: '4px solid #3b82f6',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  loadingText: {
    marginTop: '1rem',
    color: '#6b7280',
    fontSize: '1rem',
  },
  headerSection: {
    marginBottom: '2rem',
  },
  headerCard: {
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)',
    padding: '2rem',
    borderRadius: '20px',
    marginBottom: '1.5rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
    border: '1px solid rgba(255,255,255,0.2)',
  },
  headerContent: {
    flex: 1,
  },
  welcomeTitle: {
    fontSize: '2.5rem',
    fontWeight: '700',
    color: '#1e293b',
    margin: '0 0 0.5rem 0',
    letterSpacing: '-0.025em',
  },
  welcomeSubtitle: {
    fontSize: '1.1rem',
    color: '#64748b',
    margin: 0,
    fontWeight: '400',
  },
  userBadge: {
    background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
    padding: '0.5rem 1.5rem',
    borderRadius: '50px',
  },
  userRole: {
    color: 'white',
    fontWeight: '600',
    fontSize: '0.9rem',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '1.5rem',
  },
  statCard: {
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)',
    padding: '1.5rem',
    borderRadius: '16px',
    boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
    border: '1px solid rgba(255,255,255,0.2)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  statLabel: {
    fontSize: '0.9rem',
    color: '#64748b',
    fontWeight: '500',
  },
  balanceAmount: {
    fontSize: '2rem',
    fontWeight: '700',
    color: '#10b981',
  },
  studentId: {
    fontSize: '1.5rem',
    fontWeight: '600',
    color: '#1e293b',
  },
  statIcon: {
    fontSize: '2.5rem',
    opacity: 0.7,
  },
  actionsSection: {
    marginBottom: '2rem',
  },
  actionsCard: {
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)',
    padding: '2rem',
    borderRadius: '20px',
    boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
    border: '1px solid rgba(255,255,255,0.2)',
  },
  sectionTitle: {
    fontSize: '1.5rem',
    fontWeight: '600',
    color: '#1e293b',
    margin: '0 0 0.5rem 0',
  },
  sectionDescription: {
    fontSize: '1rem',
    color: '#64748b',
    margin: '0 0 1.5rem 0',
  },
  actionsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '1.5rem',
  },
  actionButtonPrimary: {
    background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
    color: 'white',
    border: 'none',
    padding: '1.5rem',
    borderRadius: '16px',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '0.5rem',
    transition: 'all 0.3s ease',
    textAlign: 'left',
  },
  actionButtonSecondary: {
    background: 'linear-gradient(135deg, #10b981, #059669)',
    color: 'white',
    border: 'none',
    padding: '1.5rem',
    borderRadius: '16px',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '0.5rem',
    transition: 'all 0.3s ease',
    textAlign: 'left',
  },
  actionButtonTertiary: {
    background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
    color: 'white',
    border: 'none',
    padding: '1.5rem',
    borderRadius: '16px',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '0.5rem',
    transition: 'all 0.3s ease',
    textAlign: 'left',
  },
  actionIcon: {
    fontSize: '2rem',
    marginBottom: '0.5rem',
  },
  actionText: {
    fontSize: '1.1rem',
    fontWeight: '600',
  },
  actionDescription: {
    fontSize: '0.8rem',
    opacity: 0.9,
    fontWeight: '400',
  },
  historySection: {
    marginBottom: '2rem',
  },
  historyCard: {
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)',
    padding: '2rem',
    borderRadius: '20px',
    boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
    border: '1px solid rgba(255,255,255,0.2)',
  },
  purchasesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  purchaseItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1.25rem',
    background: '#f8fafc',
    borderRadius: '12px',
    border: '1px solid #e5e7eb',
    transition: 'all 0.2s ease',
  },
  purchaseInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    flex: 1,
  },
  purchaseHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  purchaseDate: {
    fontSize: '0.9rem',
    color: '#64748b',
    fontWeight: '500',
  },
  purchaseType: {
    fontSize: '0.75rem',
    color: '#3b82f6',
    background: '#dbeafe',
    padding: '0.25rem 0.75rem',
    borderRadius: '50px',
    fontWeight: '600',
  },
  purchaseName: {
    fontSize: '1rem',
    fontWeight: '500',
    color: '#1e293b',
  },
  purchaseAmountSection: {
    textAlign: 'right',
  },
  purchaseAmount: {
    fontSize: '1.25rem',
    fontWeight: '700',
    color: '#10b981',
  },
  emptyState: {
    textAlign: 'center',
    padding: '3rem',
    color: '#9ca3af',
  },
  emptyIcon: {
    fontSize: '3rem',
    marginBottom: '1rem',
  },
  emptyTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    margin: '0 0 0.5rem 0',
  },
  emptyText: {
    fontSize: '0.9rem',
    opacity: 0.8,
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    backdropFilter: 'blur(5px)',
  },
  modal: {
    background: 'white',
    padding: '2rem',
    borderRadius: '16px',
    width: '90%',
    maxWidth: '400px',
    boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
  },
  modalTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#1e293b',
    margin: '0 0 0.5rem 0',
  },
  modalDescription: {
    fontSize: '0.9rem',
    color: '#64748b',
    margin: '0 0 1.5rem 0',
  },
  modalInput: {
    width: '100%',
    padding: '1rem',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '1rem',
    marginBottom: '1.5rem',
  },
  modalActions: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'flex-end',
  },
  modalCancel: {
    background: '#6b7280',
    color: 'white',
    border: 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '500',
  },
  modalConfirm: {
    background: '#10b981',
    color: 'white',
    border: 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  miniSpinner: {
    width: '16px',
    height: '16px',
    border: '2px solid transparent',
    borderTop: '2px solid white',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
};

// Agregar estilos globales para la animación
const globalStyles = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  .action-button:hover {
    transform: translateY(-4px);
    box-shadow: 0 15px 30px rgba(0,0,0,0.2);
  }
  
  .purchase-item:hover {
    background: #f1f5f9;
    transform: translateX(4px);
  }
`;

// Inyectar estilos globales
const styleSheet = document.createElement('style');
styleSheet.innerText = globalStyles;
document.head.appendChild(styleSheet);

export default DashboardStudent;