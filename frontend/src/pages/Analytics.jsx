import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { api } from '../api/client'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts'
import {
  Package, AlertTriangle, Activity, TrendingUp,
  User, Clock, CheckCircle, XCircle, Edit3, Image
} from 'lucide-react'
import './Analytics.css'

const STATUS_COLORS = {
  activo:        '#22c55e',
  mantenimiento: '#f59e0b',
  baja:          '#ef4444',
  agotado:       '#94a3b8',
}

const TYPE_COLORS  = ['#3b82f6', '#8b5cf6', '#f59e0b', '#10b981']

const ACTION_ICONS = {
  creado:            <CheckCircle size={14} />,
  editado:           <Edit3      size={14} />,
  status_cambiado:   <Activity   size={14} />,
  dado_de_baja:      <XCircle    size={14} />,
  imagen_actualizada:<Image      size={14} />,
}

const ACTION_LABELS = {
  creado:            'Creado',
  editado:           'Editado',
  status_cambiado:   'Status cambiado',
  dado_de_baja:      'Dado de baja',
  imagen_actualizada:'Imagen actualizada',
}

const ACTION_COLORS = {
  creado:            'var(--success)',
  editado:           'var(--primary)',
  status_cambiado:   'var(--warning)',
  dado_de_baja:      'var(--danger)',
  imagen_actualizada:'var(--text-muted)',
}

// ── KPI Card ──────────────────────────────────────────────────────────────────
function KpiCard({ icon, label, value, sub, color }) {
  return (
    <div className="analytics-kpi">
      <div className="kpi-icon-wrap" style={{ background: `${color}18`, color }}>
        {icon}
      </div>
      <div>
        <p className="kpi-label">{label}</p>
        <h3 className="kpi-value">{value}</h3>
        {sub && <p className="kpi-sub">{sub}</p>}
      </div>
    </div>
  )
}

// ── Tooltip custom ────────────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="chart-tooltip">
      <p className="tooltip-label">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.fill ?? p.color }}>
          {p.name}: <strong>{p.value}</strong>
        </p>
      ))}
    </div>
  )
}

// ── Actividad reciente ─────────────────────────────────────────────────────────
function ActivityFeed({ items }) {
  if (!items.length) return (
    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', padding: '1rem 0' }}>
      Sin actividad registrada.
    </p>
  )

  return (
    <div className="activity-feed">
      {items.map(log => (
        <div key={log.id} className="feed-item">
          <div
            className="feed-icon"
            style={{ color: ACTION_COLORS[log.action], background: `${ACTION_COLORS[log.action]}18` }}
          >
            {ACTION_ICONS[log.action] ?? <Activity size={14} />}
          </div>
          <div className="feed-body">
            <p className="feed-title">
              <strong>{log.asset?.name ?? 'Asset'}</strong>
              <span className="feed-action"> — {ACTION_LABELS[log.action] ?? log.action}</span>
            </p>
            <p className="feed-meta">
              {log.user?.name ?? '—'}
              {log.asset?.lab?.name && <span> · {log.asset.lab.name}</span>}
              {log.fieldName && log.oldValue !== undefined && log.newValue !== undefined && (
                <span className="feed-diff">
                  {' '}· {log.fieldName}: <s>{log.oldValue}</s> → <strong>{log.newValue}</strong>
                </span>
              )}
              {log.note && !log.fieldName && (
                <span> · {log.note}</span>
              )}
            </p>
          </div>
          <span className="feed-time">
            {new Date(log.createdAt).toLocaleDateString('es-MX', {
              day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
            })}
          </span>
        </div>
      ))}
    </div>
  )
}

// ── Componente principal ───────────────────────────────────────────────────────
export default function Analytics() {
  const { user }  = useAuth()
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')

  useEffect(() => {
    api.get('/analytics/summary')
      .then(setData)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="analytics">
      <div className="analytics-loading">
        <Activity size={32} className="spin" />
        <p>Cargando analytics...</p>
      </div>
    </div>
  )

  if (error) return (
    <div className="analytics">
      <p style={{ color: 'var(--danger)', padding: '2rem' }}>{error}</p>
    </div>
  )

  // Formatea datos para recharts
  const statusData = (data.porStatus ?? []).map(s => ({
    name:  s.status.charAt(0).toUpperCase() + s.status.slice(1),
    value: s._count.id,
    fill:  STATUS_COLORS[s.status] ?? '#94a3b8'
  }))

  const typeData = (data.porTipo ?? []).map((t, i) => ({
    name:  t.assetType.charAt(0).toUpperCase() + t.assetType.slice(1),
    value: t._count.id,
    fill:  TYPE_COLORS[i % TYPE_COLORS.length]
  }))

  const activos        = statusData.find(s => s.name === 'Activo')?.value      ?? 0
  const enMantenimiento= statusData.find(s => s.name === 'Mantenimiento')?.value ?? 0
  const dadosDeBaja    = statusData.find(s => s.name === 'Baja')?.value         ?? 0

  return (
    <div className="analytics">
      <div className="page-header">
        <h1>Analytics</h1>
        <p>
          {user?.role === 'coordinador'
            ? 'Vista global del sistema'
            : 'Historial y métricas de tus laboratorios'}
        </p>
      </div>

      {/* ── KPIs ── */}
      <div className="analytics-kpis">
        <KpiCard
          icon={<Package size={22} />}
          label="Total activos"
          value={data.totalActivos}
          sub="En el sistema"
          color="#3b82f6"
        />
        <KpiCard
          icon={<CheckCircle size={22} />}
          label="Activos"
          value={activos}
          sub={`${data.totalActivos ? Math.round((activos / data.totalActivos) * 100) : 0}% del total`}
          color="#22c55e"
        />
        <KpiCard
          icon={<AlertTriangle size={22} />}
          label="En mantenimiento"
          value={enMantenimiento}
          color="#f59e0b"
        />
        <KpiCard
          icon={<XCircle size={22} />}
          label="Dados de baja"
          value={dadosDeBaja}
          color="#ef4444"
        />
      </div>

      {/* ── Gráficas ── */}
      <div className="analytics-charts">

        {/* Status */}
        <div className="card chart-card">
          <h3 className="chart-title">Distribución por status</h3>
          {statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {statusData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  formatter={(value) => (
                    <span style={{ fontSize: '0.8rem', color: 'var(--text)' }}>{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="chart-empty">Sin datos</p>
          )}
        </div>

        {/* Tipo */}
        <div className="card chart-card">
          <h3 className="chart-title">Distribución por tipo</h3>
          {typeData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={typeData} barSize={32}>
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12, fill: 'var(--text-muted)' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" name="Activos" radius={[6, 6, 0, 0]}>
                  {typeData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="chart-empty">Sin datos</p>
          )}
        </div>
      </div>

      {/* ── Actividad reciente ── */}
      <div className="card" style={{ marginTop: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <h3 className="chart-title" style={{ marginBottom: 0 }}>Actividad reciente</h3>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Últimas {data.movimientosRecientes?.length ?? 0} acciones
          </span>
        </div>
        <ActivityFeed items={data.movimientosRecientes ?? []} />
      </div>
    </div>
  )
}
