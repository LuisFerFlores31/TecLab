// verifica roles y acceso al lab

// El coordinador siempre pasa, el encargado solo si está en labIds.
function authorizeLab(req, res, next) {
  const { user } = req
  const labId = parseInt(req.params.labId || req.body.labId)

  if (!labId) return next() // si no hay labId en la ruta, no aplica

  if (user.role === 'coordinador') return next()

  if (!user.labIds.includes(labId)) {
    return res.status(403).json({ error: 'Sin acceso a este laboratorio' })
  }

  next()
}

// Verifica que solo el coordinador pueda ejecutar ciertas acciones
function coordinatorOnly(req, res, next) {
  if (req.user.role !== 'coordinador') {
    return res.status(403).json({ error: 'Solo el coordinador puede hacer esto' })
  }
  next()
}

module.exports = { authorizeLab, coordinatorOnly }