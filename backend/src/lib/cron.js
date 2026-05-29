const cron   = require('node-cron')
const prisma = require('./prisma')

// Corre cada día a las 00:05
cron.schedule('5 0 * * *', async () => {
  console.log('[cron] Verificando caducidades...')

  const hoy      = new Date()
  const en30dias = new Date(hoy.getTime() + 30 * 24 * 60 * 60 * 1000)

  // Busca assets activos cuyo extraFields.caducidad esté vencido o próximo
  const assets = await prisma.asset.findMany({
    where: { isActive: true, status: 'activo' }
  })

  let vencidos = 0, proximos = 0

  for (const asset of assets) {
    const caducidad = asset.extraFields?.caducidad
    if (!caducidad) continue

    const fecha = new Date(caducidad)
    if (isNaN(fecha.getTime())) continue

    if (fecha <= hoy) {
      // Vencido → baja automática
      await prisma.asset.update({ where: { id: asset.id }, data: { status: 'baja', isActive: false } })
      await prisma.statusHistory.create({
        data: {
          assetId:     asset.id,
          oldStatus:   'activo',
          newStatus:   'baja',
          reason:      'Caducidad vencida — baja automática',
          changedById: 1 // coordinador por defecto
        }
      })
      vencidos++
    } else if (fecha <= en30dias) {
      // Próximo a vencer → mantenimiento
      await prisma.asset.update({ where: { id: asset.id }, data: { status: 'mantenimiento' } })
      await prisma.statusHistory.create({
        data: {
          assetId:     asset.id,
          oldStatus:   'activo',
          newStatus:   'mantenimiento',
          reason:      `Caducidad próxima: ${fecha.toLocaleDateString('es-MX')}`,
          changedById: 1
        }
      })
      proximos++
    }
  }

  console.log(`[cron] Caducidades: ${vencidos} vencidos, ${proximos} próximos a vencer`)
})

console.log('[cron] Scheduler activo')