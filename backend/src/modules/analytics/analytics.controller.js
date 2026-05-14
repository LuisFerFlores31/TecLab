const svc = require('./analytics.service')

async function getSummary(req, res) {
  try {
    const data = await svc.getSummary(req.user.labIds, req.user.role === 'coordinador')
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

module.exports = { getSummary }