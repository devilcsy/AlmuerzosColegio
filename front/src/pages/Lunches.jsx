//Lunches.jsx
import React, { useEffect, useState } from 'react'
import { getStoredUser } from '../utils/auth'
import api from '../services/api'

export default function Lunches(){
  const [lunches, setLunches] = useState([])
  const [available, setAvailable] = useState([])
  const [form, setForm] = useState({ name: "", type: "" })
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('chicken')
  const [backgroundImage, setBackgroundImage] = useState('')
  const [purchaseLoading, setPurchaseLoading] = useState(null)
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
        
        // Establecer imagen de fondo con la primera imagen de la categoría
        if (data.length > 0) {
          setBackgroundImage(data[0].strMealThumb)
        }
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

    setPurchaseLoading(lunch.idMeal);

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
    } finally {
      setPurchaseLoading(null);
    }
  };

  const categories = [
    { value: 'chicken', label: '🍗 Pollo' },
    { value: 'beef', label: '🥩 Carne' },
    { value: 'seafood', label: '🐟 Mariscos' },
    { value: 'vegetarian', label: '🥗 Vegetariano' },
    { value: 'pasta', label: '🍝 Pasta' },
    { value: 'dessert', label: '🍰 Postres' }
  ]

  return (
    <div style={styles.container}>
      {/* Fondo con overlay */}
      <div style={styles.backgroundSection}>
        {backgroundImage && (
          <div 
            style={{
              ...styles.backgroundImage,
              backgroundImage: `url(${backgroundImage})`
            }}
          />
        )}
        <div style={styles.backgroundOverlay}></div>
      </div>

      {/* Contenido principal */}
      <div style={styles.content}>
        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.title}>Catálogo de Almuerzos</h1>
          <p style={styles.subtitle}>Descubre nuestra variedad de deliciosos platillos</p>
        </div>

        {/* Solo administradores pueden agregar almuerzos */}
        {user?.role === 'ADMIN' && (
          <div style={styles.adminSection}>
            <div style={styles.adminCard}>
              <h2 style={styles.sectionTitle}>Gestión de Almuerzos</h2>
              <p style={styles.sectionDescription}>Agregar nuevo platillo al sistema</p>
              
              <form onSubmit={handleSubmit} style={styles.adminForm}>
                <div style={styles.formRow}>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>
                      Nombre del platillo
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      style={styles.input}
                      placeholder="Ej: Pollo a la Plancha"
                    />
                  </div>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>
                      Tipo/Categoría
                    </label>
                    <input
                      type="text"
                      name="type"
                      value={form.type}
                      onChange={handleChange}
                      style={styles.input}
                      placeholder="Ej: Principal"
                    />
                  </div>
                  <button 
                    type="submit"
                    style={styles.submitButton}
                  >
                    Agregar Almuerzo
                  </button>
                </div>
              </form>
            </div>

            {/* Almuerzos guardados en el sistema */}
            {lunches.length > 0 && (
              <div style={styles.savedLunches}>
                <h3 style={styles.sectionTitle}>Almuerzos del Sistema</h3>
                <div style={styles.savedGrid}>
                  {lunches.map((lunch, i) => (
                    <div key={i} style={styles.savedCard}>
                      <div style={styles.savedInfo}>
                        <h4 style={styles.savedName}>{lunch.name}</h4>
                        <span style={styles.savedType}>{lunch.type}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Catálogo principal */}
        <div style={styles.catalogSection}>
          <div style={styles.catalogHeader}>
            <div>
              <h2 style={styles.sectionTitle}>Menú Disponible</h2>
              <p style={styles.sectionDescription}>
                Explora nuestra selección de platillos por categoría
              </p>
            </div>
            <div style={styles.filterSection}>
              <label style={styles.filterLabel}>Filtrar por categoría:</label>
              <select 
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                style={styles.categorySelect}
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <div style={styles.loadingState}>
              <div style={styles.spinner}></div>
              <p style={styles.loadingText}>Cargando almuerzos...</p>
            </div>
          ) : available.length === 0 ? (
            <div style={styles.emptyState}>
              <span style={styles.emptyIcon}>🍽️</span>
              <h3 style={styles.emptyTitle}>No hay platos disponibles</h3>
              <p style={styles.emptyText}>No se encontraron platos en esta categoría.</p>
            </div>
          ) : (
            <div style={styles.lunchesGrid}>
              {available.map(plato => (
                <div 
                  key={plato.idMeal} 
                  style={styles.lunchCard}
                  onClick={() => handleSelectLunch(plato)}
                >
                  <div style={styles.imageContainer}>
                    <img 
                      src={plato.strMealThumb} 
                      alt={plato.strMeal} 
                      style={styles.lunchImage}
                    />
                    <div style={styles.imageOverlay}></div>
                  </div>
                  
                  <div style={styles.cardContent}>
                    <h3 style={styles.lunchName}>
                      {plato.strMeal}
                    </h3>
                    <div style={styles.priceSection}>
                      <span style={styles.price}>$5.00</span>
                      <span style={styles.priceLabel}>por plato</span>
                    </div>
                    
                    <button 
                      style={
                        purchaseLoading === plato.idMeal 
                          ? styles.buttonLoading 
                          : styles.selectButton
                      }
                      onClick={(e) => {
                        e.stopPropagation()
                        handleSelectLunch(plato)
                      }}
                      disabled={purchaseLoading === plato.idMeal}
                    >
                      {purchaseLoading === plato.idMeal ? (
                        <>
                          <div style={styles.miniSpinner}></div>
                          Procesando...
                        </>
                      ) : (
                        'Seleccionar'
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Estilos mejorados
const styles = {
  container: {
    minHeight: '100vh',
    background: '#f8fafc',
    position: 'relative',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  backgroundSection: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundAttachment: 'fixed',
  },
  backgroundOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(135deg, rgba(19, 19, 20, 0.85) 0%, rgba(55, 48, 163, 0.8) 100%)',
  },
  content: {
    position: 'relative',
    zIndex: 1,
    padding: '2rem',
    maxWidth: '1400px',
    margin: '0 auto',
  },
  header: {
    textAlign: 'center',
    marginBottom: '3rem',
    color: 'white',
  },
  title: {
    fontSize: '3rem',
    fontWeight: '700',
    margin: '0 0 1rem 0',
    letterSpacing: '-0.025em',
    background: 'linear-gradient(135deg, #fff, #e2e8f0)',
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  subtitle: {
    fontSize: '1.2rem',
    opacity: 0.9,
    margin: 0,
    fontWeight: '300',
  },
  adminSection: {
    marginBottom: '3rem',
  },
  adminCard: {
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)',
    padding: '2rem',
    borderRadius: '20px',
    marginBottom: '2rem',
    boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
    border: '1px solid rgba(255,255,255,0.2)',
  },
  sectionTitle: {
    fontSize: '1.5rem',
    fontWeight: '600',
    color: '#1e293b',
    margin: '0 0 0.5rem 0',
  },
  sectionDescription: {
    fontSize: '1rem',
    color: '#64748b',
    margin: '0 0 1.5rem 0',
  },
  adminForm: {
    marginTop: '1.5rem',
  },
  formRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr auto',
    gap: '1rem',
    alignItems: 'end',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
  },
  label: {
    fontSize: '0.9rem',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '0.5rem',
  },
  input: {
    padding: '0.75rem',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '1rem',
    transition: 'all 0.2s ease',
  },
  submitButton: {
    background: 'linear-gradient(135deg, #10b981, #059669)',
    color: 'white',
    border: 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '0.9rem',
    height: 'fit-content',
  },
  savedLunches: {
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)',
    padding: '2rem',
    borderRadius: '20px',
    boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
    border: '1px solid rgba(255,255,255,0.2)',
  },
  savedGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: '1rem',
  },
  savedCard: {
    background: 'white',
    padding: '1rem',
    borderRadius: '12px',
    border: '1px solid #e5e7eb',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
  },
  savedInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  },
  savedName: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#1e293b',
    margin: 0,
  },
  savedType: {
    fontSize: '0.8rem',
    color: '#6b7280',
    background: '#f3f4f6',
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    width: 'fit-content',
  },
  catalogSection: {
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)',
    padding: '2rem',
    borderRadius: '20px',
    boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
    border: '1px solid rgba(255,255,255,0.2)',
  },
  catalogHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '2rem',
    flexWrap: 'wrap',
    gap: '1rem',
  },
  filterSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    minWidth: '200px',
  },
  filterLabel: {
    fontSize: '0.9rem',
    fontWeight: '600',
    color: '#374151',
  },
  categorySelect: {
    padding: '0.75rem',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '1rem',
    background: 'white',
    cursor: 'pointer',
  },
  loadingState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '4rem',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #e5e7eb',
    borderTop: '4px solid #3b82f6',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  loadingText: {
    marginTop: '1rem',
    color: '#6b7280',
    fontSize: '1rem',
  },
  emptyState: {
    textAlign: 'center',
    padding: '4rem',
    color: '#9ca3af',
  },
  emptyIcon: {
    fontSize: '3rem',
    marginBottom: '1rem',
  },
  emptyTitle: {
    fontSize: '1.5rem',
    fontWeight: '600',
    margin: '0 0 0.5rem 0',
  },
  emptyText: {
    fontSize: '1rem',
    opacity: 0.8,
  },
  lunchesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '2rem',
  },
  lunchCard: {
    background: 'white',
    borderRadius: '16px',
    overflow: 'hidden',
    boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    border: '1px solid #f1f5f9',
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: '200px',
    overflow: 'hidden',
  },
  lunchImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'transform 0.3s ease',
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.1))',
  },
  cardContent: {
    padding: '1.5rem',
  },
  lunchName: {
    fontSize: '1.1rem',
    fontWeight: '600',
    color: '#1e293b',
    margin: '0 0 1rem 0',
    lineHeight: 1.4,
  },
  priceSection: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '0.5rem',
    marginBottom: '1.5rem',
  },
  price: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#10b981',
  },
  priceLabel: {
    fontSize: '0.8rem',
    color: '#6b7280',
  },
  selectButton: {
    width: '100%',
    padding: '0.75rem',
    background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '0.9rem',
    transition: 'all 0.2s ease',
  },
  buttonLoading: {
    width: '100%',
    padding: '0.75rem',
    background: '#9ca3af',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'not-allowed',
    fontWeight: '600',
    fontSize: '0.9rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
  },
  miniSpinner: {
    width: '16px',
    height: '16px',
    border: '2px solid transparent',
    borderTop: '2px solid white',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
};

// Agregar estilos globales para la animación
const globalStyles = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  .lunch-card:hover .lunch-image {
    transform: scale(1.05);
  }
  
  .lunch-card:hover {
    transform: translateY(-8px);
    box-shadow: 0 20px 40px rgba(0,0,0,0.15);
  }
`;

// Inyectar estilos globales
const styleSheet = document.createElement('style');
styleSheet.innerText = globalStyles;
document.head.appendChild(styleSheet);