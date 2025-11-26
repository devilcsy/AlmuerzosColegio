// DashboardParent.jsx
import React, { useEffect, useState } from 'react';
import { getStoredUser, parentAPI } from '../utils/auth';
import api from '../services/api';

const DashboardParent = () => {
  const [user, setUser] = useState(null);
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [purchases, setPurchases] = useState([]);
  const [availableLunches, setAvailableLunches] = useState([]);
  const [backgroundImage, setBackgroundImage] = useState('');
  const [loading, setLoading] = useState(true);
  const [showBalanceModal, setShowBalanceModal] = useState(false);
  const [showLunchModal, setShowLunchModal] = useState(false);
  const [balanceAmount, setBalanceAmount] = useState('');
  const [selectedLunch, setSelectedLunch] = useState(null);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [purchaseLoading, setPurchaseLoading] = useState(false);
  
  // Nuevos estados para categorías
  const [selectedCategory, setSelectedCategory] = useState('chicken');
  const [lunchLoading, setLunchLoading] = useState(false);

  const categories = [
    { value: 'chicken', label: '🍗 Pollo' },
    { value: 'beef', label: '🥩 Carne' },
    { value: 'seafood', label: '🐟 Mariscos' },
    { value: 'vegetarian', label: '🥗 Vegetariano' },
    { value: 'pasta', label: '🍝 Pasta' },
    { value: 'dessert', label: '🍰 Postres' }
  ];

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Cargar almuerzos cuando cambia la categoría
  useEffect(() => {
    if (showLunchModal) {
      loadAvailableLunches();
    }
  }, [selectedCategory, showLunchModal]);

  const loadDashboardData = async () => {
    const storedUser = getStoredUser();
    setUser(storedUser);

    try {
      // Obtener hijos
      const childrenData = await parentAPI.getMyChildren();
      if (childrenData.success && childrenData.children) {
        setChildren(childrenData.children);
        if (childrenData.children.length > 0) {
          setSelectedChild(childrenData.children[0]);
          await loadPurchases(childrenData.children[0]._id);
        }
      }

      // Imagen de fondo
      const bgLunches = await api.getAvailableLunches();
      if (bgLunches.length > 0) {
        setBackgroundImage(bgLunches[0].strMealThumb);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }

    setLoading(false);
  };

  const loadAvailableLunches = async () => {
    setLunchLoading(true);
    try {
      const data = await api.getLunchesByCategory(selectedCategory);
      setAvailableLunches(data || []);
      
      // Actualizar imagen de fondo con la primera imagen de la categoría
      if (data.length > 0) {
        setBackgroundImage(data[0].strMealThumb);
      }
    } catch (error) {
      console.error('Error cargando almuerzos:', error);
      setAvailableLunches([]);
    } finally {
      setLunchLoading(false);
    }
  };

  const loadPurchases = async (childId) => {
    try {
      const data = await parentAPI.getChildPurchases(childId);
      if (data.success) {
        setPurchases(data.purchases?.slice(0, 5) || []);
      } else {
        setPurchases([]);
      }
    } catch (error) {
      console.error('Error loading purchases:', error);
    }
  };

  useEffect(() => {
    if (selectedChild) {
      loadPurchases(selectedChild._id);
    }
  }, [selectedChild]);

  const handleAddBalance = async () => {
    if (!selectedChild || balanceAmount <= 0) {
      alert('Por favor ingresa un monto válido');
      return;
    }

    setBalanceLoading(true);

    try {
      const result = await parentAPI.rechargeChild(
        selectedChild._id, 
        parseFloat(balanceAmount)
      );

      if (result.success) {
        alert(`¡Saldo recargado exitosamente para ${selectedChild.name}! Nuevo saldo: $${result.balance}`);
        setShowBalanceModal(false);
        setBalanceAmount('');
        // Actualizar datos
        await loadDashboardData();
      } else {
        alert(result.message || 'Error al recargar saldo');
      }
    } catch (error) {
      console.error('Error en recarga:', error);
      alert('Error en la recarga');
    }

    setBalanceLoading(false);
  };

  const handlePurchaseLunch = async () => {
    if (!selectedChild || !selectedLunch) {
      alert('Selecciona un hijo y un almuerzo');
      return;
    }

    setPurchaseLoading(true);
    
    const purchaseData = {
      items: [{
        name: selectedLunch.strMeal,
        price: 5.00,
        quantity: 1
      }],
      totalAmount: 5.00,
      type: 'LUNCH',
      childId: selectedChild._id
    };

    console.log('🔍 DEBUG Purchase - Datos enviados:', purchaseData);
    
    const result = await api.makePurchase(purchaseData);

    if (result.success) {
      alert(`¡Compra realizada exitosamente para ${selectedChild.name}!`);
      setShowLunchModal(false);
      setSelectedLunch(null);
      await loadPurchases(selectedChild._id);
      await loadDashboardData();
    } else {
      alert(result.message || 'Error al comprar almuerzo');
    }

    setPurchaseLoading(false);
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
    <div style={styles.dashboardContainer}>
      {/* Fondo con imágenes de almuerzos */}
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
          <div style={styles.headerCard}>
            <div style={styles.headerContent}>
              <h1 style={styles.welcomeTitle}>Bienvenido, {user.name}</h1>
              <p style={styles.welcomeSubtitle}>Panel de control - Gestión de hijos</p>
            </div>
            <div style={styles.userBadge}>
              <span style={styles.userRole}>Padre</span>
            </div>
          </div>
        )}

        {/* Selector de hijo */}
        <div style={styles.profileSection}>
          <h3 style={styles.sectionTitle}>Seleccionar Hijo</h3>
          {children.length > 0 ? (
            <div style={styles.profileGrid}>
              {children.map((child) => (
                <button
                  key={child._id}
                  onClick={() => setSelectedChild(child)}
                  style={selectedChild?._id === child._id ? styles.profileButtonActive : styles.profileButton}
                >
                  <div style={styles.profileInfo}>
                    <span style={styles.profileName}>{child.name}</span>
                    <span style={styles.profileBalance}>${child.balance || 0}</span>
                    <span style={styles.profileEmail}>{child.email}</span>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div style={styles.noChildrenMessage}>
              <p>No tienes hijos vinculados a tu cuenta.</p>
              <p style={styles.contactMessage}>Contacta con la administración para vincular hijos.</p>
            </div>
          )}
        </div>

     
        {selectedChild && (
          <div style={styles.mainGrid}>
            {/* Columna izquierda - Información del hijo */}
            <div style={styles.statsColumn}>
              <div style={styles.statsCard}>
                <h3 style={styles.cardTitle}>Información de {selectedChild.name}</h3>
                <div style={styles.balanceSection}>
                  <span style={styles.balanceLabel}>Saldo Actual</span>
                  <span style={styles.balanceAmount}>${selectedChild.balance || 0}</span>
                </div>
                <div style={styles.statusSection}>
                  <span style={styles.statusLabel}>Estado</span>
                  <span style={styles.statusActive}>Activo</span>
                </div>
              </div>

              {/* Acciones rápidas */}
              <div style={styles.actionsCard}>
                <h3 style={styles.cardTitle}>Acciones Rápidas</h3>
                <div style={styles.actionsGrid}>
                  <button 
                    onClick={() => setShowBalanceModal(true)} 
                    style={styles.actionButtonPrimary}
                  >
                    <span style={styles.actionIcon}>💰</span>
                    <span style={styles.actionText}>Recargar Saldo</span>
                  </button>
                  <button 
                    onClick={() => setShowLunchModal(true)} 
                    style={styles.actionButtonSecondary}
                  >
                    <span style={styles.actionIcon}>🍽️</span>
                    <span style={styles.actionText}>Comprar Almuerzo</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Columna derecha - Historial de compras */}
<div style={styles.actionsColumn}>
  <div style={styles.historyCard}>
    <h3 style={styles.cardTitle}>
      Historial de Compras - {selectedChild.name}
    </h3>
    <div style={styles.purchasesList}>
      {purchases.length > 0 ? (
        purchases.map((purchase) => (
          <div key={purchase._id} style={styles.purchaseItem}>
            <div style={styles.purchaseHeader}>
              <div style={styles.purchaseMain}>
                <span style={styles.purchaseName}>
                  {purchase.items?.[0]?.name || purchase.lunchName || 'Compra'}
                </span>
                <span style={styles.purchaseDate}>
                  {new Date(purchase.createdAt).toLocaleDateString('es-ES', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
              <span style={styles.purchaseAmount}>${purchase.totalAmount?.toFixed(2)}</span>
            </div>
            
            <div style={styles.purchaseFooter}>
              <span style={styles.purchaseType}>{purchase.type || 'LUNCH'}</span>
              <span style={styles.statusCompleted}>✓ Completada</span>
            </div>
          </div>
        ))
      ) : (
        <div style={styles.emptyState}>
          <span style={styles.emptyText}>No hay compras recientes</span>
        </div>
      )}
    </div>
  </div>
</div>
          </div>
        )}

        {/* Mensaje cuando no hay hijos */}
        {children.length === 0 && (
          <div style={styles.noChildrenCard}>
            <h3>👨‍👦 Gestión de Hijos</h3>
            <p>Actualmente no tienes hijos vinculados a tu cuenta.</p>
            <p>Contacta con la administración del sistema para vincular a tus hijos.</p>
          </div>
        )}
      </div>

      {/* Modal de Recarga */}
      {showBalanceModal && selectedChild && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h3 style={styles.modalTitle}>
              Recargar Saldo para {selectedChild.name}
            </h3>
            <input
              type="number"
              value={balanceAmount}
              onChange={(e) => setBalanceAmount(e.target.value)}
              placeholder="Monto a recargar"
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
                {balanceLoading ? 'Procesando...' : 'Recargar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Compra MEJORADO */}
      {showLunchModal && selectedChild && (
        <div style={styles.modalOverlay}>
          <div style={{ ...styles.modal, maxWidth: '800px', maxHeight: '90vh' }}>
            <h3 style={styles.modalTitle}>
              Comprar Almuerzo para {selectedChild.name}
            </h3>
            
            {/* Selector de categorías */}
            <div style={styles.categorySection}>
              <label style={styles.categoryLabel}>Seleccionar categoría:</label>
              <select 
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                style={styles.categorySelect}
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Grid de almuerzos */}
            {lunchLoading ? (
              <div style={styles.loadingState}>
                <div style={styles.spinner}></div>
                <p style={styles.loadingText}>Cargando almuerzos...</p>
              </div>
            ) : availableLunches.length === 0 ? (
              <div style={styles.emptyState}>
                <span style={styles.emptyIcon}>🍽️</span>
                <h4 style={styles.emptyTitle}>No hay platos disponibles</h4>
                <p style={styles.emptyText}>No se encontraron platos en esta categoría.</p>
              </div>
            ) : (
              <div style={styles.lunchesGrid}>
                {availableLunches.map((lunch) => (
                  <div
                    key={lunch.idMeal}
                    onClick={() => setSelectedLunch(lunch)}
                    style={{
                      ...styles.lunchOption,
                      ...(selectedLunch?.idMeal === lunch.idMeal && styles.lunchOptionSelected)
                    }}
                  >
                    <div style={styles.lunchImageContainer}>
                      <img 
                        src={lunch.strMealThumb} 
                        alt={lunch.strMeal}
                        style={styles.lunchImage}
                      />
                    </div>
                    <div style={styles.lunchInfo}>
                      <strong style={styles.lunchName}>{lunch.strMeal}</strong>
                      <span style={styles.lunchPrice}>$5.00</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div style={styles.modalActions}>
              <button 
                onClick={() => {
                  setShowLunchModal(false);
                  setSelectedLunch(null);
                }} 
                style={styles.modalCancel}
              >
                Cancelar
              </button>
              <button
                onClick={handlePurchaseLunch}
                style={styles.modalConfirm}
                disabled={purchaseLoading || !selectedLunch}
              >
                {purchaseLoading ? (
                  <>
                    <div style={styles.miniSpinner}></div>
                    Procesando...
                  </>
                ) : (
                  `Comprar - $5.00`
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Estilos
const styles = {
  dashboardContainer: {
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
  },
  backgroundOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(135deg, rgba(35, 31, 31, 0.9) 0%, rgba(64, 64, 65, 0.85) 100%)',
  },
  content: {
    position: 'relative',
    zIndex: 1,
    padding: '2rem',
    maxWidth: '1400px',
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
  headerCard: {
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)',
    padding: '2rem',
    borderRadius: '20px',
    marginBottom: '2rem',
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
    background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
    padding: '0.5rem 1rem',
    borderRadius: '50px',
  },
  userRole: {
    color: 'white',
    fontWeight: '600',
    fontSize: '0.9rem',
  },
  profileSection: {
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)',
    padding: '1.5rem',
    borderRadius: '16px',
    marginBottom: '2rem',
    boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
    border: '1px solid rgba(255,255,255,0.2)',
  },
  sectionTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#1e293b',
    margin: '0 0 1rem 0',
  },
  profileGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem',
  },
  profileButton: {
    background: 'white',
    border: '2px solid #e5e7eb',
    padding: '1.5rem',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    textAlign: 'left',
  },
  profileButtonActive: {
    background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
    border: '2px solid #3b82f6',
    padding: '1.5rem',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    textAlign: 'left',
  },
  profileInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  profileName: {
    fontSize: '1rem',
    fontWeight: '600',
    color: 'inherit',
  },
  profileBalance: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: 'inherit',
  },
  profileEmail: {
    fontSize: '0.8rem',
    color: 'inherit',
    opacity: 0.8,
    marginTop: '0.25rem',
  },
  mainGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1.5fr',
    gap: '2rem',
  },
  statsColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  actionsColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  statsCard: {
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)',
    padding: '1.5rem',
    borderRadius: '16px',
    boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
    border: '1px solid rgba(255,255,255,0.2)',
  },
  actionsCard: {
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)',
    padding: '1.5rem',
    borderRadius: '16px',
    boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
    border: '1px solid rgba(255,255,255,0.2)',
  },
  historyCard: {
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)',
    padding: '1.5rem',
    borderRadius: '16px',
    boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
    border: '1px solid rgba(255,255,255,0.2)',
  },
  cardTitle: {
    fontSize: '1.1rem',
    fontWeight: '600',
    color: '#1e293b',
    margin: '0 0 1.5rem 0',
  },
  balanceSection: {
    marginBottom: '1.5rem',
  },
  balanceLabel: {
    display: 'block',
    fontSize: '0.9rem',
    color: '#64748b',
    marginBottom: '0.5rem',
  },
  balanceAmount: {
    fontSize: '2.5rem',
    fontWeight: '700',
    color: '#10b981',
  },
  statusSection: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: '0.9rem',
    color: '#64748b',
  },
  statusActive: {
    color: '#10b981',
    fontWeight: '600',
    background: '#d1fae5',
    padding: '0.25rem 0.75rem',
    borderRadius: '50px',
    fontSize: '0.8rem',
  },
  actionsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem',
  },
  actionButtonPrimary: {
    background: 'linear-gradient(135deg, #10b981, #059669)',
    color: 'white',
    border: 'none',
    padding: '1.5rem',
    borderRadius: '12px',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.5rem',
    transition: 'all 0.3s ease',
  },
  actionButtonSecondary: {
    background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
    color: 'white',
    border: 'none',
    padding: '1.5rem',
    borderRadius: '12px',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.5rem',
    transition: 'all 0.3s ease',
  },
  actionIcon: {
    fontSize: '1.5rem',
  },
  actionText: {
    fontSize: '0.9rem',
    fontWeight: '600',
  },
  purchasesList: {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.75rem',
},
purchaseItem: {
  background: 'white',
  border: '1px solid #e5e7eb',
  borderRadius: '8px',
  padding: '1rem',
  transition: 'all 0.2s ease',
},
purchaseHeader: {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  marginBottom: '0.5rem',
},
purchaseMain: {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.25rem',
  flex: 1,
},
purchaseName: {
  fontSize: '0.9rem',
  fontWeight: '600',
  color: '#1e293b',
  lineHeight: 1.3,
},
purchaseDate: {
  fontSize: '0.75rem',
  color: '#6b7280',
},
purchaseAmount: {
  fontSize: '1rem',
  fontWeight: '700',
  color: '#10b981',
  marginLeft: '0.5rem',
},
purchaseFooter: {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingTop: '0.5rem',
  borderTop: '1px solid #f8fafc',
},
purchaseType: {
  fontSize: '0.75rem',
  color: '#6b7280',
  background: '#f3f4f6',
  padding: '0.2rem 0.5rem',
  borderRadius: '4px',
  textTransform: 'capitalize',
},
statusCompleted: {
  fontSize: '0.75rem',
  color: '#059669',
  fontWeight: '600',
  display: 'flex',
  alignItems: 'center',
  gap: '0.25rem',
},
emptyState: {
  textAlign: 'center',
  padding: '2rem',
  color: '#9ca3af',
},
emptyText: {
  fontSize: '0.9rem',
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
  },
  // Nuevos estilos para el modal de almuerzos
  categorySection: {
    marginBottom: '1.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  categoryLabel: {
    fontSize: '0.9rem',
    fontWeight: '600',
    color: '#374151',
  },
  categorySelect: {
    padding: '0.5rem',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '0.9rem',
    background: 'white',
    cursor: 'pointer',
    minWidth: '150px',
  },
  loadingState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '3rem',
  },
  lunchesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
    gap: '1rem',
    maxHeight: '400px',
    overflowY: 'auto',
    padding: '0.5rem',
    marginBottom: '1.5rem',
  },
  lunchOption: {
    border: '2px solid #e5e7eb',
    borderRadius: '12px',
    padding: '1rem',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    background: 'white',
  },
  lunchOptionSelected: {
    borderColor: '#3b82f6',
    background: '#f0f9ff',
    transform: 'scale(1.02)',
  },
  lunchImageContainer: {
    width: '100%',
    height: '100px',
    borderRadius: '8px',
    overflow: 'hidden',
    marginBottom: '0.5rem',
  },
  lunchImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  lunchInfo: {
    textAlign: 'center',
  },
  lunchName: {
    fontSize: '0.8rem',
    color: '#1e293b',
    display: 'block',
    marginBottom: '0.25rem',
    lineHeight: 1.3,
  },
  lunchPrice: {
    fontSize: '0.9rem',
    color: '#10b981',
    fontWeight: '600',
  },
  miniSpinner: {
    width: '16px',
    height: '16px',
    border: '2px solid transparent',
    borderTop: '2px solid white',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  noChildrenMessage: {
    textAlign: 'center',
    padding: '2rem',
    color: '#64748b',
  },
  contactMessage: {
    fontSize: '0.9rem',
    marginTop: '0.5rem',
    color: '#94a3b8',
  },
  noChildrenCard: {
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)',
    padding: '2rem',
    borderRadius: '16px',
    textAlign: 'center',
    boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
    border: '1px solid rgba(255,255,255,0.2)',
  },
};

// Estilos globales
const globalStyles = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

// Inyectar estilos globales
const styleSheet = document.createElement('style');
styleSheet.innerText = globalStyles;
document.head.appendChild(styleSheet);

export default DashboardParent;