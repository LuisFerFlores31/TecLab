import { useState, useEffect } from 'react'
import { Package, Clock } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { api } from '../api/client'
import './Dashboard.css'

export default function Dashboard() {
  const { user } = useAuth()
  const [labs,    setLabs]    = useState([])
  const [loading, setLoading] = useState(true)
  const [query,   setQuery]   = useState('')

  const filteredLabs = labs.filter(lab => {
    const term = query.trim().toLowerCase()
    if (!term) return true

    const labName = lab.name?.toLowerCase() ?? ''
    const departmentName = lab.department?.name?.toLowerCase() ?? ''
    return labName.includes(term) || departmentName.includes(term)
  })

  useEffect(() => {
    api.get('/labs')
      .then(setLabs)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="dashboard">
      <div className="page-header">
        <h1>Hola {user?.name || 'usuario'}</h1>
        <p>Bienvenido de vuelta al panel de laboratorio</p>
      </div>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Buscar Laboratorios..."
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
      </div>

      <div className="kpi-grid">
        <div className="card kpi-card primary-kpi">
          <div className="kpi-content">
            <p className="kpi-label">Laboratorios</p>
            <h3>{loading ? '...' : labs.length}</h3>
            <p className="kpi-subtext">
              {user?.role === 'coordinador' ? 'Vista global' : 'Tus laboratorios'}
            </p>
          </div>
          <div className="kpi-icon primary-icon-bg">
            <Package size={24} className="primary-icon" />
          </div>
        </div>

        <div className="card kpi-card danger-kpi">
          <div className="kpi-content">
            <p className="kpi-label">Alertas activas</p>
            <h3 className="danger-text">—</h3>
            <p className="kpi-subtext">Próximamente</p>
          </div>
          <div className="kpi-icon danger-icon-bg">
            <Clock size={24} className="danger-icon" />
          </div>
        </div>
      </div>

      <div className="card recent-activity">
        <h3>Laboratorios del sistema</h3>
        <div className="activity-list">
          {loading && <p style={{ padding: '1rem', color: 'var(--text-muted)' }}>Cargando...</p>}
          {!loading && filteredLabs.map(lab => (
            <div key={lab.id} className="activity-item">
              <div className="activity-details">
                <p className="activity-user">{lab.name}</p>
                <p className="activity-action">{lab.department?.name}</p>
              </div>
            </div>
          ))}
          {!loading && filteredLabs.length === 0 && (
            <p style={{ padding: '1rem', color: 'var(--text-muted)' }}>No hay laboratorios registrados.</p>
          )}
        </div>
      </div>
    </div>
  )
}