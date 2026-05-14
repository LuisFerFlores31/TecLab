const { Router }    = require('express')
const ctrl          = require('./labs.controller')
const { authenticate }               = require('../../middleware/auth')
const { authorizeLab, coordinatorOnly } = require('../../middleware/authorize')

const router = Router()
router.use(authenticate)

router.get('/',                        ctrl.getLabs)
router.get('/departments',             ctrl.getDepartments)
router.get('/encargados',              coordinatorOnly, ctrl.getEncargados)
router.post('/',                       coordinatorOnly, ctrl.createLab)
router.patch('/:labId',                coordinatorOnly, ctrl.updateLab)
router.delete('/:labId',               coordinatorOnly, ctrl.deleteLab)

// Schema
router.get('/:labId/schema',           authorizeLab, ctrl.getSchema)
router.post('/:labId/schema',          coordinatorOnly, ctrl.createField)
router.patch('/:labId/schema/:fieldId',coordinatorOnly, ctrl.updateField)
router.delete('/:labId/schema/:fieldId',coordinatorOnly, ctrl.deleteField)

// Encargados
router.post('/:labId/members',         coordinatorOnly, ctrl.assignMember)
router.delete('/:labId/members',       coordinatorOnly, ctrl.removeMember)

module.exports = router