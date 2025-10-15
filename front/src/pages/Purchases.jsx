import React, { useEffect, useState } from 'react'
import { apiFetch } from '../utils/auth'

export default function Purchases(){
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [cartCode, setCartCode] = useState('')
  const [message, setMessage] = useState('')

  useEffect(()=>{ fetchItems() }, [])

  async function fetchItems(){
    setLoading(true)
    // Assumes backend endpoint GET /api/items
    const res = await apiFetch('/api/items')
    if (res.ok) setItems(res.data || [])
    setLoading(false)
  }

  async function handleBuy(itemId){
    // POST /api/purchase { itemId, cartCode }
    const res = await apiFetch('/api/purchase', {
      method: 'POST',
      body: JSON.stringify({ itemId, cartCode })
    })
    if (res.ok) setMessage('Compra realizada con éxito')
    else setMessage(res.data?.message || 'Error al comprar')
  }

  return (
    <div className="card">
      <h2>Catálogo de ventas</h2>
      <p className="muted">Introduce tu código o documento para validar la compra:</p>
      <input value={cartCode} onChange={(e)=>setCartCode(e.target.value)} placeholder="Código o documento" className="input" />
      {loading ? <p>Cargando artículos...</p> : (
        <div className="items-list">
          {items.map(it=>(
            <div key={it.id} className="item-row">
              <div>
                <strong>{it.name}</strong>
                <div className="muted">{it.description}</div>
              </div>
              <div>
                <div className="price">COP {it.price}</div>
                <button className="btn-small" onClick={()=>handleBuy(it.id)}>Comprar</button>
              </div>
            </div>
          ))}
        </div>
      )}
      <p className="muted">{message}</p>
    </div>
  )
}