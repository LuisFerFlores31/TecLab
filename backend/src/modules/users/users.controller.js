const svc = require('./users.service')

async function getUsers(req, res) {
  try {
    res.json(await svc.getUsers())
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

async function createUser(req, res) {
  const { name, email, password, role } = req.body
  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: 'name, email, password y role requeridos' })
  }
  try {
    const user = await svc.createUser({ name, email, password, role })
    res.status(201).json(user)
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message })
  }
}

async function updateUser(req, res) {
  const { name, email, password, role } = req.body
  if (!name && !email && !password && !role) {
    return res.status(400).json({ error: 'Al menos un campo debe ser proporcionado' })
  }
  try {
    const user = await svc.updateUser(parseInt(req.params.id), { name, email, password, role })
    res.json(user)
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message })
  }
}

async function deactivateUser(req, res) {
  try {
    await svc.deactivateUser(parseInt(req.params.id))
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

module.exports = { getUsers, createUser, updateUser, deactivateUser }