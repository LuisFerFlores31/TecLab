const prisma  = require('../../lib/prisma')
const { isValidTransition } = require('../../utils/transitions')
const { validateExtraFields } = require('./assets.validator')
const { logAudit } = require('../../lib/audit')

async function getAssets(labId, { page = 1, limit = 20, status, search, assetType } = {}) {
  const skip = (page - 1) * limit
  const where = {
    labId,
    isActive: true,
    ...(status    && { status }),
    ...(assetType && { assetType }),
    ...(search    && { name: { contains: search, mode: 'insensitive' } })
  }
  const [assets, total] = await Promise.all([
    prisma.asset.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
    prisma.asset.count({ where })
  ])
  return { assets, total, page, limit, pages: Math.ceil(total / limit) }
}

async function getAssetById(id) {
  return prisma.asset.findFirst({ where: { id, isActive: true } })
}

async function createAsset(labId, data, userId) {
  const { name, assetType, quantity, unit, extraFields = {} } = data

  const errors = await validateExtraFields(labId, extraFields)
  if (errors) throw Object.assign(new Error('Validación fallida'), { errors, status: 400 })

  const asset = await prisma.asset.create({
    data: { labId, name, assetType, quantity, unit, extraFields, createdById: userId }
  })

  await logAudit({ assetId: asset.id, userId, action: 'creado', note: `Activo "${name}" creado` })
  return asset
}

async function updateAsset(id, data, userId) {
  const asset = await prisma.asset.findFirst({ where: { id, isActive: true } })
  if (!asset) throw Object.assign(new Error('Asset no encontrado'), { status: 404 })

  const { extraFields, name, quantity, unit } = data

  if (extraFields) {
    const errors = await validateExtraFields(asset.labId, extraFields)
    if (errors) throw Object.assign(new Error('Validación fallida'), { errors, status: 400 })
  }

  // Audit: detecta qué campos cambiaron
  const changes = []
  if (name     && name     !== asset.name)     changes.push({ field: 'name',     old: asset.name,     new: name     })
  if (quantity !== undefined && quantity !== asset.quantity) changes.push({ field: 'quantity', old: asset.quantity, new: quantity })
  if (unit     && unit     !== asset.unit)     changes.push({ field: 'unit',     old: asset.unit,     new: unit     })

  const updated = await prisma.asset.update({
    where: { id },
    data: {
      ...(name       && { name }),
      ...(quantity   !== undefined && { quantity }),
      ...(unit       && { unit }),
      ...(extraFields && { extraFields })
    }
  })

  for (const c of changes) {
    await logAudit({ assetId: id, userId, action: 'editado', fieldName: c.field, oldValue: c.old, newValue: c.new })
  }
  if (extraFields) {
    await logAudit({ assetId: id, userId, action: 'editado', fieldName: 'extraFields', note: 'Campos dinámicos actualizados' })
  }

  return updated
}

async function changeStatus(id, newStatus, reason, userId) {
  const asset = await prisma.asset.findFirst({ where: { id, isActive: true } })
  if (!asset) throw Object.assign(new Error('Asset no encontrado'), { status: 404 })

  if (!isValidTransition(asset.status, newStatus)) {
    throw Object.assign(
      new Error(`Transición no permitida: ${asset.status} → ${newStatus}`),
      { status: 400 }
    )
  }

  const [updated] = await prisma.$transaction([
    prisma.asset.update({ where: { id }, data: { status: newStatus } }),
    prisma.statusHistory.create({
      data: { assetId: id, oldStatus: asset.status, newStatus, reason, changedById: userId }
    })
  ])

  await logAudit({
    assetId: id, userId, action: 'status_cambiado',
    fieldName: 'status', oldValue: asset.status, newValue: newStatus, note: reason
  })

  return updated
}

async function updateImage(id, imageUrl, userId) {
  const asset = await prisma.asset.findFirst({ where: { id, isActive: true } })
  if (!asset) throw Object.assign(new Error('Asset no encontrado'), { status: 404 })

  const updated = await prisma.asset.update({ where: { id }, data: { imageUrl } })
  await logAudit({ assetId: id, userId, action: 'imagen_actualizada', note: imageUrl })
  return updated
}

async function softDeleteAsset(id, userId) {
  const asset = await prisma.asset.findFirst({ where: { id, isActive: true } })
  if (!asset) throw Object.assign(new Error('Asset no encontrado'), { status: 404 })

  if (!isValidTransition(asset.status, 'baja')) {
    throw Object.assign(new Error('Este activo ya está dado de baja'), { status: 400 })
  }

  await prisma.$transaction([
    prisma.asset.update({ where: { id }, data: { status: 'baja', isActive: false } }),
    prisma.statusHistory.create({
      data: { assetId: id, oldStatus: asset.status, newStatus: 'baja', reason: 'Dado de baja por usuario', changedById: userId }
    })
  ])

  await logAudit({ assetId: id, userId, action: 'dado_de_baja', note: `"${asset.name}" dado de baja` })
  return { ok: true }
}

async function getAuditLog(assetId) {
  return prisma.assetAuditLog.findMany({
    where:   { assetId },
    include: { user: { select: { name: true, email: true } } },
    orderBy: { createdAt: 'desc' }
  })
}

module.exports = { getAssets, getAssetById, createAsset, updateAsset, changeStatus, updateImage, softDeleteAsset, getAuditLog }