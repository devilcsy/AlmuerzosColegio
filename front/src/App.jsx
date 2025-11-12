import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'

import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import DashboardParent from './pages/DashboardParent'
import Purchases from './pages/Purchases'
import Profile from './pages/Profile'
import Admin from './pages/Admin'
import Lunches from './pages/Lunches'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import { getStoredUser } from './utils/auth'

const DashboardWrapper = () => {
  const user = getStoredUser()
  if (!user) return <Navigate to="/login" replace />
  
  switch (user.role) {
    case 'PARENT':
      return <DashboardParent />
    case 'ADMIN':
      return <Admin /> // opcional si quieres que admin también vea dashboard
    default:
      return <Dashboard />
  }
}

export default function App() {
  return (
    <div className="app-root">
      <Navbar />
      <main className="main-container">
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Dashboard común con redirección según rol */}
          <Route path="/dashboard" element={
            <ProtectedRoute roles={['STUDENT','STAFF','PARENT']}>
              <DashboardWrapper />
            </ProtectedRoute>
          } />

          {/* Rutas específicas */}
          <Route path="/lunches" element={
            <ProtectedRoute roles={['STUDENT','STAFF']}>
              <Lunches />
            </ProtectedRoute>
          } />
          <Route path="/purchases" element={
            <ProtectedRoute roles={['STUDENT','STAFF']}>
              <Purchases />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute roles={['STUDENT','STAFF']}>
              <Profile />
            </ProtectedRoute>
          } />

          <Route path="/admin" element={
            <ProtectedRoute roles={['ADMIN']}>
              <Admin />
            </ProtectedRoute>
          } />
        </Routes>
      </main>
    </div>
  )
}
