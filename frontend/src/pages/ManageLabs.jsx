import { useState, useEffect } from 'react'
import { Beaker, Save, Trash2, Plus, Edit, X, ChevronDown, ChevronUp, Users } from 'lucide-react'
import { api } from '../api/client'
import './ManageLabs.css'

const FIELD_TYPES = [
  { value: 'text',   label: 'Texto'   },
  { value: 'number', label: 'Número'  },
  { value: 'date',   label: 'Fecha'   },
  { value: 'url',    label: 'URL'     },
  { value: 'select', label: 'Opciones'},
]

// ── Sub-componente: gestión de schema ─────────────────────────────────────────
function SchemaManager({ lab, onClose }) {
  const [fields,      setFields]      = useState([])
  const [editingId,   setEditingId]   = useState(null)
  const [showForm,    setShowForm]    = useState(false)
  const [form,        setForm]        = useState({ fieldKey: '', fieldLabel: '', fieldType: 'text', isRequired: false, isVisibleInTable: true, isFilterable: false })
  const [error,       setError]       = useState('')
  const [loading,     setLoading]     = useState(false)

  useEffect(() => { loadFields() }, [])

  async function loadFields() {
    try {
      setFields(await api.get(`/labs/${lab.id}/schema`))
    } catch (err) { setError(err.message) }
  }

  function resetForm() {
    setForm({ fieldKey: '', fieldLabel: '', fieldType: 'text', isRequired: false, isVisibleInTable: true, isFilterable: false })
    setEditingId(null)
    setShowForm(false)
    setError('')
  }

  async function handleSaveField(e) {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      if (editingId) {
        await api.patch(`/labs/${lab.id}/schema/${editingId}`, form)
      } else {
        // auto-generar fieldKey desde label
        const key = form.fieldKey || form.fieldLabel
          .toLowerCase()
          .replace(/\s+/g, '_')
          .replace(/[^a-z0-9_]/g, '')
        await api.post(`/labs/${lab.id}/schema`, { ...form, fieldKey: key })
      }
      await loadFields()
      resetForm()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleDeleteField(fieldId) {
    if (!window.confirm('¿Eliminar este campo? Los activos que lo tenían conservarán el valor en sus datos históricos.')) return
    try {
      await api.delete(`/labs/${lab.id}/schema/${fieldId}`)
      await loadFields()
    } catch (err) { setError(err.message) }
  }

  function startEdit(field) {
    setForm({
      fieldKey:        field.fieldKey,
      fieldLabel:      field.fieldLabel,
      fieldType:       field.fieldType,
      isRequired:      field.isRequired,
      isVisibleInTable:field.isVisibleInTable,
      isFilterable:    field.isFilterable,
    })
    setEditingId(field.id)
    setShowForm(true)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" style={{ maxWidth: 680 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2 className="modal-title">Schema — {lab.name}</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              Define los campos personalizados de este laboratorio
            </p>
          </div>
          <button className="modal-close" onClick={onClose}><X size={20} /></button>
        </div>

        <div className="modal-body">
          {error && <div className="login-error" style={{ marginBottom: '1rem' }}>{error}</div>}

          {/* Lista de campos */}
          <div style={{ marginBottom: '1.25rem' }}>
            {fields.length === 0 && (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                Este laboratorio aún no tiene campos personalizados.
              </p>
            )}
            {fields.map(f => (
              <div key={f.id} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '0.65rem 0.75rem', border: '1px solid var(--border)',
                borderRadius: '0.5rem', marginBottom: '0.5rem', background: 'var(--bg, #fafafa)'
              }}>
                <div>
                  <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{f.fieldLabel}</span>
                  <span style={{ marginLeft: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {f.fieldKey} · {f.fieldType}
                    {f.isRequired && <span style={{ color: 'var(--danger)', marginLeft: '0.3rem' }}>· requerido</span>}
                    {f.isVisibleInTable && <span style={{ color: 'var(--success)', marginLeft: '0.3rem' }}>· tabla</span>}
                    {f.isFilterable && <span style={{ color: 'var(--primary)', marginLeft: '0.3rem' }}>· filtrable</span>}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <button className="btn-icon" onClick={() => startEdit(f)}><Edit size={14} /></button>
                  <button className="btn-icon danger" style={{ color: 'var(--danger)' }} onClick={() => handleDeleteField(f.id)}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Botón agregar */}
          {!showForm && (
            <button
              className="btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.875rem' }}
              onClick={() => setShowForm(true)}
            >
              <Plus size={16} /> Agregar campo
            </button>
          )}

          {/* Formulario de campo */}
          {showForm && (
            <form onSubmit={handleSaveField} style={{
              border: '1px solid var(--border)', borderRadius: '0.75rem',
              padding: '1.25rem', background: 'var(--bg, #fafafa)', marginTop: '0.5rem'
            }}>
              <p style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '0.9rem' }}>
                {editingId ? 'Editar campo' : 'Nuevo campo'}
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group">
                  <label>Nombre del campo <span className="required">*</span></label>
                  <input
                    type="text"
                    placeholder="ej: Número de Rack"
                    value={form.fieldLabel}
                    onChange={e => setForm(p => ({ ...p, fieldLabel: e.target.value }))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Tipo de dato</label>
                  <select value={form.fieldType} onChange={e => setForm(p => ({ ...p, fieldType: e.target.value }))}>
                    {FIELD_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
                {[
                  { key: 'isRequired',       label: 'Requerido'          },
                  { key: 'isVisibleInTable',  label: 'Visible en tabla'   },
                  { key: 'isFilterable',      label: 'Filtrable'          },
                ].map(opt => (
                  <label key={opt.key} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.875rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={form[opt.key]}
                      onChange={e => setForm(p => ({ ...p, [opt.key]: e.target.checked }))}
                    />
                    {opt.label}
                  </label>
                ))}
              </div>

              <div className="form-actions" style={{ marginTop: '1rem' }}>
                <button type="submit" className="btn-primary" disabled={loading}>
                  <Save size={16} /> {loading ? 'Guardando...' : editingId ? 'Actualizar' : 'Agregar'}
                </button>
                <button type="button" className="btn-secondary" onClick={resetForm}>Cancelar</button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Sub-componente: gestión de encargados ─────────────────────────────────────
function MembersManager({ lab, encargados, onClose, onUpdate }) {
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  const asignados    = lab.members?.map(m => m.user) ?? []
  const asignadosIds = new Set(asignados.map(u => u.id))
  const disponibles  = encargados.filter(e => !asignadosIds.has(e.id))

  async function assign(userId) {
    setLoading(true); setError('')
    try {
      await api.post(`/labs/${lab.id}/members`, { userId })
      onUpdate()
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  async function remove(userId) {
    setLoading(true); setError('')
    try {
      await api.delete(`/labs/${lab.id}/members`, { body: JSON.stringify({ userId }) })
      onUpdate()
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" style={{ maxWidth: 480 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2 className="modal-title">Encargados — {lab.name}</h2>
          </div>
          <button className="modal-close" onClick={onClose}><X size={20} /></button>
        </div>
        <div className="modal-body">
          {error && <div className="login-error" style={{ marginBottom: '1rem' }}>{error}</div>}

          <p style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
            Asignados
          </p>
          {asignados.length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1rem' }}>Sin encargados asignados</p>}
          {asignados.map(u => (
            <div key={u.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0.75rem', border: '1px solid var(--border)', borderRadius: '0.5rem', marginBottom: '0.4rem' }}>
              <div>
                <p style={{ fontWeight: 600, fontSize: '0.875rem' }}>{u.name}</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{u.email}</p>
              </div>
              <button className="btn-icon danger" style={{ color: 'var(--danger)' }} onClick={() => remove(u.id)} disabled={loading}>
                <X size={14} />
              </button>
            </div>
          ))}

          {disponibles.length > 0 && (
            <>
              <p style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', margin: '1rem 0 0.5rem' }}>
                Agregar encargado
              </p>
              {disponibles.map(u => (
                <div key={u.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0.75rem', border: '1px dashed var(--border)', borderRadius: '0.5rem', marginBottom: '0.4rem' }}>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: '0.875rem' }}>{u.name}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{u.email}</p>
                  </div>
                  <button className="btn-icon" style={{ color: 'var(--primary)' }} onClick={() => assign(u.id)} disabled={loading}>
                    <Plus size={14} />
                  </button>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Componente principal ───────────────────────────────────────────────────────
export default function ManageLabs() {
  const [labs,        setLabs]        = useState([])
  const [depts,       setDepts]       = useState([])
  const [encargados,  setEncargados]  = useState([])
  const [editingLab,  setEditingLab]  = useState(null)
  const [schemaLab,   setSchemaLab]   = useState(null)
  const [membersLab,  setMembersLab]  = useState(null)

  // Form nuevo lab
  const [name,        setName]        = useState('')
  const [deptId,      setDeptId]      = useState('')
  const [success,     setSuccess]     = useState('')
  const [error,       setError]       = useState('')
  const [loading,     setLoading]     = useState(false)

  async function loadAll() {
    try {
      const [l, d, e] = await Promise.all([
        api.get('/labs'),
        api.get('/labs/departments'),
        api.get('/labs/encargados'),
      ])
      setLabs(l); setDepts(d); setEncargados(e)
    } catch (err) { setError(err.message) }
  }

  useEffect(() => { loadAll() }, [])

  async function handleCreate(e) {
    e.preventDefault()
    if (!deptId) return setError('Selecciona un departamento')
    setLoading(true); setError(''); setSuccess('')
    try {
      await api.post('/labs', { name, departmentId: parseInt(deptId) })
      setSuccess(`Laboratorio "${name}" creado.`)
      setName(''); setDeptId('')
      await loadAll()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleUpdateLab(lab, newName, newDeptId) {
    try {
      await api.patch(`/labs/${lab.id}`, {
        ...(newName  !== lab.name          && { name: newName }),
        ...(newDeptId !== lab.departmentId && { departmentId: parseInt(newDeptId) })
      })
      await loadAll()
      setEditingLab(null)
    } catch (err) { setError(err.message) }
  }

  async function handleDelete(lab) {
    if (!window.confirm(`¿Eliminar "${lab.name}"? Sus activos quedarán como baja.`)) return
    try {
      await api.delete(`/labs/${lab.id}`)
      await loadAll()
    } catch (err) { setError(err.message) }
  }

  return (
    <div className="add-user manage-labs">
      <div className="page-header">
        <h1>Gestión de Laboratorios</h1>
        <p>Crea, edita y configura laboratorios y sus campos personalizados</p>
      </div>

      {error   && <div className="login-error" style={{ marginBottom: '1rem' }}>{error}</div>}
      {success && <div className="success-msg" style={{ marginBottom: '1rem' }}>{success}</div>}

      <div className="users-crud-container">

        {/* ── Formulario nuevo lab ── */}
        <div className="card add-user-card">
          <div className="add-user-header">
            <Beaker size={32} className="add-user-icon" />
            <h2 className="card-title">Nuevo Laboratorio</h2>
          </div>

          <form className="asset-form user-form" onSubmit={handleCreate}>
            <div className="form-group full-width">
              <label>Nombre <span className="required">*</span></label>
              <input
                type="text"
                placeholder="ej: Laboratorio de IA"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
            </div>
            <div className="form-group full-width">
              <label>Departamento <span className="required">*</span></label>
              <select value={deptId} onChange={e => setDeptId(e.target.value)} required>
                <option value="" disabled>Seleccionar departamento</option>
                {depts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn-primary flex items-center justify-center gap-2" disabled={loading || !deptId}>
                <Save size={18} /> {loading ? 'Guardando...' : 'Registrar'}
              </button>
            </div>
          </form>
        </div>

        {/* ── Lista de labs ── */}
        <div className="card users-list-card">
          <h2 className="card-title" style={{ marginBottom: '1rem' }}>
            Laboratorios activos ({labs.length})
          </h2>
          <div className="users-list">
            {labs.map(lab => (
              <LabRow
                key={lab.id}
                lab={lab}
                depts={depts}
                isEditing={editingLab?.id === lab.id}
                onEditStart={() => setEditingLab(lab)}
                onEditSave={handleUpdateLab}
                onEditCancel={() => setEditingLab(null)}
                onDelete={() => handleDelete(lab)}
                onSchema={() => setSchemaLab(lab)}
                onMembers={() => setMembersLab(lab)}
              />
            ))}
            {labs.length === 0 && (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No hay laboratorios registrados.</p>
            )}
          </div>
        </div>
      </div>

      {schemaLab  && <SchemaManager  lab={schemaLab}  onClose={() => { setSchemaLab(null);  loadAll() }} />}
      {membersLab && <MembersManager lab={membersLab} encargados={encargados} onClose={() => setMembersLab(null)} onUpdate={loadAll} />}
    </div>
  )
}

// ── Fila de lab editable inline ───────────────────────────────────────────────
function LabRow({ lab, depts, isEditing, onEditStart, onEditSave, onEditCancel, onDelete, onSchema, onMembers }) {
  const [name,   setName]   = useState(lab.name)
  const [deptId, setDeptId] = useState(lab.departmentId)

  useEffect(() => { setName(lab.name); setDeptId(lab.departmentId) }, [lab])

  return (
    <div className="user-item" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '0.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div className="user-info">
          {isEditing ? (
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                style={{ padding: '0.3rem 0.6rem', border: '1px solid var(--border)', borderRadius: '0.4rem', fontSize: '0.875rem' }}
              />
              <select
                value={deptId}
                onChange={e => setDeptId(e.target.value)}
                style={{ padding: '0.3rem 0.6rem', border: '1px solid var(--border)', borderRadius: '0.4rem', fontSize: '0.875rem' }}
              >
                {depts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
          ) : (
            <>
              <p className="user-name">{lab.name}</p>
              <p className="user-email">{lab.department?.name} · {lab.members?.length ?? 0} encargado{lab.members?.length !== 1 ? 's' : ''}</p>
            </>
          )}
        </div>

        <div className="user-actions" style={{ flexShrink: 0 }}>
          {isEditing ? (
            <>
              <button className="btn-icon" style={{ color: 'var(--success)' }} onClick={() => onEditSave(lab, name, deptId)} title="Guardar">
                <Save size={15} />
              </button>
              <button className="btn-icon" onClick={onEditCancel} title="Cancelar">
                <X size={15} />
              </button>
            </>
          ) : (
            <>
              <button className="btn-icon" onClick={onEditStart} title="Editar">
                <Edit size={15} />
              </button>
              <button className="btn-icon" onClick={onMembers} title="Encargados" style={{ color: 'var(--primary)' }}>
                <Users size={15} />
              </button>
              <button className="btn-icon" onClick={onSchema} title="Campos personalizados" style={{ color: 'var(--primary)' }}>
                <Beaker size={15} />
              </button>
              <button className="btn-icon danger" onClick={onDelete} style={{ color: 'var(--danger)' }} title="Eliminar">
                <Trash2 size={15} />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}