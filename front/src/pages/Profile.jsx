import React from 'react';
import { getStoredUser } from '../utils/auth';

const Profile = () => {
  const user = getStoredUser();

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Mi Perfil</h1>
      
      {user ? (
        <div style={{ 
          background: 'white', 
          padding: '2rem', 
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          maxWidth: '500px'
        }}>
          <div style={{ marginBottom: '1rem' }}>
            <strong>Nombre:</strong> {user.name}
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <strong>Email:</strong> {user.email}
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <strong>Rol:</strong> {user.role}
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <strong>Saldo:</strong> ${user.balance || 0}
          </div>
          {user.studentId && (
            <div style={{ marginBottom: '1rem' }}>
              <strong>ID Estudiante:</strong> {user.studentId}
            </div>
          )}
          {user.department && (
            <div style={{ marginBottom: '1rem' }}>
              <strong>Departamento/Grado:</strong> {user.department}
            </div>
          )}
        </div>
      ) : (
        <p>No se pudo cargar la información del perfil.</p>
      )}
    </div>
  );
};

export default Profile;
