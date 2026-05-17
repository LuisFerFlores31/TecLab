const bcrypt = require('bcryptjs')
const jwt    = require('jsonwebtoken')
const prisma = require('../../lib/prisma')

async function login(email, password) {
  const user = await prisma.user.findUnique({
    where: { email },
    include: { labMembers: { select: { labId: true } } }
  })

  if (!user || !user.isActive) {
    throw new Error('Credenciales inválidas')
  }

  const valid = await bcrypt.compare(password, user.passwordHash)
  if (!valid) throw new Error('Credenciales inválidas')

  const token = jwt.sign(
    { userId: user.id },
    process.env.JWT_SECRET,
    { expiresIn: '8h' }
  )

  return {
    token,
    user: {
      id:     user.id,
      name:   user.name,
      email:  user.email,
      role:   user.role,
      labIds: user.labMembers.map(m => m.labId)
    }
  }
}

module.exports = { login }