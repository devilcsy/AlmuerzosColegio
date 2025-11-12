// DashboardParent.jsx
import React, { useEffect, useState } from 'react';
import { getStoredUser, parentAPI } from '../utils/auth';
import api from '../services/api';

const DashboardParent = () => {
  const [user, setUser] = useState(null);
  const [children, setChildren] = useState([]);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [purchases, setPurchases] = useState([]);
  const [availableLunches, setAvailableLunches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBalanceModal, setShowBalanceModal] = useState(false);
  const [showLunchModal, setShowLunchModal] = useState(false);
  const [balanceAmount, setBalanceAmount] = useState('');
  const [selectedLunch, setSelectedLunch] = useState(null);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [purchaseLoading, setPurchaseLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);


  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    const storedUser = getStoredUser();
    setUser(storedUser);

    try {
      // Obtener hijos
      const childrenData = await parentAPI.getMyChildren();
      if (childrenData.success && childrenData.children) {
        setChildren(childrenData.children);
      }

      // Obtener almuerzos disponibles
      const lunchesData = await api.getAvailableLunches();
      setAvailableLunches(lunchesData.slice(0, 6) || []);

      // Por defecto: mostrar al padre
      setSelectedProfile({ ...storedUser, isParent: true });
      await loadPurchases(storedUser._id, true);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }

    setLoading(false);
  };

  const loadPurchases = async (userId, isParent = false) => {
    try {
      const data = !isParent
        ? await parentAPI.getChildPurchases(userId)
        : await api.getUserPurchases(userId);

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
    if (selectedProfile) {
      loadPurchases(selectedProfile._id, selectedProfile.isParent);
    }
  }, [selectedProfile]);

  // === 🔧 Recargar saldo ===
 const handleAddBalance = async () => {
  if (!selectedProfile || balanceAmount <= 0) {
    alert('Por favor ingresa un monto válido');
    return;
  }

  setBalanceLoading(true);

  try {
    let result;

    // Si el padre está recargando su propio saldo
    if (selectedProfile.isParent) {
      result = await api.addBalance(parseFloat(balanceAmount)); 
    } 
    // Si el padre está recargando el saldo de un hijo
    else {
      result = await parentAPI.rechargeChild(
        selectedProfile._id, 
        parseFloat(balanceAmount)
      );
    }

    if (result.success) {
      alert(`¡Saldo recargado exitosamente! Nuevo saldo: $${result.balance}`);
      setShowBalanceModal(false);
      setBalanceAmount('');

      // Actualizar datos locales
      const userData = getStoredUser();
      if (userData) {
        if (selectedProfile.isParent) {
          // Si es el padre, actualiza su propio saldo
          userData.balance = result.balance;
          localStorage.setItem('userData', JSON.stringify(userData));
          setUser(userData);
        } else {
          // Si es un hijo, actualiza la lista de hijos en el dashboard
          await loadDashboardData();
        }
      }
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
    if (!selectedProfile || !selectedLunch) {
      alert('Selecciona un perfil y un almuerzo');
      return;
    }

    setPurchaseLoading(true);
    const result = await api.makePurchase({
      userId: selectedProfile._id,
      lunchId: selectedLunch.idMeal || selectedLunch._id,
      lunchName: selectedLunch.strMeal,
      amount: 5,
      type: 'lunch_purchase',
      purchasedByParent: !selectedProfile.isParent,
    });

    if (result.success) {
      alert('¡Compra realizada exitosamente!');
      setShowLunchModal(false);
      setSelectedLunch(null);
      await loadPurchases(selectedProfile._id, selectedProfile.isParent);
    } else {
      alert(result.message || 'Error al comprar almuerzo');
    }

    setPurchaseLoading(false);
  };

  const handleQuickAction = (action) => {
    switch (action) {
      case 'balance':
        setShowBalanceModal(true);
        break;
      case 'buy_lunch':
        setShowLunchModal(true);
        break;
      default:
        break;
    }
  };
const handleSearchChild = async () => {
  if (!searchTerm.trim()) {
    alert('Por favor ingresa un nombre o ID para buscar.');
    return;
  }

  setSearchLoading(true);
  setSearchResult(null);

  try {
    const result = await api.searchChild(searchTerm);

    if (result.success && result.child) {
      setSearchResult(result.child);
      setSelectedProfile(result.child);
      alert(` Hijo encontrado: ${result.child.name}`);
    } else {
      alert(' No se encontró ningún hijo con ese nombre o ID.');
    }
  } catch (error) {
    console.error('Error al buscar hijo:', error);
    alert('⚠️ Error al buscar hijo.');
  }

  setSearchLoading(false);
};


  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <p>Cargando dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard" style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      {user && (
        <div style={headerCard}>
          <h2>Bienvenido, {user.name}</h2>
          <p style={{ opacity: 0.8 }}>Panel de control - Padre y gestión familiar</p>
        </div>
      )}

      {/* Selector de perfil */}
      <div style={profileSelectorBox}>
        <h3>Seleccionar Perfil</h3>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setSelectedProfile({ ...user, isParent: true })}
            style={profileButton(selectedProfile?.isParent ? '#007bff' : '#6c757d')}
          >
            Mi Cuenta (${user.balance || 0})
          </button>
          {children.map((child) => (
            <button
              key={child._id}
              onClick={() => setSelectedProfile(child)}
              style={profileButton(selectedProfile?._id === child._id ? '#28a745' : '#6c757d')}
            >
              {child.name} (${child.balance || 0})
            </button>
          ))}
        </div>
      </div>

      {/* Estadísticas */}
      {selectedProfile && (
        <div style={statsGrid}>
          <div style={statCard}>
            <h3>Saldo actual</h3>
            <p style={bigMoney}>${selectedProfile.balance || 0}</p>
          </div>
          <div style={statCard}>
  <div style={{ marginTop: '2rem', textAlign: 'center' }}>
  <h3>🔗 Vincular hijo</h3>
  <input
    type="text"
    placeholder="Nombre o ID del hijo"
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    style={{ padding: '0.5rem', width: '200px', marginRight: '10px' }}
  />
  <button
    onClick={async () => {
      if (!searchTerm.trim()) {
        alert('Por favor ingresa el nombre o ID del hijo');
        return;
      }

      const res = await api.linkChild(searchTerm.trim());
      if (res.success) {
        alert(`✅ ${res.message}`);
        setChildren((prev) => [...prev, res.child]); // actualiza la lista
      } else {
        alert(`❌ ${res.message || 'Error al vincular hijo'}`);
      }

      setSearchTerm('');
    }}
  >
    Vincular
  </button>
</div>

  <button
    style={{
      backgroundColor: '#007bff',
      color: 'white',
      padding: '0.5rem 1rem',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      fontWeight: 'bold',
    }}
    onClick={handleSearchChild}
  >
    Buscar
  </button>
</div>

          <div style={statCard}>
            <h3>Estado</h3>
            <p style={{ color: '#28a745', fontWeight: 'bold' }}>Activo</p>
          </div>
        </div>
      )}

      {/* Acciones rápidas */}
      <div style={actionsBox}>
        <h2>Acciones Rápidas</h2>
        <div style={quickGrid}>
          <button onClick={() => handleQuickAction('balance')} style={quickButton('#ffc107')}>
            Recargar Saldo
          </button>
          <button onClick={() => handleQuickAction('buy_lunch')} style={quickButton('#ff6b6b')}>
            Comprar Almuerzo
          </button>
        </div>
      </div>

      {/* Historial */}
      <div style={historyBox}>
        <h2>Historial de Compras de {selectedProfile?.name}</h2>
        {purchases.length > 0 ? (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {purchases.map((p) => (
              <div key={p._id} style={purchaseItem}>
                <div>
                  <strong>{new Date(p.createdAt).toLocaleDateString()}</strong> —{' '}
                  {p.lunchName || p.type}
                </div>
                <span style={{ color: '#28a745', fontWeight: 'bold' }}>${p.totalAmount}</span>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: '#6c757d' }}>No hay compras recientes</p>
        )}
      </div>

      {/* Modal de Recarga */}
      {showBalanceModal && (
        <div style={modalOverlay}>
          <div style={modalBox}>
            <h3>Recargar Saldo para {selectedProfile?.name}</h3>
            <input
              type="number"
              value={balanceAmount}
              onChange={(e) => setBalanceAmount(e.target.value)}
              placeholder="Monto a recargar"
              style={inputStyle}
            />
            <div style={modalActions}>
              <button onClick={() => setShowBalanceModal(false)} style={cancelButton}>
                Cancelar
              </button>
              <button onClick={handleAddBalance} style={confirmButton} disabled={balanceLoading}>
                {balanceLoading ? 'Procesando...' : 'Recargar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Compra */}
      {showLunchModal && (
        <div style={modalOverlay}>
          <div style={{ ...modalBox, maxWidth: '500px' }}>
            <h3>Comprar Almuerzo para {selectedProfile?.name}</h3>
            <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '1rem' }}>
              {availableLunches.map((lunch) => (
                <div
                  key={lunch.idMeal}
                  onClick={() => setSelectedLunch(lunch)}
                  style={{
                    padding: '1rem',
                    background:
                      selectedLunch?.idMeal === lunch.idMeal ? '#e3f2fd' : '#f8f9fa',
                    border:
                      selectedLunch?.idMeal === lunch.idMeal
                        ? '2px solid #2196f3'
                        : '1px solid #e9ecef',
                    borderRadius: '8px',
                    marginBottom: '0.5rem',
                    cursor: 'pointer',
                  }}
                >
                  <strong>{lunch.strMeal}</strong>
                  <div style={{ color: '#6c757d', fontSize: '0.9rem' }}>${5}</div>
                </div>
              ))}
            </div>
            <div style={modalActions}>
              <button onClick={() => setShowLunchModal(false)} style={cancelButton}>
                Cancelar
              </button>
              <button
                onClick={handlePurchaseLunch}
                style={confirmButton}
                disabled={purchaseLoading || !selectedLunch}
              >
                {purchaseLoading ? 'Procesando...' : 'Comprar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// === Estilos ===
const headerCard = {
  background: 'linear-gradient(135deg, #ff7e5f 0%, #feb47b 100%)',
  color: 'white',
  padding: '2rem',
  borderRadius: '16px',
  marginBottom: '2rem',
};

const profileSelectorBox = {
  background: 'white',
  padding: '1.5rem',
  borderRadius: '12px',
  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
  marginBottom: '2rem',
};

const profileButton = (color) => ({
  padding: '1rem 1.5rem',
  background: color,
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
  fontWeight: 'bold',
});

const statsGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
  gap: '1.5rem',
  marginBottom: '2rem',
};

const statCard = {
  background: 'white',
  padding: '1.5rem',
  borderRadius: '12px',
  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
  textAlign: 'center',
};

const bigMoney = { fontSize: '2.5rem', color: '#28a745', fontWeight: 'bold' };

const actionsBox = {
  background: 'white',
  padding: '2rem',
  borderRadius: '12px',
  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
  marginBottom: '2rem',
};

const quickGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
  gap: '1rem',
};

const quickButton = (color) => ({
  padding: '1.5rem',
  background: color,
  color: 'white',
  border: 'none',
  borderRadius: '12px',
  cursor: 'pointer',
  fontWeight: 'bold',
  fontSize: '1.1rem',
});

const historyBox = {
  background: 'white',
  padding: '2rem',
  borderRadius: '12px',
  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
  marginBottom: '2rem',
};

const purchaseItem = {
  display: 'flex',
  justifyContent: 'space-between',
  padding: '1rem',
  background: '#f8f9fa',
  borderRadius: '8px',
  border: '1px solid #e9ecef',
};

const modalOverlay = {
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
};

const modalBox = {
  background: 'white',
  padding: '2rem',
  borderRadius: '12px',
  width: '90%',
  maxWidth: '400px',
  boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
};

const inputStyle = {
  width: '100%',
  padding: '0.75rem',
  border: '2px solid #e9ecef',
  borderRadius: '6px',
  fontSize: '1rem',
};

const modalActions = {
  display: 'flex',
  justifyContent: 'space-between',
  marginTop: '1rem',
};

const cancelButton = {
  background: '#6c757d',
  color: 'white',
  padding: '0.75rem 1.5rem',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
};

const confirmButton = {
  background: '#28a745',
  color: 'white',
  padding: '0.75rem 1.5rem',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
};

export default DashboardParent;
