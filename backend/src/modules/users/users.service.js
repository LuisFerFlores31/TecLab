const bcrypt  = require('bcryptjs')
const prisma  = require('../../lib/prisma')

async function getUsers() {
  return prisma.user.findMany({
    where:   { isActive: true },
    select:  { id: true, name: true, email: true, role: true, labMembers: { select: { labId: true } } }
  })
}

async function createUser(data) {
  const { name, email, password, role } = data
  const exists = await prisma.user.findUnique({ where: { email } })
  if (exists) throw Object.assign(new Error('Email ya registrado'), { status: 409 })

  const passwordHash = await bcrypt.hash(password, 10)
  console.log(`[DEBUG] Creating user ${email} with password hash: ${passwordHash}`) //solo para debug, eliminar en producción
  
  const created = await prisma.user.create({
    data: { name, email, passwordHash, role },
    select: { id: true, name: true, email: true, role: true, labMembers: { select: { labId: true } } }
  })
  
  console.log(`[DEBUG] User created: ${JSON.stringify(created)}`) //solo para debug, eliminar en producción

  return created
}

async function deactivateUser(id) {
  return prisma.user.update({
    where: { id },
    data:  { isActive: false }
  })
}

module.exports = { getUsers, createUser, deactivateUser }