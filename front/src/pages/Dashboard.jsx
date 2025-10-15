import React from 'react'
import { getUser } from '../utils/auth'
import { Link } from 'react-router-dom'

export default function Dashboard(){
  const user = getUser()
  return (
    <div className="card">
      <h2>Bienvenido{user ? `, ${user.name}` : ''}</h2>
      <p>Tipo de cuenta: {user ? user.role : 'N/A'}</p>
      <div className="grid">
        <Link to="/purchases" className="tile">Realizar compra</Link>
        <Link to="/profile" className="tile">Mi perfil</Link>
        {user?.role === 'ADMIN' && <Link to="/admin" className="tile">Administrar</Link>}
      </div>
    </div>
  )
}