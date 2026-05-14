import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Save, ArrowLeft, Upload, X } from 'lucide-react'
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
  const fileRef   = useRef(null)

  const [labs,        setLabs]        = useState([])
  const [selectedLab, setSelectedLab] = useState(null)
  const [schema,      setSchema]      = useState([])

  // Campos base
  const [name,        setName]        = useState('')
  const [assetType,   setAssetType]   = useState('equipo')
  const [quantity,    setQuantity]    = useState(0)
  const [unit,        setUnit]        = useState('')
  const [status,      setStatus]      = useState('activo')
  const [extraFields, setExtraFields] = useState({})

  // Imagen
  const [imageFile,    setImageFile]    = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [currentImage, setCurrentImage] = useState(null)

  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')
  const [success, setSuccess] = useState('')

  // Carga labs
  useEffect(() => {
    api.get('/labs').then(data => {
      setLabs(data)
      if (!isEditing && data.length > 0) setSelectedLab(data[0])
    }).catch(err => setError(err.message))
  }, [])

  // Si editando, carga el asset
  useEffect(() => {
    if (!isEditing) return
    api.get(`/assets/${id}`).then(asset => {
      setName(asset.name)
      setAssetType(asset.assetType)
      setQuantity(asset.quantity)
      setUnit(asset.unit ?? '')
      setStatus(asset.status)
      setExtraFields(asset.extraFields ?? {})
      if (asset.imageUrl) setCurrentImage(`http://localhost:3001${asset.imageUrl}`)
      // Busca el lab en la lista y lo setea
      setLabs(prev => {
        const found = prev.find(l => l.id === asset.labId)
        if (found) setSelectedLab(found)
        return prev
      })
      // fallback si labs aún no cargó
      if (!selectedLab) setSelectedLab({ id: asset.labId, name: '' })
    }).catch(() => navigate('/inventory'))
  }, [id])

  // Cuando labs carga y estamos editando, busca el lab del asset
  useEffect(() => {
    if (!isEditing || !labs.length) return
    api.get(`/assets/${id}`).then(asset => {
      const found = labs.find(l => l.id === asset.labId)
      if (found) setSelectedLab(found)
    }).catch(() => {})
  }, [labs])

  // Carga schema del lab seleccionado
  useEffect(() => {
    if (!selectedLab) return
    api.get(`/labs/${selectedLab.id}/schema`).then(setSchema).catch(console.error)
  }, [selectedLab])

  function handleImageChange(e) {
    const file = e.target.files[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  function handleImageDrop(e) {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  function clearImage() {
    setImageFile(null)
    setImagePreview(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  function handleExtraChange(key, value) {
    setExtraFields(prev => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(''); setSuccess(''); setLoading(true)

    try {
      let asset

      if (isEditing) {
        asset = await api.patch(`/assets/${id}`, {
          name, assetType, quantity: Number(quantity), unit, status, extraFields
        })

        // Cambio de status separado si cambió
        const original = await api.get(`/assets/${id}`)
        if (original.status !== status) {
          await api.patch(`/assets/${id}/status`, { newStatus: status, reason: 'Actualizado desde formulario' })
        }
      } else {
        asset = await api.post(`/assets/lab/${selectedLab.id}`, {
          name, assetType, quantity: Number(quantity), unit, extraFields
        })
      }

      // Sube imagen si hay una nueva
      if (imageFile && asset?.id) {
        const formData = new FormData()
        formData.append('image', imageFile)
        await fetch(`http://localhost:3001/api/assets/${asset.id}/image`, {
          method:  'POST',
          headers: { Authorization: `Bearer ${localStorage.getItem('teclab_token')}` },
          body:    formData
        })
      }

      setSuccess(isEditing ? 'Activo actualizado.' : 'Activo registrado.')
      setTimeout(() => navigate('/inventory'), 700)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function renderField(field) {
    const val = extraFields[field.fieldKey] ?? ''
    const common = {
      id:       field.fieldKey,
      value:    val,
      required: field.isRequired,
      onChange: e => handleExtraChange(field.fieldKey, e.target.value),
    }
    switch (field.fieldType) {
      case 'number': return <input {...common} type="number" onChange={e => handleExtraChange(field.fieldKey, Number(e.target.value))} />
      case 'date':   return <input {...common} type="date" />
      case 'url':    return <input {...common} type="url" placeholder="https://..." />
      case 'select': return (
        <select {...common}>
          <option value="">Seleccionar</option>
          {(field.selectOptions ?? []).map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      )
      default:       return <input {...common} type="text" />
    }
  }

  const previewSrc = imagePreview ?? currentImage

  return (
    <div className="add-asset">
      <div className="page-header">
        <button className="btn-back" onClick={() => navigate('/inventory')}>
          <ArrowLeft size={18} /> Volver
        </button>
        <h1>{isEditing ? 'Editar Activo' : 'Nuevo Activo'}</h1>
        <p>{isEditing ? 'Modifica los datos del activo' : 'Registra un nuevo activo en el inventario'}</p>
      </div>

      {/* Selector de lab — solo al crear y si hay más de 1 */}
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

      <form className="add-asset-content" onSubmit={handleSubmit}>

        {/* ── Imagen ── */}
        <div className="card image-upload-card">
          <p className="card-title">Imagen del activo</p>

          <div
            className="upload-dropzone"
            onDragOver={e => e.preventDefault()}
            onDrop={handleImageDrop}
            onClick={() => fileRef.current?.click()}
          >
            {previewSrc ? (
              <div className="image-preview-wrapper">
                <img src={previewSrc} alt="preview" className="image-preview" />
                <button
                  type="button"
                  className="image-clear"
                  onClick={e => { e.stopPropagation(); clearImage() }}
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <>
                <Upload size={32} className="upload-icon" />
                <p>Arrastra una imagen o haz clic</p>
                <span className="upload-hint">JPG, PNG, WEBP, GIF — máx 5MB</span>
              </>
            )}
          </div>

          <input
            ref={fileRef}
            type="file"
            accept=".jpg,.jpeg,.png,.webp,.gif"
            style={{ display: 'none' }}
            onChange={handleImageChange}
          />
        </div>

        {/* ── Datos generales ── */}
        <div className="card details-card">
          <p className="card-title">Datos generales</p>

          {error   && <div className="login-error"   style={{ marginBottom: '1rem' }}>{error}</div>}
          {success && <div className="success-msg"   style={{ marginBottom: '1rem' }}>{success}</div>}

          <div className="form-group full-width">
            <label>Nombre <span className="required">*</span></label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="Nombre del activo" />
          </div>

          <div className="form-split">
            <div className="form-group">
              <label>Tipo <span className="required">*</span></label>
              <select value={assetType} onChange={e => setAssetType(e.target.value)} required>
                {ASSET_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Cantidad <span className="required">*</span></label>
              <input type="number" min="0" value={quantity} onChange={e => setQuantity(e.target.value)} required />
            </div>
          </div>

          <div className="form-group">
            <label>Unidad de medida</label>
            <input
              type="text"
              placeholder="piezas, ml, g, kg, metros..."
              value={unit}
              onChange={e => setUnit(e.target.value)}
            />
          </div>

          {isEditing && (
            <div className="form-group">
              <label>Status</label>
              <select value={status} onChange={e => setStatus(e.target.value)}>
                {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
          )}
        </div>

        {/* ── Campos dinámicos ── */}
        {schema.length > 0 && (
          <div className="card details-card" style={{ gridColumn: '1 / -1' }}>
            <p className="card-title">Detalles — {selectedLab?.name}</p>
            <div className="dynamic-fields">
              {schema.map(field => (
                <div className="form-group" key={field.fieldKey}>
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
  )
}