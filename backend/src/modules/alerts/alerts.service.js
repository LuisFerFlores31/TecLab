const prisma = require('../../lib/prisma')

// Assets que requieren atención: mantenimiento, agotado, o baja reciente
async function getAlerts(labIds, isCoordinator) {
  const where = {
    isActive: true,
    status:   { in: ['mantenimiento', 'agotado'] },
    ...(!isCoordinator && { labId: { in: labIds } })
  }

  const assets = await prisma.asset.findMany({
    where,
    include: {
      lab: { select: { id: true, name: true, department: { select: { name: true } } } },
      statusHistory: {
        orderBy: { changedAt: 'desc' },
        take: 1,
        include: { changedBy: { select: { name: true } } }
      }
    },
    orderBy: { updatedAt: 'desc' }
  })

  // También assets próximos a caducar (en extraFields.caducidad dentro de 30 días)
  const hoy      = new Date()
  const en30dias = new Date(hoy.getTime() + 30 * 24 * 60 * 60 * 1000)

  const todoActivos = await prisma.asset.findMany({
    where: {
      isActive: true,
      status:   'activo',
      ...(!isCoordinator && { labId: { in: labIds } })
    },
    include: {
      lab: { select: { id: true, name: true } }
    }
  })

  const proximosVencer = todoActivos.filter(a => {
    const cad = a.extraFields?.caducidad
    if (!cad) return false
    const fecha = new Date(cad)
    return !isNaN(fecha) && fecha > hoy && fecha <= en30dias
  })

  return {
    criticos:       assets,
    proximosVencer: proximosVencer,
    total:          assets.length + proximosVencer.length
  }
}

async function resolveAlert(assetId, newStatus, reason, userId) {
  const { isValidTransition } = require('../../utils/transitions')
  const asset = await prisma.asset.findFirst({ where: { id: assetId, isActive: true } })
  if (!asset) throw Object.assign(new Error('Asset no encontrado'), { status: 404 })

  if (!isValidTransition(asset.status, newStatus)) {
    throw Object.assign(new Error(`Transición no permitida: ${asset.status} → ${newStatus}`), { status: 400 })
  }

  await prisma.$transaction([
    prisma.asset.update({ where: { id: assetId }, data: { status: newStatus } }),
    prisma.statusHistory.create({
      data: { assetId, oldStatus: asset.status, newStatus, reason, changedById: userId }
    })
  ])

  await prisma.assetAuditLog.create({
    data: {
      assetId, userId, action: 'status_cambiado',
      fieldName: 'status', oldValue: asset.status, newValue: newStatus, note: reason
    }
  })

  return { ok: true }
}

module.exports = { getAlerts, resolveAlert }