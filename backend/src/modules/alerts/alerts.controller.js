const svc = require('./alerts.service')

async function getAlerts(req, res) {
  try {
    const isCoordinator = req.user.role === 'coordinador'
    const data = await svc.getAlerts(req.user.labIds, isCoordinator)
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

async function resolveAlert(req, res) {
  const { newStatus, reason } = req.body
  if (!newStatus) return res.status(400).json({ error: 'newStatus requerido' })
  try {
    await svc.resolveAlert(parseInt(req.params.id), newStatus, reason, req.user.id)
    res.json({ ok: true })
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message })
  }
}

module.exports = { getAlerts, resolveAlert }