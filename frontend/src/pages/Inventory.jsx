import { useState, useEffect, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from '@tanstack/react-table'
import { Search, Edit, Trash2, Eye, Filter, ChevronLeft, ChevronRight, X } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { api } from '../api/client'
import { useDebounce } from '../hooks/useDebounce'
import AssetDetailModal from '../components/AssetDetailModal'
import './Inventory.css'

const LIMIT = 20

const STATUS_OPTIONS  = ['activo', 'mantenimiento', 'baja', 'agotado']
const STATUS_LABELS   = { activo: 'Activo', mantenimiento: 'Mantenimiento', baja: 'Baja', agotado: 'Agotado' }
const TYPE_OPTIONS    = ['equipo', 'reactivo', 'consumible', 'material']
const TYPE_LABELS     = { equipo: 'Equipo', reactivo: 'Reactivo', consumible: 'Consumible', material: 'Material' }

// ─── Lab Selector ─────────────────────────────────────────────────────────────
function LabSelector({ labs, selectedId, onChange }) {
  if (!labs.length) return null
  return (
    <div className="lab-selector">
      {labs.map(lab => (
        <button
          key={lab.id}
          className={`lab-tab ${selectedId === lab.id ? 'active' : ''}`}
          onClick={() => onChange(lab)}
        >
          {lab.name}
        </button>
      ))}
    </div>
  )
}

// ─── Filter Panel ─────────────────────────────────────────────────────────────
function FilterPanel({ filters, schema, onChange, onReset }) {
  const hasActive = Object.values(filters).some(v => v !== '')

  return (
    <div className="filter-panel">
      <div className="filter-panel-header">
        <span>Filtros</span>
        {hasActive && (
          <button className="filter-reset" onClick={onReset}>
            <X size={14} /> Limpiar
          </button>
        )}
      </div>

      <div className="filter-grid">
        <div className="filter-item">
          <label>Status</label>
          <select value={filters.status} onChange={e => onChange('status', e.target.value)}>
            <option value="">Todos</option>
            {STATUS_OPTIONS.map(s => (
              <option key={s} value={s}>{STATUS_LABELS[s]}</option>
            ))}
          </select>
        </div>

        <div className="filter-item">
          <label>Tipo</label>
          <select value={filters.assetType} onChange={e => onChange('assetType', e.target.value)}>
            <option value="">Todos</option>
            {TYPE_OPTIONS.map(t => (
              <option key={t} value={t}>{TYPE_LABELS[t]}</option>
            ))}
          </select>
        </div>

        {/* Filtros dinámicos del schema */}
        {schema.filter(f => f.isFilterable).map(field => (
          <div className="filter-item" key={field.fieldKey}>
            <label>{field.fieldLabel}</label>
            <input
              type={field.fieldType === 'number' ? 'number' : 'text'}
              placeholder={`Filtrar por ${field.fieldLabel.toLowerCase()}`}
              value={filters[field.fieldKey] ?? ''}
              onChange={e => onChange(field.fieldKey, e.target.value)}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Inventory() {
  const { user }  = useAuth()
  const navigate  = useNavigate()

  const [labs,         setLabs]         = useState([])
  const [activeLab,    setActiveLab]    = useState(null)
  const [schema,       setSchema]       = useState([])
  const [assets,       setAssets]       = useState([])
  const [total,        setTotal]        = useState(0)
  const [page,         setPage]         = useState(1)
  const [searchInput,  setSearchInput]  = useState('')
  const [filters,      setFilters]      = useState({ status: '', assetType: '' })
  const [showFilters,  setShowFilters]  = useState(false)
  const [loading,      setLoading]      = useState(false)
  const [error,        setError]        = useState('')
  const [detailAsset,  setDetailAsset]  = useState(null)

  const search = useDebounce(searchInput, 300)

  // Carga labs
  useEffect(() => {
    api.get('/labs').then(data => {
      setLabs(data)
      if (data.length >= 1) setActiveLab(data[0])
    }).catch(err => setError(err.message))
  }, [])

  // Carga schema cuando cambia lab
  useEffect(() => {
    if (!activeLab) return
    setSchema([])
    api.get(`/labs/${activeLab.id}/schema`).then(setSchema).catch(console.error)
  }, [activeLab])

  // Carga assets
  useEffect(() => {
    if (!activeLab) return
    setLoading(true)

    const params = new URLSearchParams({ page, limit: LIMIT })
    if (search)             params.set('search',    search)
    if (filters.status)     params.set('status',    filters.status)
    if (filters.assetType)  params.set('assetType', filters.assetType)

    // filtros dinámicos del schema
    schema.filter(f => f.isFilterable).forEach(f => {
      if (filters[f.fieldKey]) params.set(f.fieldKey, filters[f.fieldKey])
    })

    api.get(`/assets/lab/${activeLab.id}?${params}`)
      .then(data => { setAssets(data.assets); setTotal(data.total) })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [activeLab, page, search, filters])

  function handleLabChange(lab) {
    setActiveLab(lab)
    setPage(1)
    setSearchInput('')
    setFilters({ status: '', assetType: '' })
    setAssets([])
  }

  function handleFilterChange(key, val) {
    setFilters(prev => ({ ...prev, [key]: val }))
    setPage(1)
  }

  function handleFilterReset() {
    setFilters({ status: '', assetType: '' })
    setPage(1)
  }

  async function handleDelete(asset) {
    const confirmed = window.confirm(
      `¿Dar de baja "${asset.name}"?\n\nEsta acción marca el activo como BAJA. No se elimina físicamente pero no podrá reactivarse.`
    )
    if (!confirmed) return
    try {
      await api.delete(`/assets/${asset.id}`)
      const params = new URLSearchParams({ page, limit: LIMIT })
      if (search) params.set('search', search)
      if (filters.status) params.set('status', filters.status)
      const data = await api.get(`/assets/lab/${activeLab.id}?${params}`)
      setAssets(data.assets)
      setTotal(data.total)
    } catch (err) {
      setError(err.message)
    }
  }

  const activeFilterCount = Object.values(filters).filter(v => v !== '').length

  // ─── Columnas dinámicas ───────────────────────────────────────────────────
  const columns = useMemo(() => {
    const base = [
      {
        id: 'name',
        header: 'Nombre',
        accessorKey: 'name',
      },
      {
        id: 'assetType',
        header: 'Tipo',
        accessorKey: 'assetType',
        cell: ({ getValue }) => TYPE_LABELS[getValue()] ?? getValue()
      },
      {
        id: 'quantity',
        header: 'Cantidad',
        accessorKey: 'quantity',
      },
      {
        id: 'status',
        header: 'Status',
        accessorKey: 'status',
        cell: ({ getValue }) => {
          const val = getValue()
          return <span className={`status-badge ${val}`}>{STATUS_LABELS[val] ?? val}</span>
        }
      },
    ]

    const dynamic = schema
      .filter(f => f.isVisibleInTable)
      .map(f => ({
        id:       f.fieldKey,
        header:   f.fieldLabel,
        accessorFn: row => row.extraFields?.[f.fieldKey],
        cell: ({ getValue }) => {
          const val = getValue()
          if (val === undefined || val === null) return <span style={{ color: 'var(--text-muted)' }}>—</span>
          if (f.fieldType === 'url')  return <a href={val} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)' }}>Ver</a>
          if (f.fieldType === 'date') return new Date(val).toLocaleDateString('es-MX')
          return String(val)
        }
      }))

    const actions = [{
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          <button
            className="btn-icon"
            title="Ver detalle"
            onClick={() => setDetailAsset(row.original)}
          >
            <Eye size={15} />
          </button>
          <button
            className="btn-icon"
            title="Editar"
            onClick={() => navigate(`/edit/${row.original.id}`)}
          >
            <Edit size={15} />
          </button>
          <button
            className="btn-icon danger"
            title="Dar de baja"
            style={{ color: 'var(--danger)', borderColor: 'var(--danger-bg)' }}
            onClick={() => handleDelete(row.original)}
          >
            <Trash2 size={15} />
          </button>
        </div>
      )
    }]

    return [...base, ...dynamic, ...actions]
  }, [schema])

  const table = useReactTable({
    data:            assets,
    columns,
    manualPagination: true,
    manualFiltering:  true,
    pageCount:        Math.ceil(total / LIMIT),
    getCoreRowModel:  getCoreRowModel(),
  })

  const totalPages = Math.ceil(total / LIMIT)

  return (
    <div className="inventory">
      <div className="page-header">
        <h1>Inventario</h1>
        <p>
          {activeLab
            ? `${activeLab.name} — ${total} activo${total !== 1 ? 's' : ''}`
            : 'Selecciona un laboratorio'}
        </p>
      </div>

      <LabSelector labs={labs} selectedId={activeLab?.id} onChange={handleLabChange} />

      <div className="card inventory-container">
        <div className="inventory-actions">
          <div className="search-wrapper">
            <Search className="search-icon" size={18} />
            <input
              type="text"
              placeholder="Buscar por nombre..."
              value={searchInput}
              onChange={e => { setSearchInput(e.target.value); setPage(1) }}
            />
            {searchInput && (
              <button
                className="search-clear"
                onClick={() => { setSearchInput(''); setPage(1) }}
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="filters">
            <button
              className={`btn-filter ${showFilters ? 'active' : ''}`}
              onClick={() => setShowFilters(p => !p)}
            >
              <Filter size={16} />
              Filtros
              {activeFilterCount > 0 && (
                <span className="filter-badge">{activeFilterCount}</span>
              )}
            </button>
          </div>
        </div>

        {showFilters && (
          <FilterPanel
            filters={filters}
            schema={schema}
            onChange={handleFilterChange}
            onReset={handleFilterReset}
          />
        )}

        {error && <p style={{ color: 'var(--danger)', padding: '1rem' }}>{error}</p>}

        <div className="table-wrapper">
          <table className="inventory-table">
            <thead>
              {table.getHeaderGroups().map(hg => (
                <tr key={hg.id}>
                  {hg.headers.map(header => (
                    <th key={header.id}>
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={columns.length} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    Cargando...
                  </td>
                </tr>
              )}
              {!loading && table.getRowModel().rows.map(row => (
                <tr key={row.id}>
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
              {!loading && assets.length === 0 && (
                <tr>
                  <td colSpan={columns.length} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    {activeLab ? 'No hay activos en este laboratorio.' : 'Selecciona un laboratorio.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="table-footer">
          <p>Mostrando {assets.length} de {total} activos</p>
          {totalPages > 1 && (
            <div className="pagination">
              <button
                className="btn-icon"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <ChevronLeft size={16} />
              </button>
              <span className="page-info">{page} / {totalPages}</span>
              <button
                className="btn-icon"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>

      <AssetDetailModal
        asset={detailAsset}
        schema={schema}
        onClose={() => setDetailAsset(null)}
      />
    </div>
  )
}