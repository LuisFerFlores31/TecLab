const prisma = require('../../lib/prisma')

async function getSummary(labIds, isCoordinator) {
  const labFilter = isCoordinator ? {} : { labId: { in: labIds } }

  const [
    totalActivos,
    porStatus,
    porTipo,
    movimientosRecientes,
    labsConMasActivos
  ] = await Promise.all([
    prisma.asset.count({ where: { isActive: true, ...labFilter } }),

    prisma.asset.groupBy({
      by:    ['status'],
      where: { isActive: true, ...labFilter },
      _count: { id: true }
    }),

    prisma.asset.groupBy({
      by:    ['assetType'],
      where: { isActive: true, ...labFilter },
      _count: { id: true }
    }),

    prisma.assetAuditLog.findMany({
      where:   { asset: { isActive: true, ...labFilter } },
      include: {
        user:  { select: { name: true } },
        asset: { select: { name: true, lab: { select: { name: true } } } }
      },
      orderBy: { createdAt: 'desc' },
      take:    20
    }),

    isCoordinator
      ? prisma.asset.groupBy({
          by:    ['labId'],
          where: { isActive: true },
          _count: { id: true },
          orderBy: { _count: { id: 'desc' } },
          take: 5
        })
      : Promise.resolve([])
  ])

  return { totalActivos, porStatus, porTipo, movimientosRecientes, labsConMasActivos }
}

module.exports = { getSummary }