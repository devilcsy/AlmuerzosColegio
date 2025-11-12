import React, { useEffect, useState } from 'react';
import { userAPI, purchasesAPI, getStoredUser } from '../utils/auth';

const DashboardAdmin = () => {
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = getStoredUser();
    setUser(storedUser);
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    const [usersRes, purchasesRes] = await Promise.all([
      userAPI.getAllUsers(),
      purchasesAPI.getAllPurchases()
    ]);

    if (usersRes.success) setUsers(usersRes.users || []);
    if (purchasesRes.success) setPurchases(purchasesRes.purchases || []);
    setLoading(false);
  };

  const totalSales = purchases.reduce((sum, p) => sum + (p.totalAmount || 0), 0);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <p>Cargando datos del administrador...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ color: '#333', marginBottom: '1.5rem' }}>🧑‍💼 Panel del Administrador</h1>
      <p style={{ marginBottom: '2rem' }}>Bienvenido, <b>{user?.name}</b></p>

      {/* Estadísticas */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <div style={statCardStyle}>
          <h3 style={statTitleStyle}>Usuarios registrados</h3>
          <p style={statValueStyle}>{users.length}</p>
        </div>

        <div style={statCardStyle}>
          <h3 style={statTitleStyle}>Compras totales</h3>
          <p style={statValueStyle}>{purchases.length}</p>
        </div>

        <div style={statCardStyle}>
          <h3 style={statTitleStyle}>Ventas totales</h3>
          <p style={{ ...statValueStyle, color: '#28a745' }}>
            ${totalSales.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Tabla de Usuarios */}
      <div style={sectionCardStyle}>
        <h2 style={sectionTitleStyle}>👥 Lista de Usuarios</h2>
        <div style={{ overflowX: 'auto' }}>
          <table style={tableStyle}>
            <thead>
              <tr style={tableHeaderStyle}>
                <th>Nombre</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Saldo</th>
                <th>Activo</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u._id} style={tableRowStyle}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td style={{ textTransform: 'capitalize' }}>{u.role}</td>
                  <td>${u.balance?.toFixed(2) || 0}</td>
                  <td>{u.isActive ? '✅' : '❌'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Compras Recientes */}
      <div style={sectionCardStyle}>
        <h2 style={sectionTitleStyle}>🧾 Compras Recientes</h2>
        {purchases.length === 0 ? (
          <p>No hay compras registradas</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={tableStyle}>
              <thead>
                <tr style={tableHeaderStyle}>
                  <th>Fecha</th>
                  <th>Usuario</th>
                  <th>Tipo</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {purchases.slice(0, 10).map(p => (
                  <tr key={p._id} style={tableRowStyle}>
                    <td>{new Date(p.date).toLocaleString()}</td>
                    <td>{p.user?.name || 'N/A'}</td>
                    <td>{p.type}</td>
                    <td>${p.totalAmount.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

// 🎨 Estilos en JS para mantener coherencia visual
const statCardStyle = {
  background: 'white',
  padding: '1.5rem',
  borderRadius: '12px',
  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
  textAlign: 'center'
};

const statTitleStyle = {
  margin: '0 0 0.5rem 0',
  color: '#6c757d',
  fontSize: '1rem',
  fontWeight: 'normal'
};

const statValueStyle = {
  fontSize: '2rem',
  fontWeight: 'bold',
  color: '#007bff',
  margin: 0
};

const sectionCardStyle = {
  background: 'white',
  padding: '1.5rem',
  borderRadius: '12px',
  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
  marginBottom: '2rem'
};

const sectionTitleStyle = {
  marginBottom: '1rem',
  color: '#495057',
  fontSize: '1.25rem'
};

const tableStyle = {
  width: '100%',
  borderCollapse: 'collapse'
};

const tableHeaderStyle = {
  background: '#007bff',
  color: 'white',
  textAlign: 'left'
};

const tableRowStyle = {
  borderBottom: '1px solid #dee2e6'
};

export default DashboardAdmin;
