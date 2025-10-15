import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { saveAuth, apiFetch } from '../utils/auth'

export default function Login(){
  const [documento, setDocumento] = useState('')
  const [mensaje, setMensaje] = useState('')
  const navigate = useNavigate()

  const handleLogin = async () => {
    setMensaje('Validando...')
    // Assumes backend endpoint POST /api/login with body { documento }
    const res = await apiFetch('/api/login', {
      method: 'POST',
      body: JSON.stringify({ documento })
    })
    if (res.ok && res.data && res.data.token){
      saveAuth(res.data)
      navigate('/dashboard')
    } else {
      setMensaje(res.data?.message || 'Documento incorrecto')
    }
  }

  return (
    <div className="card center-card">
      <h2>Ingreso - Compras Digitales</h2>
      <input
        placeholder="Documento o código"
        value={documento}
        onChange={(e)=>setDocumento(e.target.value)}
        className="input"
      />
      <button className="btn" onClick={handleLogin}>Ingresar</button>
      <p className="muted">{mensaje}</p>
    </div>
  )
}