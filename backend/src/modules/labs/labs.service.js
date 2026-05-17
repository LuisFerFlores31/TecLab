const prisma = require('../../lib/prisma')

async function getAllLabs() {
  return prisma.laboratory.findMany({
    include: {
      department: true,
      members:    { include: { user: { select: { id: true, name: true, email: true } } } }
    },
    orderBy: { name: 'asc' }
  })
}

async function getLabsByIds(labIds) {
  return prisma.laboratory.findMany({
    where:   { id: { in: labIds } },
    include: {
      department: true,
      members:    { include: { user: { select: { id: true, name: true, email: true } } } }
    },
    orderBy: { name: 'asc' }
  })
}

async function getLabSchema(labId) {
  return prisma.labFieldSchema.findMany({
    where:   { labId },
    orderBy: { sortOrder: 'asc' }
  })
}

async function getDepartments() {
  return prisma.department.findMany({ orderBy: { name: 'asc' } })
}

async function createLab(name, departmentId) {
  return prisma.laboratory.create({
    data:    { name, departmentId },
    include: { department: true }
  })
}

async function updateLab(labId, data) {
  return prisma.laboratory.update({
    where:   { id: labId },
    data:    {
      ...(data.name         && { name: data.name }),
      ...(data.departmentId && { departmentId: data.departmentId })
    },
    include: { department: true }
  })
}

async function deleteLab(labId) {
  await prisma.asset.updateMany({
    where: { labId },
    data:  { isActive: false, status: 'baja' }
  })
  return prisma.laboratory.delete({ where: { id: labId } })
}

// ── Schema dinámico ────────────────────────────────────────────────────────────
async function createField(labId, data) {
  const count = await prisma.labFieldSchema.count({ where: { labId } })
  return prisma.labFieldSchema.create({
    data: {
      labId,
      fieldKey:        data.fieldKey,
      fieldLabel:      data.fieldLabel,
      fieldType:       data.fieldType       ?? 'text',
      isRequired:      data.isRequired      ?? false,
      isVisibleInTable:data.isVisibleInTable ?? true,
      isFilterable:    data.isFilterable     ?? false,
      sortOrder:       data.sortOrder        ?? count,
      selectOptions:   data.selectOptions    ?? null,
    }
  })
}

async function updateField(fieldId, data) {
  return prisma.labFieldSchema.update({
    where: { id: fieldId },
    data:  {
      ...(data.fieldLabel       !== undefined && { fieldLabel:       data.fieldLabel       }),
      ...(data.fieldType        !== undefined && { fieldType:        data.fieldType        }),
      ...(data.isRequired       !== undefined && { isRequired:       data.isRequired       }),
      ...(data.isVisibleInTable !== undefined && { isVisibleInTable: data.isVisibleInTable }),
      ...(data.isFilterable     !== undefined && { isFilterable:     data.isFilterable     }),
      ...(data.sortOrder        !== undefined && { sortOrder:        data.sortOrder        }),
      ...(data.selectOptions    !== undefined && { selectOptions:    data.selectOptions    }),
    }
  })
}

async function deleteField(fieldId) {
  return prisma.labFieldSchema.delete({ where: { id: fieldId } })
}

// ── Encargados ────────────────────────────────────────────────────────────────
async function assignMember(userId, labId) {
  return prisma.labMember.upsert({
    where:  { userId_labId: { userId, labId } },
    update: {},
    create: { userId, labId }
  })
}

async function removeMember(userId, labId) {
  return prisma.labMember.delete({
    where: { userId_labId: { userId, labId } }
  })
}

async function getEncargados() {
  return prisma.user.findMany({
    where:   { role: 'encargado', isActive: true },
    select:  { id: true, name: true, email: true, labMembers: { select: { labId: true } } },
    orderBy: { name: 'asc' }
  })
}

module.exports = {
  getAllLabs, getLabsByIds, getLabSchema, getDepartments,
  createLab, updateLab, deleteLab,
  createField, updateField, deleteField,
  assignMember, removeMember, getEncargados
}