import { useState, useEffect } from 'react'
import { UserPlus, Save, Edit, Trash2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { api } from '../api/client'
import './AddUser.css'

export default function AddUser() {
  const { user } = useAuth()
  const [usersList, setUsersList] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [name,      setName]      = useState('')
  const [email,     setEmail]     = useState('')
  const [password,  setPassword]  = useState('')
  const [role,      setRole]      = useState('')
  const [success,   setSuccess]   = useState('')
  const [error,     setError]     = useState('')

  async function loadUsers() {
    try {
      const data = await api.get('/users')
      setUsersList(data)
    } catch (err) {
      setError(err.message)
    }
  }

  useEffect(() => { loadUsers() }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setSuccess(''); setError('')
    try {
      if (editingId) {
        // edición: por ahora solo soportamos crear y desactivar
        // patch de datos básicos lo agregamos en siguiente iteración
        setSuccess('Edición próximamente.')
      } else {
        await api.post('/users', { name, email, password, role })
        setSuccess(`Usuario ${name} registrado.`)
        handleCancel()
        loadUsers()
      }
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleDelete(id) {
    if (id === user.id) return alert('No puedes desactivar tu propio usuario.')
    if (!window.confirm('¿Desactivar este usuario?')) return
    try {
      await api.delete(`/users/${id}`)
      loadUsers()
    } catch (err) {
      setError(err.message)
    }
  }

  function handleEdit(u) {
    setEditingId(u.id); setName(u.name); setEmail(u.email)
    setPassword(''); setRole(u.role); setSuccess(''); setError('')
  }

  function handleCancel() {
    setEditingId(null); setName(''); setEmail('')
    setPassword(''); setRole(''); setSuccess(''); setError('')
  }

  return (
    <div className="add-user">
      <div className="page-header">
        <h1>Manage Staff Users</h1>
        <p>Register or remove coordinators and lab encargados</p>
      </div>

      <div className="users-crud-container">
        <div className="card add-user-card">
          <div className="add-user-header">
            <UserPlus size={32} className="add-user-icon" />
            <h2 className="card-title">{editingId ? 'Edit User' : 'New User'}</h2>
          </div>

          {success && <div className="success-msg">{success}</div>}
          {error   && <div className="login-error">{error}</div>}

          <form className="asset-form user-form" onSubmit={handleSubmit}>
            <div className="form-group full-width">
              <label>Nombre completo <span className="required">*</span></label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} required />
            </div>

            <div className="form-split">
              <div className="form-group">
                <label>Email institucional <span className="required">*</span></label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Rol <span className="required">*</span></label>
                <select value={role} onChange={e => setRole(e.target.value)} required>
                  <option value="" disabled>Seleccionar</option>
                  <option value="encargado">Encargado</option>
                  <option value="coordinador">Coordinador</option>
                </select>
              </div>
            </div>

            <div className="form-group full-width">
              <label>Contraseña <span className="required">*</span></label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required={!editingId} />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-primary flex items-center justify-center gap-2">
                <Save size={18} />{editingId ? 'Update' : 'Register'}
              </button>
              <button type="button" className="btn-secondary" onClick={handleCancel}>Cancel</button>
            </div>
          </form>
        </div>

        <div className="card users-list-card">
          <h2 className="card-title" style={{ marginBottom: '1rem' }}>Active Users</h2>
          <div className="users-list">
            {usersList.map(u => (
              <div key={u.id} className={`user-item ${u.id === user.id ? 'current-user' : ''}`}>
                <div className="user-info">
                  <p className="user-name">{u.name} {u.id === user.id && <span className="you-badge">(Tú)</span>}</p>
                  <p className="user-email">{u.email}</p>
                  <span className="user-role">{u.role}</span>
                </div>
                <div className="user-actions">
                  <button className="btn-icon" onClick={() => handleEdit(u)}><Edit size={16} /></button>
                  {u.id !== user.id && (
                    <button className="btn-icon danger" onClick={() => handleDelete(u.id)}><Trash2 size={16} /></button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}