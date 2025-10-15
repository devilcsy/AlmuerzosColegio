import React, { useEffect, useState } from 'react'
import { apiFetch, getUser } from '../utils/auth'

export default function Profile(){
  const current = getUser()
  const [profile, setProfile] = useState(null)

  useEffect(()=>{ fetchProfile() }, [])

  async function fetchProfile(){
    const res = await apiFetch(`/api/users/${current.id}`)
    if (res.ok) setProfile(res.data)
  }

  if (!profile) return <div className="card">Cargando perfil...</div>

  return (
    <div className="card">
      <h2>Perfil de usuario</h2>
      <div><strong>Nombre:</strong> {profile.name}</div>
      <div><strong>Documento:</strong> {profile.documento}</div>
      <div><strong>Rol:</strong> {profile.role}</div>
      <div><strong>Saldo:</strong> COP {profile.balance}</div>
    </div>
  )
}