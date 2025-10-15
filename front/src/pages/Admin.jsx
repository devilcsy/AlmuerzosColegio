import React, { useEffect, useState } from 'react'
import { apiFetch } from '../utils/auth'

export default function Admin(){
  const [users, setUsers] = useState([])

  useEffect(()=>{ fetchUsers() }, [])

  async function fetchUsers(){
    const res = await apiFetch('/api/admin/users')
    if (res.ok) setUsers(res.data || [])
  }

  return (
    <div className="card">
      <h2>Panel de administración</h2>
      <p className="muted">Gestiona usuarios y artículos.</p>
      <div>
        <h3>Usuarios</h3>
        <table className="table">
          <thead><tr><th>Nombre</th><th>Documento</th><th>Rol</th><th>Saldo</th></tr></thead>
          <tbody>
            {users.map(u=>(
              <tr key={u.id}>
                <td>{u.name}</td>
                <td>{u.documento}</td>
                <td>{u.role}</td>
                <td>{u.balance}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}