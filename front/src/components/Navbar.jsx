import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getUser, logout } from '../utils/auth'

export default function Navbar(){
  const navigate = useNavigate()
  const user = getUser()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="navbar">
      <div className="nav-left">
        <span className="brand">Colegio - Compras Digitales</span>
      </div>
      <div className="nav-right">
        {user ? (
          <>
            <Link to="/dashboard" className="nav-link">Inicio</Link>
            <Link to="/purchases" className="nav-link">Compras</Link>
            <Link to="/profile" className="nav-link">Perfil</Link>
            {user.role === 'ADMIN' && <Link to="/admin" className="nav-link">Admin</Link>}
            <button className="btn-link" onClick={handleLogout}>Salir</button>
          </>
        ) : (
          <Link to="/login" className="nav-link">Ingresar</Link>
        )}
      </div>
    </nav>
  )
}