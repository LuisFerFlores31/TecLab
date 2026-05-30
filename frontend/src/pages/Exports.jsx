import { useEffect, useMemo, useState } from 'react'
import { AlertTriangle, BarChart3, Download, FileText, RefreshCw, ShieldCheck, SlidersHorizontal } from 'lucide-react'
import { api } from '../api/client'
import './Exports.css'

const API_BASE = `${import.meta.env.VITE_API_URL}/api`

const STATUS_LABELS = {
  activo: 'Activo',
  mantenimiento: 'Mantenimiento',
  baja: 'Baja',
  agotado: 'Agotado',
}

function escapeCsv(value) {
  const text = value === null || value === undefined ? '' : String(value)
  return `"${text.replace(/"/g, '""')}"`
}

function downloadFile(filename, content, mimeType = 'text/csv;charset=utf-8;') {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

function parseContentDisposition(disposition) {
  if (!disposition) return null
  const match = disposition.match(/filename\*?=(?:UTF-8''|"?)([^";]+)/i)
  return match ? decodeURIComponent(match[1]) : null
}

async function downloadServerFile({ jobId, format, fileBaseName }) {
  const token = localStorage.getItem('teclab_token')
  const res = await fetch(`${API_BASE}/exports/${jobId}/download`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  })

  if (!res.ok) {
    const payload = await res.json().catch(() => ({}))
    throw new Error(payload.error || 'No se pudo descargar el archivo')
  }

  const blob = await res.blob()
  const fallbackName = `export-${fileBaseName || 'laboratorio'}-${jobId}.${format || 'csv'}`
  const headerName = parseContentDisposition(res.headers.get('content-disposition'))
  const filename = headerName || fallbackName

  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

function slugify(value) {
  return String(value ?? 'laboratorio')
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
}

export default function Exports() {
  const [labs, setLabs] = useState([])
  const [activeLab, setActiveLab] = useState(null)
  const [assets, setAssets] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingAssets, setLoadingAssets] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/labs')
      .then(data => {
        setLabs(data)
        if (data.length > 0) setActiveLab(data[0])
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!activeLab) return

    setLoadingAssets(true)
    api.get(`/assets/lab/${activeLab.id}?page=1&limit=1000`)
      .then(data => setAssets(data.assets ?? []))
      .catch(err => setError(err.message))
      .finally(() => setLoadingAssets(false))
  }, [activeLab])

  const summary = useMemo(() => {
    const total = assets.length
    const byStatus = assets.reduce((acc, asset) => {
      acc[asset.status] = (acc[asset.status] ?? 0) + 1
      return acc
    }, {})

    const totalQuantity = assets.reduce((acc, asset) => acc + (Number(asset.quantity) || 0), 0)

    return {
      total,
      totalQuantity,
      active: byStatus.activo ?? 0,
      maintenance: byStatus.mantenimiento ?? 0,
      baja: byStatus.baja ?? 0,
    }
  }, [assets])

  const fileBaseName = slugify(activeLab?.name)

  const exportRows = useMemo(() => {
    return assets.map(asset => [
      asset.name,
      asset.assetType,
      asset.quantity,
      STATUS_LABELS[asset.status] ?? asset.status,
      asset.lab?.name ?? activeLab?.name ?? '',
      asset.createdAt,
      asset.updatedAt,
    ])
  }, [assets, activeLab])

  function handleExportCsv() {
    const header = ['Nombre', 'Tipo', 'Cantidad', 'Estado', 'Laboratorio', 'Creado', 'Actualizado']
    const csv = [header, ...exportRows]
      .map(row => row.map(escapeCsv).join(','))
      .join('\n')

    downloadFile(`inventario-${fileBaseName}.csv`, csv)
  }

  function handleExportJson() {
    const payload = {
      generatedAt: new Date().toISOString(),
      lab: activeLab ? { id: activeLab.id, name: activeLab.name } : null,
      summary,
      assets,
    }

    downloadFile(`inventario-${fileBaseName}.json`, JSON.stringify(payload, null, 2), 'application/json;charset=utf-8;')
  }

  const suggestedActions = [
    {
      icon: FileText,
      title: 'CSV de inventario',
      description: 'Compatible con Excel, Sheets y auditorías internas.',
      onClick: handleExportCsv,
      primary: true,
    },
    {
      icon: BarChart3,
      title: 'Resumen JSON',
      description: 'Útil para respaldos e integraciones.',
      onClick: handleExportJson,
    },
    {
      icon: FileText,
      title: 'Exportar desde servidor',
      description: 'Encola una exportación en el backend y te permite descargarla cuando esté lista.',
      onClick: () => handleExportServer('csv'),
    },
  ]

  const [serverStatus, setServerStatus] = useState(null)
  const [serverProgress, setServerProgress] = useState(null)
  const [showToast, setShowToast] = useState(false)

  useEffect(() => {
    if (!serverStatus) {
      setShowToast(false)
      return
    }

    setShowToast(true)

    if (serverStatus === 'completed' || serverStatus === 'failed') {
      const timer = setTimeout(() => {
        setShowToast(false)
        if (serverStatus === 'completed') {
          setServerStatus(null)
          setServerProgress(null)
        }
      }, 2500)

      return () => clearTimeout(timer)
    }
  }, [serverStatus])

  const toastMessage = useMemo(() => {
    const percent = typeof serverProgress === 'number' ? ` ${serverProgress}%` : ''
    switch (serverStatus) {
      case 'enqueuing':
        return 'Encolando exportacion...'
      case 'pending':
        return `Exportacion en cola...${percent}`
      case 'processing':
        return `Generando archivo...${percent}`
      case 'downloading':
        return `Descargando archivo...${percent}`
      case 'completed':
        return 'Descarga iniciada.'
      case 'failed':
        return 'La exportacion fallo.'
      default:
        return ''
    }
  }, [serverStatus, serverProgress])

  async function handleExportServer(format = 'csv') {
    if (!activeLab) return alert('Selecciona un laboratorio')

    try {
      setServerStatus('enqueuing')
      setServerProgress(0)
      const data = await api.post('/exports', { labId: activeLab.id, format })
      const jobId = data.jobId
      setServerStatus('pending')

      const poll = setInterval(async () => {
        try {
          const statusResp = await api.get(`/exports/${jobId}/status`)
          const status = statusResp.job.status
          setServerStatus(status)
          setServerProgress(statusResp.job.progress ?? 0)
          if (status === 'done') {
            clearInterval(poll)
            setServerStatus('downloading')
            await downloadServerFile({
              jobId,
              format: statusResp.job.format || format,
              fileBaseName,
            })
            setServerProgress(100)
            setServerStatus('completed')
          }
          if (status === 'failed') {
            clearInterval(poll)
          }
        } catch (err) {
          console.error(err)
        }
      }, 2000)
    } catch (err) {
      console.error(err)
      alert('Error encolando exportación: ' + err.message)
      setServerStatus(null)
    }
  }

  return (
    <div className="exports-page">
      {showToast && serverStatus && (
        <div className={`export-toast ${serverStatus}`}>
          {serverStatus === 'failed' ? <AlertTriangle size={16} /> : <Download size={16} />}
          <span>{toastMessage}</span>
          {serverStatus !== 'completed' && serverStatus !== 'failed' && (
            <div
              className="export-toast__progress"
              aria-hidden="true"
              style={{ width: `${Math.min(100, Math.max(0, serverProgress ?? 0))}%` }}
            />
          )}
        </div>
      )}
      <div className="page-header exports-header">
        <div>
          <h1>Exportaciones</h1>
          <p>Genera archivos de inventario sin salir del panel de administración.</p>
        </div>

        <button className="refresh-button" onClick={() => window.location.reload()}>
          <RefreshCw size={16} />
          Recargar datos
        </button>
      </div>

      <div className="exports-grid">
        <section className="card exports-panel">
          <div className="panel-heading">
            <div>
              <h3>Selecciona el laboratorio</h3>
              <p>La exportación se construye a partir del inventario cargado.</p>
            </div>
            <SlidersHorizontal size={18} className="panel-icon" />
          </div>

          <div className="lab-list">
            {labs.map(lab => (
              <button
                key={lab.id}
                className={`lab-pill ${activeLab?.id === lab.id ? 'active' : ''}`}
                onClick={() => setActiveLab(lab)}
              >
                {lab.name}
              </button>
            ))}

            {!loading && labs.length === 0 && (
              <p className="empty-state">No hay laboratorios registrados para exportar.</p>
            )}
          </div>

          <div className="export-actions">
            {suggestedActions.map(action => {
              const Icon = action.icon
              return (
                <button
                  key={action.title}
                  className={`export-action ${action.primary ? 'primary' : ''}`}
                  onClick={action.onClick}
                  disabled={loadingAssets || !activeLab}
                >
                  <Icon size={18} />
                  <div>
                    <strong>{action.title}</strong>
                    <span>{action.description}</span>
                  </div>
                </button>
              )
            })}
          </div>
        </section>

        <aside className="exports-sidebar card">
          <div className="panel-heading">
            <div>
              <h3>Resumen rápido</h3>
              <p>Datos actuales del laboratorio activo.</p>
            </div>
            <BarChart3 size={18} className="panel-icon" />
          </div>

          <div className="summary-grid">

            <div className="exports-stat">
            <strong>{loading ? '...' : labs.length}</strong>
            <span>Laboratorios</span>
          </div>
          <div className="exports-stat">
            <strong>{loadingAssets ? '...' : summary.totalQuantity}</strong>
            <span>Unidades</span>
          </div>

            <div className="summary-item">
              <span>Total</span>
              <strong>{loadingAssets ? '...' : summary.total}</strong>
            </div>
            <div className="summary-item success">
              <span>Activos</span>
              <strong>{loadingAssets ? '...' : summary.active}</strong>
            </div>
            <div className="summary-item warning">
              <span>Mantenimiento</span>
              <strong>{loadingAssets ? '...' : summary.maintenance}</strong>
            </div>
            <div className="summary-item danger">
              <span>Baja</span>
              <strong>{loadingAssets ? '...' : summary.baja}</strong>
            </div>
            
          </div>

          <div className="export-note">
            <ShieldCheck size={16} />
            <p>Las exportaciones se generan localmente en el navegador.</p>
          </div>


          {error && (
            <div className="export-error">
              <AlertTriangle size={16} />
              <p>{error}</p>
            </div>
          )}
        </aside>
      </div>

      <section className="card exports-table-card">
        <div className="panel-heading">
          <div>
            <h3>Campos incluidos</h3>
            <p>Vista previa de la información que viaja en la exportación.</p>
          </div>
          <FileText size={18} className="panel-icon" />
        </div>

        <div className="fields-grid">
          {['Nombre', 'Tipo', 'Cantidad', 'Estado', 'Laboratorio', 'Creado', 'Actualizado'].map(field => (
            <div key={field} className="field-chip">{field}</div>
          ))}
        </div>

        <div className="preview-list">
          {!loadingAssets && assets.slice(0, 5).map(asset => (
            <div key={asset.id} className="preview-row">
              <div>
                <strong>{asset.name}</strong>
                <p>{STATUS_LABELS[asset.status] ?? asset.status}</p>
              </div>
              <span>{asset.quantity} unidades</span>
            </div>
          ))}

          {!loadingAssets && assets.length === 0 && (
            <p className="empty-state">No hay activos cargados en este laboratorio.</p>
          )}
        </div>
      </section>
    </div>
  )
}