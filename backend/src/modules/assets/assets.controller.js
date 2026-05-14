const svc    = require('./assets.service')
const upload = require('../../lib/multer')

async function getAssets(req, res) {
  const labId = parseInt(req.params.labId)
  const { page, limit, status, search, assetType } = req.query
  try {
    const result = await svc.getAssets(labId, {
      page: parseInt(page) || 1, limit: parseInt(limit) || 20,
      status, assetType, search
    })
    res.json(result)
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message })
  }
}

async function getAsset(req, res) {
  try {
    const asset = await svc.getAssetById(parseInt(req.params.id))
    if (!asset) return res.status(404).json({ error: 'No encontrado' })
    res.json(asset)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

async function createAsset(req, res) {
  const labId = parseInt(req.params.labId)
  try {
    const asset = await svc.createAsset(labId, req.body, req.user.id)
    res.status(201).json(asset)
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message, errors: err.errors })
  }
}

async function updateAsset(req, res) {
  try {
    const asset = await svc.updateAsset(parseInt(req.params.id), req.body, req.user.id)
    res.json(asset)
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message, errors: err.errors })
  }
}

async function changeStatus(req, res) {
  const { newStatus, reason } = req.body
  if (!newStatus) return res.status(400).json({ error: 'newStatus requerido' })
  try {
    const asset = await svc.changeStatus(parseInt(req.params.id), newStatus, reason, req.user.id)
    res.json(asset)
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message })
  }
}

async function uploadImage(req, res) {
  // multer ya procesó el archivo
  if (!req.file) return res.status(400).json({ error: 'No se recibió imagen' })
  const imageUrl = `/uploads/${req.file.filename}`
  try {
    const asset = await svc.updateImage(parseInt(req.params.id), imageUrl, req.user.id)
    res.json({ imageUrl: asset.imageUrl })
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message })
  }
}

async function deleteAsset(req, res) {
  try {
    await svc.softDeleteAsset(parseInt(req.params.id), req.user.id)
    res.json({ ok: true })
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message })
  }
}

async function getAuditLog(req, res) {
  try {
    const logs = await svc.getAuditLog(parseInt(req.params.id))
    res.json(logs)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

module.exports = { getAssets, getAsset, createAsset, updateAsset, changeStatus, uploadImage, deleteAsset, getAuditLog }