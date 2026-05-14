const prisma = require('../../lib/prisma')

async function validateExtraFields(labId, extraFields) {
  const schema = await prisma.labFieldSchema.findMany({ where: { labId } })

  if (!schema.length) return // lab sin schema definido aún, se permite

  const errors = []

  for (const field of schema) {
    const value = extraFields[field.fieldKey]

    if (field.isRequired && (value === undefined || value === null || value === '')) {
      errors.push(`Campo requerido faltante: ${field.fieldLabel}`)
      continue
    }

    if (value === undefined || value === null) continue // opcional y ausente: ok

    switch (field.fieldType) {
      case 'number':
        if (typeof value !== 'number' || isNaN(value)) {
          errors.push(`${field.fieldLabel} debe ser un número`)
        }
        break

      case 'date':
        if (isNaN(Date.parse(value))) {
          errors.push(`${field.fieldLabel} debe ser una fecha ISO válida`)
        }
        break

      case 'url':
        try { new URL(value) } catch {
          errors.push(`${field.fieldLabel} debe ser una URL válida`)
        }
        break

      case 'select':
        if (field.selectOptions && !field.selectOptions.includes(value)) {
          errors.push(`${field.fieldLabel} valor inválido. Opciones: ${field.selectOptions.join(', ')}`)
        }
        break

      case 'text':
      default:
        if (typeof value !== 'string') {
          errors.push(`${field.fieldLabel} debe ser texto`)
        }
        break
    }
  }

  // rechazar keys que no están en el schema
  const validKeys = new Set(schema.map(f => f.fieldKey))
  for (const key of Object.keys(extraFields)) {
    if (!validKeys.has(key)) {
      errors.push(`Campo no permitido: ${key}`)
    }
  }

  return errors.length ? errors : null
}

module.exports = { validateExtraFields }