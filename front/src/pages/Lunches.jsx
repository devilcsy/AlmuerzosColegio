
import React, { useEffect, useState } from 'react'
import { getStoredUser } from '../utils/auth'
import api from '../services/api'

export default function Lunches(){
  const [lunches, setLunches] = useState([])
  const [available, setAvailable] = useState([])
  const [form, setForm] = useState({ name: "", type: "" })
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('chicken')
  const user = getStoredUser()


  useEffect(() => {
    const loadLunches = async () => {
      try {
        const data = await api.getLunches()
        setLunches(data)
      } catch (error) {
        console.error('Error cargando almuerzos:', error)
      }
    }
    loadLunches()
  }, [])

  
  useEffect(() => {
    const loadAvailableLunches = async () => {
      setLoading(true)
      try {
        const data = await api.getLunchesByCategory(selectedCategory)
        setAvailable(data)
      } catch (error) {
        console.error('Error cargando menú disponible:', error)
      } finally {
        setLoading(false)
      }
    }
    loadAvailableLunches()
  }, [selectedCategory])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.type) {
      alert("Por favor, completa todos los campos")
      return
    }

    try {
      const newLunch = await api.addLunch(form)
      setLunches(prev => [...prev, newLunch])
      setForm({ name: "", type: "" })
      alert("Almuerzo agregado exitosamente!")
    } catch (error) {
      alert("Error al agregar almuerzo")
    }
  }

  const handleSelectLunch = async (lunch) => {
    if (!user) {
      alert('Debes iniciar sesión para realizar una compra');
      return;
    }

    const purchaseData = {
      items: [{
        name: lunch.strMeal,
        price: 5.00,
        quantity: 1
      }],
      totalAmount: 5.00,
      type: 'LUNCH'
    };

    try {
      const result = await api.makePurchase(purchaseData);
      
      if (result.success) {
        alert(`¡Compra realizada exitosamente!\nHas comprado: ${lunch.strMeal}\nNuevo saldo: $${result.newBalance}`);
        
        // Actualizar saldo en el localStorage
        const updatedUser = { ...user, balance: result.newBalance };
        localStorage.setItem('userData', JSON.stringify(updatedUser));
        
        // Recargar la página para actualizar el estado
        window.location.reload();
      } else {
        alert(result.message || 'Error al realizar la compra');
      }
    } catch (error) {
      alert('Error al procesar la compra');
    }
  };

  const categories = [
    { value: 'chicken', label: 'Pollo' },
    { value: 'beef', label: 'Carne' },
    { value: 'seafood', label: 'Mariscos' },
    { value: 'vegetarian', label: 'Vegetariano' },
    { value: 'pasta', label: 'Pasta' }
  ]

  return (
    <section style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ color: '#333', marginBottom: '2rem' }}>Catálogo de Almuerzos</h1>

      {/* Solo administradores pueden agregar almuerzos */}
      {user?.role === 'ADMIN' && (
        <div style={{ 
          background: '#f8f9fa', 
          padding: '1.5rem', 
          borderRadius: '8px',
          marginBottom: '2rem'
        }}>
          <h2 style={{ color: '#495057', marginBottom: '1rem' }}>Agregar almuerzo (Solo Admin)</h2>
          <form onSubmit={handleSubmit} className="form" style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                Nombre del platillo:
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  style={{ 
                    width: '100%', 
                    padding: '0.5rem', 
                    border: '1px solid #ddd', 
                    borderRadius: '4px',
                    marginTop: '0.25rem'
                  }}
                  placeholder="Ej: Pollo a la Plancha"
                />
              </label>
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                Tipo/Categoría:
                <input
                  type="text"
                  name="type"
                  value={form.type}
                  onChange={handleChange}
                  style={{ 
                    width: '100%', 
                    padding: '0.5rem', 
                    border: '1px solid #ddd', 
                    borderRadius: '4px',
                    marginTop: '0.25rem'
                  }}
                  placeholder="Ej: Principal"
                />
              </label>
            </div>
            <button 
              type="submit"
              style={{
                padding: '0.5rem 1.5rem',
                background: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Guardar
            </button>
          </form>
        </div>
      )}

      {/* Almuerzos guardados en el sistema */}
      {user?.role === 'ADMIN' && (
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ color: '#495057', marginBottom: '1rem' }}>Almuerzos guardados en el sistema</h2>
          {lunches.length === 0 ? (
            <p style={{ color: '#6c757d' }}>No hay almuerzos configurados en el sistema.</p>
          ) : (
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', 
              gap: '1rem' 
            }}>
              {lunches.map((lunch, i) => (
                <div key={i} style={{
                  background: 'white',
                  padding: '1rem',
                  borderRadius: '8px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  border: '1px solid #e9ecef'
                }}>
                  <h3 style={{ margin: '0 0 0.5rem 0', color: '#495057' }}>{lunch.name}</h3>
                  <p style={{ margin: 0, color: '#6c757d' }}>Tipo: {lunch.type}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Catálogo de almuerzos disponibles */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ color: '#495057', margin: 0 }}>Catálogo de Almuerzos Disponibles</h2>
          <select 
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{
              padding: '0.5rem',
              border: '1px solid #ddd',
              borderRadius: '4px',
              background: 'white'
            }}
          >
            {categories.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <p style={{ textAlign: 'center', color: '#6c757d' }}>Cargando almuerzos...</p>
        ) : available.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#6c757d' }}>No se encontraron platos en esta categoría.</p>
        ) : (
          <div className="lunch-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '1.5rem'
          }}>
            {available.map(plato => (
              <div 
                key={plato.idMeal} 
                className="lunch-card"
                style={{
                  background: 'white',
                  borderRadius: '12px',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                  overflow: 'hidden',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)'
                  e.currentTarget.style.boxShadow = '0 8px 15px rgba(0,0,0,0.15)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)'
                }}
                onClick={() => handleSelectLunch(plato)}
              >
                <img 
                  src={plato.strMealThumb} 
                  alt={plato.strMeal} 
                  className="lunch-img"
                  style={{
                    width: '100%',
                    height: '200px',
                    objectFit: 'cover'
                  }}
                />
                <div style={{ padding: '1rem' }}>
                  <h3 style={{ 
                    margin: '0 0 0.5rem 0', 
                    color: '#333',
                    fontSize: '1.1rem'
                  }}>
                    {plato.strMeal}
                  </h3>
                  <p style={{ 
                    margin: '0 0 1rem 0', 
                    color: '#28a745',
                    fontWeight: 'bold',
                    fontSize: '1.2rem'
                  }}>
                    $5.00
                  </p>
                  <button 
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      background: '#007bff',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: 'bold'
                    }}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleSelectLunch(plato)
                    }}
                  >
                    Seleccionar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
