import { useState, useEffect } from 'react'
import { Beaker, Save, Trash2 } from 'lucide-react'
import { api } from '../api/client'
import './ManageLabs.css'

export default function ManageLabs() {
  const [labsList, setLabsList]   = useState([])
  const [depts,    setDepts]      = useState([])
  const [name,     setName]       = useState('')
  const [deptId,   setDeptId]     = useState('')
  const [success,  setSuccess]    = useState('')
  const [error,    setError]      = useState('')

  async function loadLabs() {
    try { setLabsList(await api.get('/labs')) } catch (err) { setError(err.message) }
  }

  async function loadDepts() {
    try { setDepts(await api.get('/departments')) } catch (err) { console.error(err) }
  }

  useEffect(() => { loadLabs(); loadDepts() }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setSuccess(''); setError('')
    try {
      await api.post('/labs', { name, departmentId: parseInt(deptId) })
      setSuccess(`Laboratorio ${name} registrado.`)
      setName(''); setDeptId('')
      loadLabs()
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('¿Eliminar laboratorio? Los assets quedarán como baja.')) return
    try {
      await api.delete(`/labs/${id}`)
      loadLabs()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="add-user manage-labs">
      <div className="page-header">
        <h1>Manage Laboratories</h1>
        <p>Register or remove laboratories</p>
      </div>

      <div className="users-crud-container">
        <div className="card add-user-card">
          <div className="add-user-header">
            <Beaker size={32} className="add-user-icon" />
            <h2 className="card-title">New Laboratory</h2>
          </div>

          {success && <div className="success-msg">{success}</div>}
          {error   && <div className="login-error">{error}</div>}

          <form className="asset-form user-form" onSubmit={handleSubmit}>
            <div className="form-group full-width">
              <label>Nombre <span className="required">*</span></label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} required />
            </div>

            <div className="form-group full-width">
              <label>Departamento <span className="required">*</span></label>
              <select value={deptId} onChange={e => setDeptId(e.target.value)} required>
                <option value="" disabled>Seleccionar</option>
                {depts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-primary flex items-center justify-center gap-2">
                <Save size={18} />Register Lab
              </button>
            </div>
          </form>
        </div>

        <div className="card users-list-card">
          <h2 className="card-title" style={{ marginBottom: '1rem' }}>Active Laboratories</h2>
          <div className="users-list">
            {labsList.map(l => (
              <div key={l.id} className="user-item">
                <div className="user-info">
                  <p className="user-name">{l.name}</p>
                  <p className="user-email">{l.department?.name}</p>
                </div>
                <div className="user-actions">
                  <button className="btn-icon danger" onClick={() => handleDelete(l.id)}><Trash2 size={16} /></button>
                </div>
              </div>
            ))}
            {labsList.length === 0 && <p style={{ color: 'var(--text-muted)' }}>No hay laboratorios.</p>}
          </div>
        </div>
      </div>
    </div>
  )
}