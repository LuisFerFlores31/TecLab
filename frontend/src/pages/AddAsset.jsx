import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Save, Upload, ArrowLeft } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { api } from '../api/client'
import './AddAsset.css'

const ASSET_TYPES = [
  { value: 'equipo',     label: 'Equipo'     },
  { value: 'reactivo',   label: 'Reactivo'   },
  { value: 'consumible', label: 'Consumible' },
  { value: 'material',   label: 'Material'   },
]

const STATUS_OPTIONS = [
  { value: 'activo',        label: 'Activo'        },
  { value: 'mantenimiento', label: 'Mantenimiento' },
  { value: 'agotado',       label: 'Agotado'       },
]

export default function AddAsset() {
  const { id }    = useParams()
  const navigate  = useNavigate()
  const { user }  = useAuth()
  const isEditing = Boolean(id)

  // Labs disponibles para el usuario
  const [labs,        setLabs]        = useState([])
  const [selectedLab, setSelectedLab] = useState(null)
  const [schema,      setSchema]      = useState([])

  // Campos base
  const [name,       setName]       = useState('')
  const [assetType,  setAssetType]  = useState('equipo')
  const [quantity,   setQuantity]   = useState(0)
  const [status,     setStatus]     = useState('activo')

  // Campos dinámicos — un objeto plano { fieldKey: value }
  const [extraFields, setExtraFields] = useState({})

  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')
  const [success,  setSuccess]  = useState('')

  // Carga labs del usuario
  useEffect(() => {
    api.get('/labs').then(data => {
      setLabs(data)
      if (!isEditing && data.length > 0) setSelectedLab(data[0])
    }).catch(err => setError(err.message))
  }, [])

  // Si editando, carga el asset y setea el lab
  useEffect(() => {
    if (!isEditing) return
    api.get(`/assets/${id}`).then(asset => {
      setName(asset.name)
      setAssetType(asset.assetType)
      setQuantity(asset.quantity)
      setStatus(asset.status)
      setExtraFields(asset.extraFields ?? {})
      // busca el lab en la lista
      setSelectedLab(prev => prev ?? { id: asset.labId })
    }).catch(() => navigate('/inventory'))
  }, [id])

  // Carga schema cuando cambia el lab
  useEffect(() => {
    if (!selectedLab) return
    api.get(`/labs/${selectedLab.id}/schema`).then(setSchema).catch(console.error)
  }, [selectedLab])

  function handleExtraChange(key, value) {
    setExtraFields(prev => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(''); setSuccess(''); setLoading(true)

    const body = { name, assetType, quantity: Number(quantity), status, extraFields }

    try {
      if (isEditing) {
        await api.patch(`/assets/${id}`, body)
        setSuccess('Activo actualizado.')
        setTimeout(() => navigate('/inventory'), 800)
      } else {
        await api.post(`/assets/lab/${selectedLab.id}`, body)
        setSuccess('Activo creado.')
        setTimeout(() => navigate('/inventory'), 800)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // ─── Render de campo dinámico según su tipo ────────────────────────────────
  function renderField(field) {
    const val = extraFields[field.fieldKey] ?? ''

    const commonProps = {
      id:       field.fieldKey,
      value:    val,
      required: field.isRequired,
      onChange: e => handleExtraChange(field.fieldKey, e.target.value),
    }

    switch (field.fieldType) {
      case 'number':
        return (
          <input
            {...commonProps}
            type="number"
            onChange={e => handleExtraChange(field.fieldKey, Number(e.target.value))}
          />
        )
      case 'date':
        return <input {...commonProps} type="date" />
      case 'url':
        return <input {...commonProps} type="url" placeholder="https://..." />
      case 'select':
        return (
          <select {...commonProps}>
            <option value="">Seleccionar</option>
            {(field.selectOptions ?? []).map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        )
      case 'text':
      default:
        return <input {...commonProps} type="text" />
    }
  }

  return (
    <div className="add-asset">
      <div className="page-header">
        <button className="btn-back" onClick={() => navigate('/inventory')}>
          <ArrowLeft size={18} /> Volver
        </button>
        <h1>{isEditing ? 'Editar Activo' : 'Nuevo Activo'}</h1>
        <p>{isEditing ? 'Modifica los datos del activo' : 'Registra un nuevo activo en el inventario'}</p>
      </div>

      <div className="add-asset-content">

        {/* ── Selector de lab (solo al crear) ── */}
        {!isEditing && labs.length > 1 && (
          <div className="card" style={{ marginBottom: '1.25rem', padding: '1.25rem' }}>
            <p className="card-title" style={{ marginBottom: '0.75rem' }}>Laboratorio</p>
            <div className="lab-selector">
              {labs.map(lab => (
                <button
                  key={lab.id}
                  type="button"
                  className={`lab-tab ${selectedLab?.id === lab.id ? 'active' : ''}`}
                  onClick={() => { setSelectedLab(lab); setExtraFields({}) }}
                >
                  {lab.name}
                </button>
              ))}
            </div>
          </div>
        )}

        <form className="asset-form-grid" onSubmit={handleSubmit}>

          {/* ── Campos base ── */}
          <div className="card details-card">
            <p className="card-title">Datos generales</p>

            {error   && <div className="login-error" style={{ marginBottom: '1rem' }}>{error}</div>}
            {success && <div className="success-msg" style={{ marginBottom: '1rem' }}>{success}</div>}

            <div className="form-group full-width">
              <label>Nombre <span className="required">*</span></label>
              <input
                type="text"
                placeholder="Nombre del activo"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-split">
              <div className="form-group">
                <label>Tipo <span className="required">*</span></label>
                <select value={assetType} onChange={e => setAssetType(e.target.value)} required>
                  {ASSET_TYPES.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Cantidad <span className="required">*</span></label>
                <input
                  type="number"
                  min="0"
                  value={quantity}
                  onChange={e => setQuantity(e.target.value)}
                  required
                />
              </div>
            </div>

            {isEditing && (
              <div className="form-group">
                <label>Status</label>
                <select value={status} onChange={e => setStatus(e.target.value)}>
                  {STATUS_OPTIONS.map(s => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* ── Campos dinámicos del lab ── */}
          {schema.length > 0 && (
            <div className="card details-card">
              <p className="card-title">
                Detalles — {selectedLab?.name ?? 'Laboratorio'}
              </p>
              <div className="dynamic-fields">
                {schema.map(field => (
                  <div
                    className="form-group"
                    key={field.fieldKey}
                    style={{ gridColumn: field.fieldType === 'text' && field.fieldKey.includes('observ') ? '1 / -1' : undefined }}
                  >
                    <label>
                      {field.fieldLabel}
                      {field.isRequired && <span className="required"> *</span>}
                    </label>
                    {renderField(field)}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Acciones ── */}
          <div className="form-actions" style={{ gridColumn: '1 / -1' }}>
            <button type="submit" className="btn-primary flex items-center justify-center gap-2" disabled={loading}>
              <Save size={18} />
              {loading ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Registrar activo'}
            </button>
            <button type="button" className="btn-secondary" onClick={() => navigate('/inventory')}>
              Cancelar
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}