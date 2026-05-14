import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertTriangle, Clock, CheckCircle, Edit, X } from 'lucide-react'
import { api } from '../api/client'
import './Inventory.css'

const STATUS_LABELS  = { activo: 'Activo', mantenimiento: 'Mantenimiento', baja: 'Baja', agotado: 'Agotado' }
const RESOLVE_OPTIONS = [
  { value: 'activo',  label: 'Marcar como Activo'  },
  { value: 'baja',    label: 'Dar de Baja'          },
]

function ResolveModal({ asset, onClose, onResolved }) {
  const [newStatus, setNewStatus] = useState('activo')
  const [reason,    setReason]    = useState('')
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (!reason.trim()) return setError('El motivo es requerido')
    setLoading(true)
    try {
      await api.patch(`/alerts/${asset.id}/resolve`, { newStatus, reason })
      onResolved()
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2 className="modal-title">Resolver alerta</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{asset.name}</p>
          </div>
          <button className="modal-close" onClick={onClose}><X size={20} /></button>
        </div>
        <div className="modal-body">
          {error && <div className="login-error" style={{ marginBottom: '1rem' }}>{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label>Nuevo status</label>
              <select value={newStatus} onChange={e => setNewStatus(e.target.value)}>
                {RESOLVE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label>Motivo <span className="required">*</span></label>
              <textarea
                rows={3}
                placeholder="Describe qué se hizo para resolver la situación..."
                value={reason}
                onChange={e => setReason(e.target.value)}
                required
              />
            </div>
            <div className="form-actions">
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Guardando...' : 'Confirmar'}
              </button>
              <button type="button" className="btn-secondary" onClick={onClose}>Cancelar</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default function Alerts() {
  const navigate  = useNavigate()
  const [data,       setData]       = useState({ criticos: [], proximosVencer: [], total: 0 })
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState('')
  const [resolving,  setResolving]  = useState(null)
  const [activeTab,  setActiveTab]  = useState('criticos')

  async function load() {
    setLoading(true)
    try {
      const result = await api.get('/alerts')
      setData(result)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const items = activeTab === 'criticos' ? data.criticos : data.proximosVencer

  return (
    <div className="inventory alerts-page">
      <div className="page-header" style={{ borderBottom: '2px solid var(--danger)', paddingBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <AlertTriangle size={28} color="var(--danger)" />
          <h1 style={{ marginBottom: 0 }}>Alertas</h1>
          {data.total > 0 && (
            <span style={{
              background: 'var(--danger)', color: '#fff',
              borderRadius: '999px', fontSize: '0.8rem',
              fontWeight: 700, padding: '0.2rem 0.6rem'
            }}>{data.total}</span>
          )}
        </div>
        <p style={{ marginTop: '0.5rem' }}>Activos que requieren atención inmediata</p>
      </div>

      {/* Tabs */}
      <div className="lab-selector" style={{ marginTop: '1.25rem' }}>
        <button
          className={`lab-tab ${activeTab === 'criticos' ? 'active' : ''}`}
          onClick={() => setActiveTab('criticos')}
        >
          Críticos ({data.criticos.length})
        </button>
        <button
          className={`lab-tab ${activeTab === 'proximos' ? 'active' : ''}`}
          onClick={() => setActiveTab('proximos')}
        >
          <Clock size={14} style={{ marginRight: '0.3rem' }} />
          Próximos a vencer ({data.proximosVencer.length})
        </button>
      </div>

      <div className="card inventory-container" style={{ marginTop: '1rem' }}>
        {error && <p style={{ color: 'var(--danger)', padding: '1rem' }}>{error}</p>}

        <div className="table-wrapper">
          <table className="inventory-table">
            <thead>
              <tr>
                <th>Activo</th>
                <th>Laboratorio</th>
                <th>Status</th>
                <th>Último cambio</th>
                <th>Por</th>
                {activeTab === 'proximos' && <th>Caducidad</th>}
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    Cargando...
                  </td>
                </tr>
              )}
              {!loading && items.map(item => (
                <tr key={item.id} style={{ background: 'var(--warning-bg, #fffbeb)' }}>
                  <td className="item-name">{item.name}</td>
                  <td>{item.lab?.name}</td>
                  <td>
                    <span className={`status-badge ${item.status}`}>
                      {STATUS_LABELS[item.status] ?? item.status}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {item.statusHistory?.[0]
                      ? new Date(item.statusHistory[0].changedAt).toLocaleDateString('es-MX')
                      : '—'}
                  </td>
                  <td style={{ fontSize: '0.8rem' }}>
                    {item.statusHistory?.[0]?.changedBy?.name ?? '—'}
                  </td>
                  {activeTab === 'proximos' && (
                    <td style={{ color: 'var(--danger)', fontWeight: 600 }}>
                      {item.extraFields?.caducidad
                        ? new Date(item.extraFields.caducidad).toLocaleDateString('es-MX')
                        : '—'}
                    </td>
                  )}
                  <td>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button
                        className="btn-icon"
                        title="Editar"
                        onClick={() => navigate(`/edit/${item.id}`)}
                      >
                        <Edit size={15} />
                      </button>
                      {activeTab === 'criticos' && (
                        <button
                          className="btn-icon"
                          title="Resolver"
                          style={{ color: 'var(--success)' }}
                          onClick={() => setResolving(item)}
                        >
                          <CheckCircle size={15} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && items.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--success)' }}>
                    ✓ Sin alertas en esta categoría
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="table-footer">
          <p>Mostrando {items.length} alerta{items.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {resolving && (
        <ResolveModal
          asset={resolving}
          onClose={() => setResolving(null)}
          onResolved={load}
        />
      )}
    </div>
  )
}