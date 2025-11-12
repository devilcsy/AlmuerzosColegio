import React, { useEffect, useState } from 'react';
import { getStoredUser, parentAPI } from '../utils/auth';
import api from '../services/api';

const DashboardParent = () => {
  const [user, setUser] = useState(null);
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [childPurchases, setChildPurchases] = useState([]);
  const [availableLunches, setAvailableLunches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBalanceModal, setShowBalanceModal] = useState(false);
  const [showLunchModal, setShowLunchModal] = useState(false);
  const [balanceAmount, setBalanceAmount] = useState('');
  const [selectedLunch, setSelectedLunch] = useState(null);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [purchaseLoading, setPurchaseLoading] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    const storedUser = getStoredUser();
    setUser(storedUser);

    try {
      // Cargar hijos del padre
      const childrenData = await parentAPI.getMyChildren();
      if (childrenData.success && childrenData.children) {
        setChildren(childrenData.children);
        if (childrenData.children.length > 0) {
          setSelectedChild(childrenData.children[0]);
        }
      }

      // Cargar almuerzos disponibles
      const lunchesData = await api.getAvailableLunches();
      setAvailableLunches(lunchesData.slice(0, 6) || []);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }

    setLoading(false);
  };

  const loadChildPurchases = async (childId) => {
    if (!childId) return;
    
    try {
      const purchasesData = await parentAPI.getChildPurchases(childId);
      if (purchasesData.success) {
        setChildPurchases(purchasesData.purchases?.slice(0, 5) || []);
      }
    } catch (error) {
      console.error('Error loading child purchases:', error);
    }
  };

  useEffect(() => {
    if (selectedChild) {
      loadChildPurchases(selectedChild._id);
    }
  }, [selectedChild]);

  const handleAddBalance = async () => {
    if (!selectedChild || !balanceAmount || balanceAmount <= 0) {
      alert('Por favor selecciona un hijo y ingresa un monto válido');
      return;
    }

    setBalanceLoading(true);
    const result = await parentAPI.rechargeChild(selectedChild._id, parseFloat(balanceAmount));
    
    if (result.success) {
      alert(`¡Saldo recargado exitosamente a ${selectedChild.name}! Nuevo saldo: $${result.balance}`);
      setShowBalanceModal(false);
      setBalanceAmount('');
      
      // Actualizar lista de hijos
      const childrenData = await parentAPI.getMyChildren();
      if (childrenData.success) {
        setChildren(childrenData.children || []);
        // Mantener el mismo hijo seleccionado
        const updatedChild = childrenData.children.find(c => c._id === selectedChild._id);
        if (updatedChild) setSelectedChild(updatedChild);
      }
    } else {
      alert(result.message || 'Error al recargar saldo');
    }
    
    setBalanceLoading(false);
  };

  const handlePurchaseLunch = async () => {
    if (!selectedChild || !selectedLunch) {
      alert('Por favor selecciona un hijo y un almuerzo');
      return;
    }

    setPurchaseLoading(true);
    const result = await api.makePurchase({
      userId: selectedChild._id,
      lunchId: selectedLunch.idMeal || selectedLunch._id,
      lunchName: selectedLunch.strMeal,
      amount: 5, // Precio fijo por ejemplo
      type: 'lunch_purchase',
      purchasedByParent: true
    });
    
    if (result.success) {
      alert(`¡Almuerzo comprado exitosamente para ${selectedChild.name}!`);
      setShowLunchModal(false);
      setSelectedLunch(null);
      
      // Recargar compras del hijo
      loadChildPurchases(selectedChild._id);
    } else {
      alert(result.message || 'Error al comprar almuerzo');
    }
    
    setPurchaseLoading(false);
  };

  const handleQuickAction = (action) => {
    switch (action) {
      case 'link_child':
        window.location.href = '/link-child';
        break;
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

  if (loading) {
    return (
      <div style={{ 
        padding: '2rem', 
        textAlign: 'center',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '50vh'
      }}>
        <div>
          <p style={{ fontSize: '1.2rem', color: '#6c757d' }}>Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard" style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      
      {user && (
        <div className="user-welcome">
          <div style={{ 
            background: 'linear-gradient(135deg, #ff7e5f 0%, #feb47b 100%)',
            color: 'white',
            padding: '2rem',
            borderRadius: '16px',
            marginBottom: '2rem'
          }}>
            <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '1.8rem' }}>
              ¡Bienvenido, {user.name}!
            </h2>
            <p style={{ margin: 0, opacity: 0.9 }}>
              Panel de control para padres - Gestiona las cuentas de tus hijos
            </p>
          </div>

          {/* Selector de Hijo */}
          {children.length > 0 && (
            <div style={{ 
              background: 'white',
              padding: '1.5rem',
              borderRadius: '12px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              marginBottom: '2rem'
            }}>
              <h3 style={{ color: '#495057', marginBottom: '1rem' }}>👦 Hijo Seleccionado</h3>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                {children.map(child => (
                  <button
                    key={child._id}
                    onClick={() => setSelectedChild(child)}
                    style={{
                      padding: '1rem 1.5rem',
                      background: selectedChild?._id === child._id ? '#28a745' : '#6c757d',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: 'bold'
                    }}
                  >
                    {child.name} (${child.balance || 0})
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Estadísticas del Hijo Seleccionado */}
          {selectedChild && (
            <div className="child-stats" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1.5rem',
              marginBottom: '2rem'
            }}>
              <div className="stat-card" style={{
                background: 'white',
                padding: '1.5rem',
                borderRadius: '12px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                textAlign: 'center'
              }}>
                <h3 style={{ color: '#6c757d', marginBottom: '1rem' }}>Saldo de {selectedChild.name}</h3>
                <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#28a745' }}>
                  ${selectedChild.balance || 0}
                </p>
              </div>

              <div className="stat-card" style={{
                background: 'white',
                padding: '1.5rem',
                borderRadius: '12px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                textAlign: 'center'
              }}>
                <h3 style={{ color: '#6c757d', marginBottom: '1rem' }}>ID Estudiante</h3>
                <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#495057' }}>
                  {selectedChild.studentId || 'No asignado'}
                </p>
              </div>

              <div className="stat-card" style={{
                background: 'white',
                padding: '1.5rem',
                borderRadius: '12px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                textAlign: 'center'
              }}>
                <h3 style={{ color: '#6c757d', marginBottom: '1rem' }}>Estado</h3>
                <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: selectedChild.isActive ? '#28a745' : '#dc3545' }}>
                  {selectedChild.isActive ? 'Activo' : 'Inactivo'}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Acciones Rápidas para Padres */}
      <div style={{ 
        background: 'white',
        padding: '2rem',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        marginBottom: '2rem'
      }}>
        <h2 style={{ color: '#495057', marginBottom: '1.5rem' }}>Acciones Rápidas</h2>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem'
        }}>
          <button 
            onClick={() => handleQuickAction('link_child')} 
            style={quickButton('#007bff')}
            disabled={!children.length}
          >
            👥 Vincular Hijo
          </button>
          <button 
            onClick={() => handleQuickAction('balance')} 
            style={quickButton('#28a745')}
            disabled={!selectedChild}
          >
            💰 Recargar Saldo
          </button>
          <button 
            onClick={() => handleQuickAction('buy_lunch')} 
            style={quickButton('#ff6b6b')}
            disabled={!selectedChild}
          >
            🍽️ Comprar Almuerzo
          </button>
        </div>
      </div>

      {/* Compras Recientes del Hijo */}
      {selectedChild && (
        <div style={{ 
          background: 'white',
          padding: '2rem',
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          marginBottom: '2rem'
        }}>
          <h2 style={{ color: '#495057', marginBottom: '1.5rem' }}>
            Compras Recientes de {selectedChild.name}
          </h2>
          {childPurchases.length > 0 ? (
            <div style={{ display: 'grid', gap: '1rem' }}>
              {childPurchases.map(purchase => (
                <div key={purchase._id} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '1rem',
                  background: '#f8f9fa',
                  borderRadius: '8px',
                  border: '1px solid #e9ecef'
                }}>
                  <div>
                    <strong>{new Date(purchase.createdAt).toLocaleDateString()}</strong>
                    <span style={{
                      marginLeft: '1rem',
                      background: purchase.purchasedByParent ? '#28a745' : '#007bff',
                      color: 'white',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '12px',
                      fontSize: '0.8rem'
                    }}>
                      {purchase.purchasedByParent ? 'Comprado por Padre' : 'Auto-compra'}
                    </span>
                    <div style={{ color: '#6c757d', fontSize: '0.9rem' }}>
                      {purchase.lunchName || purchase.type}
                    </div>
                  </div>
                  <span style={{ color: '#28a745', fontWeight: 'bold' }}>
                    ${purchase.totalAmount}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: '#6c757d', textAlign: 'center' }}>No hay compras recientes</p>
          )}
        </div>
      )}

      {/* Modal de Recarga de Saldo */}
      {showBalanceModal && (
        <div style={modalOverlay}>
          <div style={modalBox}>
            <h3>💰 Recargar Saldo a {selectedChild?.name}</h3>
            <input
              type="number"
              value={balanceAmount}
              onChange={(e) => setBalanceAmount(e.target.value)}
              placeholder="Monto a recargar"
              style={inputStyle}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
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

      {/* Modal de Compra de Almuerzo */}
      {showLunchModal && (
        <div style={modalOverlay}>
          <div style={{...modalBox, maxWidth: '500px'}}>
            <h3>🍽️ Comprar Almuerzo para {selectedChild?.name}</h3>
            <p style={{ color: '#6c757d', marginBottom: '1rem' }}>
              Saldo disponible: <strong>${selectedChild?.balance || 0}</strong>
            </p>
            
            <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '1rem' }}>
              {availableLunches.map(lunch => (
                <div
                  key={lunch.idMeal}
                  onClick={() => setSelectedLunch(lunch)}
                  style={{
                    padding: '1rem',
                    background: selectedLunch?.idMeal === lunch.idMeal ? '#e3f2fd' : '#f8f9fa',
                    border: selectedLunch?.idMeal === lunch.idMeal ? '2px solid #2196f3' : '1px solid #e9ecef',
                    borderRadius: '8px',
                    marginBottom: '0.5rem',
                    cursor: 'pointer'
                  }}
                >
                  <strong>{lunch.strMeal}</strong>
                  <div style={{ color: '#6c757d', fontSize: '0.9rem' }}>
                    ${5} {/* Precio fijo */}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
              <button onClick={() => setShowLunchModal(false)} style={cancelButton}>
                Cancelar
              </button>
              <button onClick={handlePurchaseLunch} style={confirmButton} disabled={purchaseLoading || !selectedLunch}>
                {purchaseLoading ? 'Procesando...' : 'Comprar Almuerzo'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// 🧩 Estilos reutilizables (los mismos que DashboardStudent)
const quickButton = (color) => ({
  padding: '1.5rem',
  background: color,
  color: 'white',
  border: 'none',
  borderRadius: '12px',
  cursor: 'pointer',
  fontWeight: 'bold',
  fontSize: '1.1rem',
  transition: 'transform 0.2s',
});

const modalOverlay = {
  position: 'fixed',
  top: 0, left: 0, right: 0, bottom: 0,
  background: 'rgba(0,0,0,0.5)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 1000
};

const modalBox = {
  background: 'white',
  padding: '2rem',
  borderRadius: '12px',
  boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
  width: '90%',
  maxWidth: '400px'
};

const inputStyle = {
  width: '100%',
  padding: '0.75rem',
  border: '2px solid #e9ecef',
  borderRadius: '6px',
  fontSize: '1rem'
};

const cancelButton = {
  background: '#6c757d',
  color: 'white',
  padding: '0.75rem 1.5rem',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer'
};

const confirmButton = {
  background: '#28a745',
  color: 'white',
  padding: '0.75rem 1.5rem',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer'
};

export default DashboardParent;