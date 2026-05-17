const svc = require('./labs.service')

async function getLabs(req, res) {
  try {
    const labs = req.user.role === 'coordinador'
      ? await svc.getAllLabs()
      : await svc.getLabsByIds(req.user.labIds)
    res.json(labs)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

async function getSchema(req, res) {
  try {
    res.json(await svc.getLabSchema(parseInt(req.params.labId)))
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

async function getDepartments(req, res) {
  try {
    res.json(await svc.getDepartments())
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

async function getEncargados(req, res) {
  try {
    res.json(await svc.getEncargados())
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

async function createLab(req, res) {
  const { name, departmentId } = req.body
  if (!name || !departmentId) return res.status(400).json({ error: 'name y departmentId requeridos' })
  try {
    res.status(201).json(await svc.createLab(name, parseInt(departmentId)))
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

async function updateLab(req, res) {
  try {
    res.json(await svc.updateLab(parseInt(req.params.labId), req.body))
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

async function deleteLab(req, res) {
  try {
    await svc.deleteLab(parseInt(req.params.labId))
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// Schema
async function createField(req, res) {
  const labId = parseInt(req.params.labId)
  const { fieldKey, fieldLabel, fieldType, isRequired, isVisibleInTable, isFilterable, selectOptions } = req.body
  if (!fieldKey || !fieldLabel) return res.status(400).json({ error: 'fieldKey y fieldLabel requeridos' })
  try {
    res.status(201).json(await svc.createField(labId, { fieldKey, fieldLabel, fieldType, isRequired, isVisibleInTable, isFilterable, selectOptions }))
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

async function updateField(req, res) {
  try {
    res.json(await svc.updateField(parseInt(req.params.fieldId), req.body))
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

async function deleteField(req, res) {
  try {
    await svc.deleteField(parseInt(req.params.fieldId))
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// Encargados
async function assignMember(req, res) {
  const { userId } = req.body
  const labId = parseInt(req.params.labId)
  if (!userId) return res.status(400).json({ error: 'userId requerido' })
  try {
    await svc.assignMember(parseInt(userId), labId)
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

async function removeMember(req, res) {
  const { userId } = req.body
  const labId = parseInt(req.params.labId)
  if (!userId) return res.status(400).json({ error: 'userId requerido' })
  try {
    await svc.removeMember(parseInt(userId), labId)
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

module.exports = {
  getLabs, getSchema, getDepartments, getEncargados,
  createLab, updateLab, deleteLab,
  createField, updateField, deleteField,
  assignMember, removeMember
}