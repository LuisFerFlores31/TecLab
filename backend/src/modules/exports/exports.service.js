const path = require('path')
const fs = require('fs')
const prisma = require('../../lib/prisma')

// Use the shared uploads folder mounted by docker-compose at /app/uploads
const UPLOADS_DIR = path.join(__dirname, '../../../uploads/exports')
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true })

async function enqueueJob({ labId, userId, format = 'csv' }) {
  const job = await prisma.exportJob.create({ data: { labId, userId, format, status: 'pending' } })
  // job will be picked up by worker (polling)
  return job
}

async function getJob(id) {
  return prisma.exportJob.findUnique({ where: { id } })
}

async function markProcessing(id) {
  return prisma.exportJob.update({ where: { id }, data: { status: 'processing', progress: 0 } })
}

async function markDone(id, filePath) {
  return prisma.exportJob.update({ where: { id }, data: { status: 'done', filePath, progress: 100 } })
}

async function markFailed(id, error) {
  return prisma.exportJob.update({ where: { id }, data: { status: 'failed', error: String(error).slice(0, 2000) } })
}

async function updateProgress(id, progress) {
  return prisma.exportJob.update({ where: { id }, data: { progress } })
}

// stream assets to csv in paginated fashion to avoid memory blowups
async function streamAssetsToCsv(labId, writeStream, onProgress) {
  // write header
  writeStream.write('Nombre,Tipo,Cantidad,Estado,Laboratorio,Creado,Actualizado\n')

  const pageSize = 1000
  const total = await prisma.asset.count({ where: { labId, isActive: true } })
  let processed = 0
  let page = 0
  while (true) {
    const assets = await prisma.asset.findMany({
      where: { labId, isActive: true },
      orderBy: { id: 'asc' },
      skip: page * pageSize,
      take: pageSize,
      include: { lab: { select: { name: true } } }
    })
    if (!assets.length) break

    for (const a of assets) {
      const row = [
        escapeCsv(a.name),
        escapeCsv(a.assetType),
        a.quantity ?? 0,
        escapeCsv(a.status),
        escapeCsv(a.lab?.name || ''),
        a.createdAt.toISOString(),
        a.updatedAt.toISOString(),
      ]
      writeStream.write(row.join(',') + '\n')
    }

    processed += assets.length
    if (typeof onProgress === 'function' && total > 0) {
      const percent = Math.min(99, Math.floor((processed / total) * 100))
      await onProgress(percent)
    }

    page++
  }

  if (typeof onProgress === 'function') {
    await onProgress(100)
  }
}

function escapeCsv(val) {
  if (val === null || val === undefined) return ''
  return '"' + String(val).replace(/"/g, '""') + '"'
}

module.exports = { enqueueJob, getJob, markProcessing, markDone, markFailed, updateProgress, streamAssetsToCsv, UPLOADS_DIR }
