
import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { getStoredUser } from '../utils/auth';

const Purchases = () => {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadPurchases();
    const userData = getStoredUser();
    setUser(userData);
  }, []);

  const loadPurchases = async () => {
    setLoading(true);
    const result = await api.getUserPurchases();
    if (result.success) {
      setPurchases(result.purchases || []);
    }
    setLoading(false);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED': return '#28a745';
      case 'PENDING': return '#ffc107';
      case 'CANCELLED': return '#dc3545';
      default: return '#6c757d';
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
      <h1 style={{ color: '#333', marginBottom: '2rem' }}>Mis Compras</h1>
      
      {user && (
        <div style={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          padding: '1.5rem',
          borderRadius: '12px',
          marginBottom: '2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Saldo Actual</h3>
            <p style={{ margin: '0.5rem 0 0 0', fontSize: '2rem', fontWeight: 'bold' }}>
              ${user.balance || 0}
            </p>
          </div>
          <button 
            onClick={() => window.location.href = '/dashboard'}
            style={{
              padding: '0.75rem 1.5rem',
              background: 'rgba(255,255,255,0.2)',
              color: 'white',
              border: '2px solid white',
              borderRadius: '25px',
              cursor: 'pointer',
              fontWeight: 'bold',
              backdropFilter: 'blur(10px)'
            }}
          >
            Recargar Saldo
          </button>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ color: '#6c757d', fontSize: '1.1rem' }}>Cargando historial de compras...</p>
        </div>
      ) : purchases.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '3rem',
          background: '#f8f9fa',
          borderRadius: '12px'
        }}>
          <h3 style={{ color: '#6c757d', marginBottom: '1rem' }}>No hay compras registradas</h3>
          <p style={{ color: '#6c757d', marginBottom: '2rem' }}>
            Aún no has realizado ninguna compra en el sistema.
          </p>
          <button 
            onClick={() => window.location.href = '/lunches'}
            style={{
              padding: '1rem 2rem',
              background: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '1rem'
            }}
          >
            Ver Almuerzos Disponibles
          </button>
        </div>
      ) : (
        <div>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '1.5rem'
          }}>
            <h2 style={{ color: '#495057', margin: 0 }}>Historial de Compras</h2>
            <span style={{ color: '#6c757d' }}>
              Total: {purchases.length} compra{purchases.length !== 1 ? 's' : ''}
            </span>
          </div>

          <div style={{ 
            display: 'grid', 
            gap: '1rem' 
          }}>
            {purchases.map((purchase) => (
              <div 
                key={purchase._id}
                style={{
                  background: 'white',
                  padding: '1.5rem',
                  borderRadius: '12px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  border: '1px solid #e9ecef',
                  transition: 'transform 0.2s'
                }}
              >
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'flex-start',
                  marginBottom: '1rem'
                }}>
                  <div>
                    <h3 style={{ 
                      margin: '0 0 0.5rem 0', 
                      color: '#333',
                      fontSize: '1.1rem'
                    }}>
                      Compra #{purchase._id.slice(-6).toUpperCase()}
                    </h3>
                    <p style={{ 
                      margin: 0, 
                      color: '#6c757d',
                      fontSize: '0.9rem'
                    }}>
                      {formatDate(purchase.createdAt)}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span 
                      style={{
                        background: getStatusColor(purchase.status),
                        color: 'white',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '15px',
                        fontSize: '0.8rem',
                        fontWeight: 'bold'
                      }}
                    >
                      {purchase.status === 'COMPLETED' ? 'COMPLETADA' : purchase.status}
                    </span>
                    <p style={{ 
                      margin: '0.5rem 0 0 0', 
                      color: '#28a745',
                      fontSize: '1.5rem',
                      fontWeight: 'bold'
                    }}>
                      ${purchase.totalAmount}
                    </p>
                  </div>
                </div>

                <div style={{ 
                  background: '#f8f9fa', 
                  padding: '1rem',
                  borderRadius: '8px',
                  marginTop: '1rem'
                }}>
                  <h4 style={{ 
                    margin: '0 0 0.75rem 0', 
                    color: '#495057',
                    fontSize: '1rem'
                  }}>
                    Items comprados:
                  </h4>
                  <div style={{ display: 'grid', gap: '0.5rem' }}>
                    {purchase.items && purchase.items.map((item, index) => (
                      <div 
                        key={index}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '0.5rem',
                          background: 'white',
                          borderRadius: '6px'
                        }}
                      >
                        <span style={{ fontWeight: '500' }}>{item.name}</span>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                          <span style={{ color: '#6c757d' }}>
                            {item.quantity || 1} x ${item.price}
                          </span>
                          <span style={{ fontWeight: 'bold', color: '#495057' }}>
                            ${(item.quantity || 1) * item.price}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: '1rem',
                  paddingTop: '1rem',
                  borderTop: '1px solid #e9ecef'
                }}>
                  <span style={{ 
                    color: '#6c757d', 
                    fontSize: '0.9rem',
                    textTransform: 'capitalize'
                  }}>
                    Tipo: {purchase.type?.toLowerCase() || 'almuerzo'}
                  </span>
                  <span style={{ 
                    fontWeight: 'bold', 
                    color: '#495057' 
                  }}>
                    Total: ${purchase.totalAmount}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Purchases;
