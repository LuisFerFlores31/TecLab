// verifica JWT, adjunta user al req

const jwt    = require('jsonwebtoken')
const prisma = require('../lib/prisma')

async function authenticate(req, res, next) {
  const header = req.headers.authorization

  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token requerido' })
  }

  const token = header.split(' ')[1]

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET)

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: {
        labMembers: { select: { labId: true } }
      }
    })

    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'Usuario no válido' })
    }

    // adjunta al req para que los controllers lo usen
    req.user = {
      id:     user.id,
      role:   user.role,
      labIds: user.labMembers.map(m => m.labId)
    }

    next()
  } catch {
    return res.status(401).json({ error: 'Token inválido o expirado' })
  }
}

module.exports = { authenticate }