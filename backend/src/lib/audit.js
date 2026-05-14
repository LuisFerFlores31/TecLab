const prisma = require('./prisma')

async function logAudit({ assetId, userId, action, fieldName, oldValue, newValue, note }) {
  await prisma.assetAuditLog.create({
    data: {
      assetId,
      userId,
      action,
      fieldName: fieldName ?? null,
      oldValue:  oldValue  != null ? String(oldValue)  : null,
      newValue:  newValue  != null ? String(newValue)  : null,
      note:      note      ?? null,
    }
  })
}

module.exports = { logAudit }