import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Purchases from './pages/Purchases'
import Profile from './pages/Profile'
import Admin from './pages/Admin'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'

export default function App(){
  return (
    <div className="app-root">
      <Navbar />
      <main className="main-container">
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={
            <ProtectedRoute roles={['STUDENT','STAFF']}>
              <Dashboard />
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