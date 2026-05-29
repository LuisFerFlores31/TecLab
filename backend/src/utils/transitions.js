const ALLOWED_TRANSITIONS = {
  activo:        ['mantenimiento', 'baja', 'agotado'],
  mantenimiento: ['activo', 'baja'],
  agotado:       ['activo', 'baja'],
  baja:          [], // estado final, no se puede reactivar
}

function isValidTransition(from, to) {
  return ALLOWED_TRANSITIONS[from]?.includes(to) ?? false
}

module.exports = { isValidTransition }