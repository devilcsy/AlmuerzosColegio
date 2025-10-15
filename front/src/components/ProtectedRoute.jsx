import React from 'react'
import { Navigate } from 'react-router-dom'
import { getUser } from '../utils/auth'

export default function ProtectedRoute({ children, roles }){
  const user = getUser()
  if (!user) return <Navigate to="/login" replace />
  if (roles && roles.length && !roles.includes(user.role)) {
    return <div style={{padding:20}}>Acceso denegado. No tienes permisos para ver esta página.</div>
  }
  return children
}