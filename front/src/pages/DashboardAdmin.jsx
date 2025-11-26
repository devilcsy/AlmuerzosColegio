//DashboardAdmin.jsx
import React, { useEffect, useState } from 'react';
import { getStoredUser } from '../utils/auth';
import api from '../services/api';

const DashboardAdmin = () => {
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false); 
  const [showUserModal, setShowUserModal] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkParentId, setLinkParentId] = useState('');
  const [linkChildId, setLinkChildId] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false); 
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    role: '',
    studentId: '',
    department: '',
    balance: 0
  });

  useEffect(() => {
    const storedUser = getStoredUser();
    setUser(storedUser);
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    const [usersRes, purchasesRes] = await Promise.all([
    api.getAllUsers(),
    api.getAllPurchases()
  ]);

  if (usersRes.success) setUsers(usersRes.users || []);
  if (purchasesRes.success) setPurchases(purchasesRes.purchases || []);
  setLoading(false);
};
  const totalSales = purchases.reduce((sum, p) => sum + (p.totalAmount || 0), 0);

  // Función para recargar saldo
  const handleAddBalance = async (userId, amount) => {
    setActionLoading(true);
    try {
      const result = await api.addUserBalance(userId, amount);
      if (result.success) {
        alert(`Saldo recargado exitosamente! Nuevo saldo: $${result.newBalance}`);
        await loadAdminData();
      } else {
        alert(result.message || 'Error al recargar saldo');
      }
    } catch (error) {
      alert('Error al recargar saldo');
    }
    setActionLoading(false);
  };

  // Función para vincular padre-hijo
  const handleLinkParentChild = async () => {
    if (!linkParentId || !linkChildId) {
      alert('Debes seleccionar tanto el padre como el hijo');
      return;
    }

    setActionLoading(true);
    try {
      const result = await api.linkParentChild(linkParentId, linkChildId);
      if (result.success) {
        alert('Hijo vinculado exitosamente al padre');
        setShowLinkModal(false);
        setLinkParentId('');
        setLinkChildId('');
        await loadAdminData();
      } else {
        alert(result.message || 'Error al vincular');
      }
    } catch (error) {
      alert('Error al vincular padre-hijo');
    }
    setActionLoading(false);
  };

  // Función para eliminar usuario
  const handleDeleteUser = async (userId, userName) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar al usuario ${userName}? Esta acción no se puede deshacer.`)) {
      return;
    }

    setActionLoading(true);
    try {
      const result = await api.deleteUser(userId);
      if (result.success) {
        alert('Usuario eliminado exitosamente');
        await loadAdminData();
      } else {
        alert(result.message || 'Error al eliminar usuario');
      }
    } catch (error) {
      alert('Error al eliminar usuario');
    }
    setActionLoading(false);
  };

  // Función para ver perfil de usuario
  const handleViewProfile = (user) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

 const handleEditUser = (user) => {
    setSelectedUser(user);
    setEditFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      studentId: user.studentId || '',
      department: user.department || '',
      balance: user.balance || 0
    });
    setIsEditing(true); // Activar modo edición
    setShowUserModal(true); // Abrir el mismo modal
  };


  const handleSaveEdit = async () => {
    if (!selectedUser) return;
    
    setActionLoading(true);
    try {
      const result = await api.updateUser(selectedUser._id, editFormData);
      if (result.success) {
        alert('Usuario actualizado exitosamente');
        setIsEditing(false);
        setShowUserModal(false);
        await loadAdminData();
      } else {
        alert(result.message || 'Error al actualizar usuario');
      }
    } catch (error) {
      alert('Error al actualizar usuario');
    }
    setActionLoading(false);
  };

const handleCancelEdit = () => {
    setIsEditing(false);
    setEditFormData({
      name: '',
      email: '',
      role: '',
      studentId: '',
      department: '',
      balance: 0
    });
  };
 
  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p style={styles.loadingText}>Cargando panel de administración...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>Panel de Administración</h1>
        <p style={styles.subtitle}>Bienvenido, <strong>{user?.name}</strong></p>
      </div>

      {/* Estadísticas */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>👥</div>
          <div style={styles.statContent}>
            <h3 style={styles.statLabel}>Usuarios Registrados</h3>
            <p style={styles.statValue}>{users.length}</p>
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statIcon}>🧾</div>
          <div style={styles.statContent}>
            <h3 style={styles.statLabel}>Compras Totales</h3>
            <p style={styles.statValue}>{purchases.length}</p>
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statIcon}>💰</div>
          <div style={styles.statContent}>
            <h3 style={styles.statLabel}>Ventas Totales</h3>
            <p style={{...styles.statValue, color: '#10b981'}}>${totalSales.toFixed(2)}</p>
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statIcon}>🔗</div>
          <div style={styles.statContent}>
            <h3 style={styles.statLabel}>Gestión de Vínculos</h3>
            <button 
              onClick={() => setShowLinkModal(true)}
              style={styles.linkButton}
            >
              Vincular Padre-Hijo
            </button>
          </div>
        </div>
      </div>

      {/* Tabla de Usuarios */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>Gestión de Usuarios</h2>
          <p style={styles.sectionDescription}>
            Administra usuarios, saldos y permisos del sistema
          </p>
        </div>

        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeader}>
                <th>Nombre</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Saldo</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user._id} style={styles.tableRow}>
                  <td style={styles.tableCell}>
                    <strong>{user.name}</strong>
                  </td>
                  <td style={styles.tableCell}>{user.email}</td>
                  <td style={styles.tableCell}>
                    <span style={getRoleStyle(user.role)}>
                      {user.role}
                    </span>
                  </td>
                  <td style={styles.tableCell}>
                    <strong>${user.balance?.toFixed(2) || 0}</strong>
                  </td>
                  <td style={styles.tableCell}>
                    {user.isActive ? (
                      <span style={styles.statusActive}>Activo</span>
                    ) : (
                      <span style={styles.statusInactive}>Inactivo</span>
                    )}
                  </td>
                  <td style={styles.tableCell}>
  <div style={styles.actions}>
    <button 
      onClick={() => handleViewProfile(user)}
      style={styles.actionButton}
      title="Ver perfil"
    >
      👁️
    </button>
    
   
    
    
    <button 
      onClick={() => {
        const amount = prompt(`Recargar saldo para ${user.name}:`);
        if (amount && !isNaN(amount)) {
          handleAddBalance(user._id, parseFloat(amount));
        }
      }}
      style={styles.actionButton}
      title="Recargar saldo"
    >
      💰
    </button>
    
   
   
    
    <button 
      onClick={() => handleDeleteUser(user._id, user.name)}
      style={{...styles.actionButton, ...styles.deleteButton}}
      title="Eliminar usuario"
      disabled={actionLoading}
    >
      🗑️
    </button>
  </div>
</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Compras Recientes */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>Compras Recientes</h2>
          <p style={styles.sectionDescription}>
            Historial de transacciones del sistema
          </p>
        </div>

        {purchases.length === 0 ? (
          <div style={styles.emptyState}>
            <p>No hay compras registradas</p>
          </div>
        ) : (
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHeader}>
                  <th>Fecha</th>
                  <th>Usuario</th>
                  <th>Producto</th>
                  <th>Tipo</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {purchases.slice(0, 10).map(purchase => (
                  <tr key={purchase._id} style={styles.tableRow}>
                    <td style={styles.tableCell}>
                      {new Date(purchase.createdAt).toLocaleDateString()}
                    </td>
                    <td style={styles.tableCell}>
                      {purchase.user?.name || 'N/A'}
                    </td>
                    <td style={styles.tableCell}>
                      {purchase.lunchName || purchase.items?.[0]?.name || 'Compra'}
                    </td>
                    <td style={styles.tableCell}>
                      <span style={getTypeStyle(purchase.type)}>
                        {purchase.type}
                      </span>
                    </td>
                    <td style={styles.tableCell}>
                      <strong>${purchase.totalAmount?.toFixed(2)}</strong>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
{/* ✅ MODAL UNIFICADO - Reemplaza ambos modales con este */}
{showUserModal && selectedUser && (
  <div style={styles.modalOverlay}>
    <div style={styles.modal}>
      <h3 style={styles.modalTitle}>
        {isEditing ? `Editando: ${selectedUser.name}` : 'Perfil de Usuario'}
      </h3>
      
      <div style={styles.userProfile}>
        {/* Campo Nombre */}
        <div style={styles.profileField}>
          <label>Nombre:</label>
          {isEditing ? (
            <input
              type="text"
              value={editFormData.name}
              onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
              style={styles.editInput}
            />
          ) : (
            <span>{selectedUser.name}</span>
          )}
        </div>

        {/* Campo Email */}
        <div style={styles.profileField}>
          <label>Email:</label>
          {isEditing ? (
            <input
              type="email"
              value={editFormData.email}
              onChange={(e) => setEditFormData({...editFormData, email: e.target.value})}
              style={styles.editInput}
            />
          ) : (
            <span>{selectedUser.email}</span>
          )}
        </div>

        {/* Campo Rol */}
        <div style={styles.profileField}>
          <label>Rol:</label>
          {isEditing ? (
            <select
              value={editFormData.role}
              onChange={(e) => setEditFormData({...editFormData, role: e.target.value})}
              style={styles.editSelect}
            >
              <option value="STUDENT">Estudiante</option>
              <option value="PARENT">Padre/Madre</option>
              <option value="ADMIN">Administrador</option>
            </select>
          ) : (
            <span style={getRoleStyle(selectedUser.role)}>
              {selectedUser.role}
            </span>
          )}
        </div>

        {/* Campo Saldo */}
        <div style={styles.profileField}>
          <label>Saldo:</label>
          {isEditing ? (
            <input
              type="number"
              value={editFormData.balance}
              onChange={(e) => setEditFormData({...editFormData, balance: parseFloat(e.target.value)})}
              style={styles.editInput}
              step="0.01"
            />
          ) : (
            <span>${selectedUser.balance?.toFixed(2) || 0}</span>
          )}
        </div>

        {/* Campos específicos para estudiantes */}
        {((isEditing && editFormData.role === 'STUDENT') || 
          (!isEditing && selectedUser.role === 'STUDENT')) && (
          <>
            <div style={styles.profileField}>
              <label>ID Estudiante:</label>
              {isEditing ? (
                <input
                  type="text"
                  value={editFormData.studentId}
                  onChange={(e) => setEditFormData({...editFormData, studentId: e.target.value})}
                  style={styles.editInput}
                />
              ) : (
                <span>{selectedUser.studentId || 'N/A'}</span>
              )}
            </div>

            <div style={styles.profileField}>
              <label>Departamento/Grado:</label>
              {isEditing ? (
                <input
                  type="text"
                  value={editFormData.department}
                  onChange={(e) => setEditFormData({...editFormData, department: e.target.value})}
                  style={styles.editInput}
                />
              ) : (
                <span>{selectedUser.department || 'N/A'}</span>
              )}
            </div>
          </>
        )}

        {/* Estado (solo lectura) */}
        <div style={styles.profileField}>
          <label>Estado:</label>
          <span style={selectedUser.isActive ? styles.statusActive : styles.statusInactive}>
            {selectedUser.isActive ? 'Activo' : 'Inactivo'}
          </span>
        </div>

        {/* Hijos vinculados (solo lectura) */}
        {selectedUser.children && selectedUser.children.length > 0 && (
          <div style={styles.profileField}>
            <label>Hijos Vinculados:</label>
            <span>{selectedUser.children.length}</span>
          </div>
        )}
      </div>

      <div style={styles.modalActions}>
        {isEditing ? (
          // ✅ BOTONES EN MODO EDICIÓN
          <>
            <button 
              onClick={handleCancelEdit}
              style={styles.modalButtonSecondary}
            >
              Cancelar
            </button>
            <button 
              onClick={handleSaveEdit}
              style={styles.modalButton}
              disabled={actionLoading}
            >
              {actionLoading ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </>
        ) : (
          // ✅ BOTONES EN MODO LECTURA
          <>
            <button 
              onClick={() => setShowUserModal(false)}
              style={styles.modalButtonSecondary}
            >
              Cerrar
            </button>
            <button 
              onClick={() => handleEditUser(selectedUser)}
              style={styles.modalButton}
            >
              ✏️ Editar Usuario
            </button>
          </>
        )}
      </div>
    </div>
  </div>
)}

      {/* Modal de Vincular Padre-Hijo */}
      {showLinkModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h3 style={styles.modalTitle}>Vincular Padre e Hijo</h3>
            <div style={styles.linkForm}>
              <div style={styles.formGroup}>
                <label>Seleccionar Padre:</label>
                <select 
                  value={linkParentId}
                  onChange={(e) => setLinkParentId(e.target.value)}
                  style={styles.select}
                >
                  <option value="">Selecciona un padre</option>
                  {users.filter(u => u.role === 'PARENT').map(parent => (
                    <option key={parent._id} value={parent._id}>
                      {parent.name} ({parent.email})
                    </option>
                  ))}
                </select>
              </div>
              <div style={styles.formGroup}>
                <label>Seleccionar Hijo:</label>
                <select 
                  value={linkChildId}
                  onChange={(e) => setLinkChildId(e.target.value)}
                  style={styles.select}
                >
                  <option value="">Selecciona un hijo</option>
                  {users.filter(u => u.role === 'STUDENT').map(student => (
                    <option key={student._id} value={student._id}>
                      {student.name} ({student.email})
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div style={styles.modalActions}>
              <button 
                onClick={() => setShowLinkModal(false)}
                style={styles.modalButtonSecondary}
              >
                Cancelar
              </button>
              <button 
                onClick={handleLinkParentChild}
                style={styles.modalButton}
                disabled={actionLoading || !linkParentId || !linkChildId}
              >
                {actionLoading ? 'Vinculando...' : 'Vincular'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Funciones auxiliares para estilos
const getRoleStyle = (role) => {
  const styles = {
    ADMIN: { background: '#ef4444', color: 'white' },
    PARENT: { background: '#3b82f6', color: 'white' },
    STUDENT: { background: '#10b981', color: 'white' },
  };
  return {
    ...styles[role] || { background: '#6b7280', color: 'white' },
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    fontSize: '0.8rem',
    fontWeight: '600',
  };
};

const getTypeStyle = (type) => {
  return {
    background: '#f3f4f6',
    color: '#374151',
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    fontSize: '0.8rem',
  };
};

// Estilos
const styles = {
  container: {
    padding: '2rem',
    maxWidth: '1400px',
    margin: '0 auto',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '50vh',
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
  },
  header: {
    marginBottom: '2rem',
    textAlign: 'center',
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: '700',
    color: '#1e293b',
    margin: '0 0 0.5rem 0',
  },
  subtitle: {
    fontSize: '1.1rem',
    color: '#64748b',
    margin: 0,
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '1.5rem',
    marginBottom: '2rem',
  },
  statCard: {
    background: 'white',
    padding: '1.5rem',
    borderRadius: '12px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },// Agrega al objeto styles:
editButton: {
  background: '#f59e0b',
},
activateButton: {
  background: '#10b981',
},
deactivateButton: {
  background: '#6b7280',
},
editForm: {
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
  marginBottom: '1.5rem',
},
  statIcon: {
    fontSize: '2rem',
  },
  statContent: {
    flex: 1,
  },
  statLabel: {
    fontSize: '0.9rem',
    color: '#64748b',
    margin: '0 0 0.5rem 0',
    fontWeight: '500',
  },
  // En tu objeto styles, agrega:
editInput: {
  padding: '0.5rem',
  border: '2px solid #e5e7eb',
  borderRadius: '6px',
  fontSize: '1rem',
  width: '200px',
},
editSelect: {
  padding: '0.5rem',
  border: '2px solid #e5e7eb',
  borderRadius: '6px',
  fontSize: '1rem',
  width: '200px',
  background: 'white',
},
  statValue: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#3b82f6',
    margin: 0,
  },
  linkButton: {
    background: '#8b5cf6',
    color: 'white',
    border: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.8rem',
    fontWeight: '500',
  },
  section: {
    background: 'white',
    padding: '2rem',
    borderRadius: '12px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    marginBottom: '2rem',
  },
  sectionHeader: {
    marginBottom: '1.5rem',
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
    margin: 0,
  },
  tableContainer: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  tableHeader: {
    background: '#f8fafc',
    borderBottom: '2px solid #e5e7eb',
  },
  tableRow: {
    borderBottom: '1px solid #e5e7eb',
  },
  tableCell: {
    padding: '1rem',
    textAlign: 'left',
  },
  statusActive: {
    color: '#10b981',
    fontWeight: '600',
    background: '#d1fae5',
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    fontSize: '0.8rem',
  },
  statusInactive: {
    color: '#ef4444',
    fontWeight: '600',
    background: '#fee2e2',
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    fontSize: '0.8rem',
  },
  actions: {
    display: 'flex',
    gap: '0.5rem',
  },
  actionButton: {
    background: '#3b82f6',
    color: 'white',
    border: 'none',
    padding: '0.5rem',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.8rem',
  },
  deleteButton: {
    background: '#ef4444',
  },
  emptyState: {
    textAlign: 'center',
    padding: '2rem',
    color: '#6b7280',
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
  },
  modal: {
    background: 'white',
    padding: '2rem',
    borderRadius: '12px',
    width: '90%',
    maxWidth: '500px',
    boxShadow: '0 20px 25px rgba(0,0,0,0.1)',
  },
  modalTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    margin: '0 0 1.5rem 0',
    color: '#1e293b',
  },
  userProfile: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    marginBottom: '1.5rem',
  },
  profileField: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.5rem 0',
    borderBottom: '1px solid #e5e7eb',
  },
  linkForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    marginBottom: '1.5rem',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  select: {
    padding: '0.75rem',
    border: '2px solid #e5e7eb',
    borderRadius: '6px',
    fontSize: '1rem',
  },
  modalActions: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'flex-end',
  },
  modalButton: {
    background: '#3b82f6',
    color: 'white',
    border: 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '500',
  },
  modalButtonSecondary: {
    background: '#6b7280',
    color: 'white',
    border: 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '500',
  },
};

// Agregar estilos globales para la animación
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

export default DashboardAdmin;