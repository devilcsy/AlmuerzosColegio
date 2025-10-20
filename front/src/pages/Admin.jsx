import React, { useEffect, useState } from 'react';
import api from '../services/api';

const Admin = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [balanceAmount, setBalanceAmount] = useState('');

  useEffect(() => {
    loadAdminData();
  }, [activeTab]);

  const loadAdminData = async () => {
    setLoading(true);
    
    try {
      if (activeTab === 'dashboard') {
        const statsResult = await api.getAdminStats();
        if (statsResult.success) {
          setStats(statsResult.stats);
        }
      } else if (activeTab === 'users') {
        const usersResult = await api.getAllUsers();
        if (usersResult.success) {
          setUsers(usersResult.users);
        }
      } else if (activeTab === 'purchases') {
        const purchasesResult = await api.getAllPurchases();
        if (purchasesResult.success) {
          setPurchases(purchasesResult.purchases);
        }
      }
    } catch (error) {
      console.error('Error loading admin data:', error);
    }
    
    setLoading(false);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  const handleAddBalance = async (userId) => {
    if (!balanceAmount || balanceAmount <= 0) {
      alert('Por favor ingresa un monto válido');
      return;
    }

    const result = await api.addUserBalance(userId, parseFloat(balanceAmount));
    
    if (result.success) {
      alert(`Saldo agregado exitosamente al usuario`);
      setBalanceAmount('');
      loadAdminData(); // Recargar datos
    } else {
      alert(result.message || 'Error al agregar saldo');
    }
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

  const getRoleColor = (role) => {
    switch (role) {
      case 'ADMIN': return '#dc3545';
      case 'STAFF': return '#fd7e14';
      case 'STUDENT': return '#20c997';
      default: return '#6c757d';
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      <h1 style={{ color: '#333', marginBottom: '2rem' }}>Panel de Administración</h1>

      {/* Navegación por pestañas */}
      <div style={{ 
        display: 'flex', 
        gap: '1rem', 
        marginBottom: '2rem',
        borderBottom: '2px solid #e9ecef',
        paddingBottom: '1rem'
      }}>
        {['dashboard', 'users', 'purchases'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '0.75rem 1.5rem',
              background: activeTab === tab ? '#007bff' : 'transparent',
              color: activeTab === tab ? 'white' : '#007bff',
              border: `2px solid #007bff`,
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold',
              textTransform: 'capitalize'
            }}
          >
            {tab === 'dashboard' ? 'Dashboard' : 
             tab === 'users' ? 'Usuarios' : 'Compras'}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ color: '#6c757d', fontSize: '1.1rem' }}>Cargando...</p>
        </div>
      ) : (
        <>
          {/* Dashboard */}
          {activeTab === 'dashboard' && stats && (
            <div>
              <h2 style={{ color: '#495057', marginBottom: '1.5rem' }}>Estadísticas del Sistema</h2>
              
              {/* Tarjetas de estadísticas */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '1.5rem',
                marginBottom: '2rem'
              }}>
                <div style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  padding: '1.5rem',
                  borderRadius: '12px',
                  textAlign: 'center'
                }}>
                  <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '2rem' }}>
                    {stats.totalUsers}
                  </h3>
                  <p style={{ margin: 0, opacity: 0.9 }}>Total Usuarios</p>
                </div>

                <div style={{
                  background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                  color: 'white',
                  padding: '1.5rem',
                  borderRadius: '12px',
                  textAlign: 'center'
                }}>
                  <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '2rem' }}>
                    {stats.totalPurchases}
                  </h3>
                  <p style={{ margin: 0, opacity: 0.9 }}>Total Compras</p>
                </div>

                <div style={{
                  background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                  color: 'white',
                  padding: '1.5rem',
                  borderRadius: '12px',
                  textAlign: 'center'
                }}>
                  <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '2rem' }}>
                    ${stats.totalRevenue.toFixed(2)}
                  </h3>
                  <p style={{ margin: 0, opacity: 0.9 }}>Ingresos Totales</p>
                </div>

                <div style={{
                  background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                  color: 'white',
                  padding: '1.5rem',
                  borderRadius: '12px',
                  textAlign: 'center'
                }}>
                  <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '2rem' }}>
                    {stats.totalStudents}
                  </h3>
                  <p style={{ margin: 0, opacity: 0.9 }}>Estudiantes</p>
                </div>
              </div>

              {/* Distribución de usuarios */}
              <div style={{
                background: 'white',
                padding: '1.5rem',
                borderRadius: '12px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                marginBottom: '2rem'
              }}>
                <h3 style={{ color: '#495057', marginBottom: '1rem' }}>Distribución de Usuarios</h3>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: '12px', height: '12px', background: '#20c997', borderRadius: '50%' }}></div>
                    <span>Estudiantes: {stats.totalStudents}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: '12px', height: '12px', background: '#fd7e14', borderRadius: '50%' }}></div>
                    <span>Personal: {stats.totalStaff}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: '12px', height: '12px', background: '#dc3545', borderRadius: '50%' }}></div>
                    <span>Administradores: {stats.totalAdmins}</span>
                  </div>
                </div>
              </div>

              {/* Compras recientes */}
              <div style={{
                background: 'white',
                padding: '1.5rem',
                borderRadius: '12px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}>
                <h3 style={{ color: '#495057', marginBottom: '1rem' }}>Compras Recientes</h3>
                {stats.recentPurchases && stats.recentPurchases.length > 0 ? (
                  <div style={{ display: 'grid', gap: '0.75rem' }}>
                    {stats.recentPurchases.map(purchase => (
                      <div key={purchase._id} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '1rem',
                        background: '#f8f9fa',
                        borderRadius: '8px'
                      }}>
                        <div>
                          <span style={{ fontWeight: 'bold' }}>{purchase.user?.name}</span>
                          <span style={{ marginLeft: '1rem', color: '#6c757d' }}>
                            {formatDate(purchase.createdAt)}
                          </span>
                        </div>
                        <span style={{ fontWeight: 'bold', color: '#28a745' }}>
                          ${purchase.totalAmount}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: '#6c757d', textAlign: 'center' }}>No hay compras recientes</p>
                )}
              </div>
            </div>
          )}

          {/* Gestión de Usuarios */}
          {activeTab === 'users' && (
            <div>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '1.5rem'
              }}>
                <h2 style={{ color: '#495057', margin: 0 }}>Gestión de Usuarios</h2>
                <span style={{ color: '#6c757d' }}>
                  Total: {users.length} usuario{users.length !== 1 ? 's' : ''}
                </span>
              </div>

              {users.length === 0 ? (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '3rem',
                  background: '#f8f9fa',
                  borderRadius: '12px'
                }}>
                  <p style={{ color: '#6c757d' }}>No hay usuarios registrados</p>
                </div>
              ) : (
                <div style={{ 
                  background: 'white',
                  borderRadius: '12px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  overflow: 'hidden'
                }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: '#f8f9fa' }}>
                        <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>Usuario</th>
                        <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>Rol</th>
                        <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>Saldo</th>
                        <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>Registro</th>
                        <th style={{ padding: '1rem', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map(user => (
                        <tr key={user._id} style={{ borderBottom: '1px solid #e9ecef' }}>
                          <td style={{ padding: '1rem' }}>
                            <div>
                              <div style={{ fontWeight: 'bold' }}>{user.name}</div>
                              <div style={{ color: '#6c757d', fontSize: '0.9rem' }}>{user.email}</div>
                              {user.studentId && (
                                <div style={{ color: '#6c757d', fontSize: '0.8rem' }}>ID: {user.studentId}</div>
                              )}
                            </div>
                          </td>
                          <td style={{ padding: '1rem' }}>
                            <span style={{
                              background: getRoleColor(user.role),
                              color: 'white',
                              padding: '0.25rem 0.75rem',
                              borderRadius: '12px',
                              fontSize: '0.8rem',
                              fontWeight: 'bold',
                              textTransform: 'uppercase'
                            }}>
                              {user.role}
                            </span>
                          </td>
                          <td style={{ padding: '1rem', fontWeight: 'bold', color: '#28a745' }}>
                            ${user.balance || 0}
                          </td>
                          <td style={{ padding: '1rem', color: '#6c757d', fontSize: '0.9rem' }}>
                            {formatDate(user.createdAt)}
                          </td>
                          <td style={{ padding: '1rem', textAlign: 'center' }}>
                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                              <button
                                onClick={() => handleEditUser(user)}
                                style={{
                                  padding: '0.5rem 1rem',
                                  background: '#007bff',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                  fontSize: '0.8rem'
                                }}
                              >
                                Editar
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedUser(user);
                                  setBalanceAmount('');
                                }}
                                style={{
                                  padding: '0.5rem 1rem',
                                  background: '#28a745',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                  fontSize: '0.8rem'
                                }}
                              >
                                Recargar
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Todas las Compras */}
          {activeTab === 'purchases' && (
            <div>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '1.5rem'
              }}>
                <h2 style={{ color: '#495057', margin: 0 }}>Todas las Compras</h2>
                <span style={{ color: '#6c757d' }}>
                  Total: {purchases.length} compra{purchases.length !== 1 ? 's' : ''}
                </span>
              </div>

              {purchases.length === 0 ? (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '3rem',
                  background: '#f8f9fa',
                  borderRadius: '12px'
                }}>
                  <p style={{ color: '#6c757d' }}>No hay compras en el sistema</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gap: '1rem' }}>
                  {purchases.map(purchase => (
                    <div key={purchase._id} style={{
                      background: 'white',
                      padding: '1.5rem',
                      borderRadius: '12px',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}>
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'flex-start',
                        marginBottom: '1rem'
                      }}>
                        <div>
                          <h4 style={{ margin: '0 0 0.5rem 0', color: '#333' }}>
                            {purchase.user?.name} 
                            <span style={{ 
                              marginLeft: '0.5rem',
                              background: getRoleColor(purchase.user?.role),
                              color: 'white',
                              padding: '0.2rem 0.5rem',
                              borderRadius: '8px',
                              fontSize: '0.7rem'
                            }}>
                              {purchase.user?.role}
                            </span>
                          </h4>
                          <p style={{ margin: 0, color: '#6c757d' }}>
                            {purchase.user?.email}
                          </p>
                          <p style={{ margin: '0.5rem 0 0 0', color: '#6c757d', fontSize: '0.9rem' }}>
                            {formatDate(purchase.createdAt)}
                          </p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ 
                            background: '#28a745',
                            color: 'white',
                            padding: '0.5rem 1rem',
                            borderRadius: '8px',
                            fontSize: '1.2rem',
                            fontWeight: 'bold'
                          }}>
                            ${purchase.totalAmount}
                          </span>
                        </div>
                      </div>

                      <div style={{ 
                        background: '#f8f9fa', 
                        padding: '1rem',
                        borderRadius: '8px'
                      }}>
                        <h5 style={{ margin: '0 0 0.75rem 0', color: '#495057' }}>
                          Items comprados:
                        </h5>
                        {purchase.items && purchase.items.map((item, index) => (
                          <div key={index} style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '0.5rem',
                            background: 'white',
                            borderRadius: '4px',
                            marginBottom: '0.25rem'
                          }}>
                            <span>{item.name}</span>
                            <span style={{ fontWeight: 'bold' }}>
                              {item.quantity || 1} x ${item.price} = ${(item.quantity || 1) * item.price}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Modal para recargar saldo a usuario */}
      {selectedUser && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            padding: '2rem',
            borderRadius: '12px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
            width: '90%',
            maxWidth: '400px'
          }}>
            <h3 style={{ margin: '0 0 1.5rem 0', color: '#333' }}>
              Recargar Saldo a {selectedUser.name}
            </h3>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <p style={{ margin: '0 0 0.5rem 0', color: '#6c757d' }}>
                Saldo actual: <strong>${selectedUser.balance || 0}</strong>
              </p>
              <label style={{ 
                display: 'block', 
                marginBottom: '0.5rem',
                fontWeight: 'bold',
                color: '#495057'
              }}>
                Monto a agregar:
              </label>
              <input
                type="number"
                value={balanceAmount}
                onChange={(e) => setBalanceAmount(e.target.value)}
                placeholder="Ej: 20.00"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '2px solid #e9ecef',
                  borderRadius: '6px',
                  fontSize: '1rem'
                }}
                min="1"
                step="0.01"
              />
            </div>

            <div style={{ 
              display: 'flex', 
              gap: '1rem',
              justifyContent: 'flex-end'
            }}>
              <button 
                onClick={() => {
                  setSelectedUser(null);
                  setBalanceAmount('');
                }}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                Cancelar
              </button>
              <button 
                onClick={() => handleAddBalance(selectedUser._id)}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                Recargar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
