// Simple auth helpers using localStorage.
// Assumption: backend will return a JSON with { token, user: { id, name, role } }
// Role values used here: 'STUDENT', 'STAFF', 'ADMIN'
const STORAGE_KEY = 'proyecto_colegio_auth'

export function saveAuth(payload){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
}

export function getAuth(){
  const raw = localStorage.getItem(STORAGE_KEY)
  return raw ? JSON.parse(raw) : null
}

export function getUser(){
  const auth = getAuth()
  return auth ? auth.user : null
}

export function logout(){
  localStorage.removeItem(STORAGE_KEY)
}

export function getApiUrl(){
  return import.meta.env.VITE_API_URL || 'http://localhost:8080'
}

export async function apiFetch(path, options = {}){
  const url = getApiUrl() + path
  const auth = getAuth()
  const headers = options.headers || {}
  if (auth && auth.token) headers['Authorization'] = 'Bearer ' + auth.token
  headers['Content-Type'] = 'application/json'
  const res = await fetch(url, {...options, headers})
  const data = await res.json().catch(()=>null)
  return { ok: res.ok, status: res.status, data }
}