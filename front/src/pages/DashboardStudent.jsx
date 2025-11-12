import React, { useEffect, useState } from 'react';
import { getStoredUser } from '../utils/auth';
import api from '../services/api';

const DashboardStudent = () => {
  const [user, setUser] = useState(null);
  const [recentPurchases, setRecentPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBalanceModal, setShowBalanceModal] = useState(false);
  const [balanceAmount, setBalanceAmount] = useState('');
  const [balanceLoading, setBalanceLoading] = useState(false);

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
        window.location.href = '/lunches';
        break;
      case 'purchases':
        window.location.href = '/purchases';
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
      <h1 style={{ color: '#333', marginBottom: '2rem', fontSize: '2.5rem' }}></h1>
      
      {user && (
        <div className="user-welcome">
          <div style={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            padding: '2rem',
            borderRadius: '16px',
            marginBottom: '2rem'
          }}>
            <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '1.8rem' }}>
              ¡Bienvenido, {user.name}!
            </h2>
            <p style={{ margin: 0, opacity: 0.9 }}>
              Estudiante del sistema de almuerzos
            </p>
          </div>

          <div className="user-stats" style={{
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
              <h3 style={{ color: '#6c757d', marginBottom: '1rem' }}>Saldo Actual</h3>
              <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#28a745' }}>
                ${user.balance || 0}
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
                {user.studentId || 'No asignado'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Acciones Rápidas */}
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
          <button onClick={() => handleQuickAction('lunches')} style={quickButton('#007bff')}>
            🍽️ Ver Almuerzos
          </button>
          <button onClick={() => handleQuickAction('balance')} style={quickButton('#28a745')}>
            💰 Recargar Saldo
          </button>
          <button onClick={() => handleQuickAction('purchases')} style={quickButton('#6c757d')}>
            📊 Mi Historial
          </button>
        </div>
      </div>

      {/* Compras Recientes */}
      <div style={{ 
        background: 'white',
        padding: '2rem',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ color: '#495057', marginBottom: '1.5rem' }}>Compras Recientes</h2>
        {recentPurchases.length > 0 ? (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {recentPurchases.map(purchase => (
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
                    background: '#007bff',
                    color: 'white',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '12px',
                    fontSize: '0.8rem'
                  }}>
                    {purchase.type}
                  </span>
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

      {/* Modal de Recarga */}
      {showBalanceModal && (
        <div style={modalOverlay}>
          <div style={modalBox}>
            <h3>Recargar Saldo</h3>
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
    </div>
  );
};

// 🧩 Estilos reutilizables
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

export default DashboardStudent;
