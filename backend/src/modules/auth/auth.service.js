const bcrypt = require('bcryptjs')
const jwt    = require('jsonwebtoken')
const prisma = require('../../lib/prisma')

async function login(email, password) {
  const user = await prisma.user.findUnique({
    where: { email },
    include: { labMembers: { select: { labId: true } } }
  })
//solo para debug, eliminar en producción
  console.log(`[DEBUG] Login attempt for ${email}`)
  console.log(`[DEBUG] User found: ${user ? 'YES' : 'NO'}`)
  if (user) {
    console.log(`[DEBUG] User isActive: ${user.isActive}`)
    console.log(`[DEBUG] User passwordHash: ${user.passwordHash}`)
  }
// Fin de logs de depuración
  if (!user || !user.isActive) {
    throw new Error('Credenciales inválidas')
  }

  const valid = await bcrypt.compare(password, user.passwordHash)
  console.log(`[DEBUG] Password valid: ${valid}`) //solo para debug, eliminar en producción
  
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