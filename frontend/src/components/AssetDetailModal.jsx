import { X } from 'lucide-react'
import './AssetDetailModal.css'

export default function AssetDetailModal({ asset, schema, onClose }) {
  if (!asset) return null

  const STATUS_LABELS = {
    activo:        'Activo',
    mantenimiento: 'Mantenimiento',
    baja:          'Baja',
    agotado:       'Agotado'
  }

  const TYPE_LABELS = {
    equipo:     'Equipo',
    reactivo:   'Reactivo',
    consumible: 'Consumible',
    material:   'Material'
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>

        <div className="modal-header">
          <div>
            <h2 className="modal-title">{asset.name}</h2>
            <span className={`status-badge ${asset.status}`}>
              {STATUS_LABELS[asset.status] ?? asset.status}
            </span>
          </div>
          <button className="modal-close" onClick={onClose}><X size={20} /></button>
        </div>

        {asset.imageUrl && (
          <div className="modal-image">
            <img src={`http://localhost:3001${asset.imageUrl}`} alt={asset.name} />
          </div>
        )}

        <div className="modal-body">
          {/* Campos base */}
          <div className="modal-section">
            <h3>General</h3>
            <div className="modal-grid">
              <div className="modal-field">
                <span className="field-label">Tipo</span>
                <span className="field-value">{TYPE_LABELS[asset.assetType] ?? asset.assetType}</span>
              </div>
              <div className="modal-field">
                <span className="field-label">Cantidad</span>
                <span className="field-value">{asset.quantity}</span>
              </div>
              <div className="modal-field">
                <span className="field-label">Creado</span>
                <span className="field-value">
                  {new Date(asset.createdAt).toLocaleDateString('es-MX')}
                </span>
              </div>
              <div className="modal-field">
                <span className="field-label">Actualizado</span>
                <span className="field-value">
                  {new Date(asset.updatedAt).toLocaleDateString('es-MX')}
                </span>
              </div>
            </div>
          </div>

          {/* Campos dinámicos del lab */}
          {schema.length > 0 && (
            <div className="modal-section">
              <h3>Detalles del laboratorio</h3>
              <div className="modal-grid">
                {schema.map(field => {
                  const val = asset.extraFields?.[field.fieldKey]
                  if (val === undefined || val === null || val === '') return null
                  return (
                    <div className="modal-field" key={field.fieldKey}>
                      <span className="field-label">{field.fieldLabel}</span>
                      <span className="field-value">
                        {field.fieldType === 'url'
                          ? <a href={val} target="_blank" rel="noreferrer">Ver documento</a>
                          : field.fieldType === 'date'
                          ? new Date(val).toLocaleDateString('es-MX')
                          : String(val)
                        }
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}