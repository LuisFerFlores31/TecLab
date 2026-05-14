const { Router }     = require('express')
const ctrl           = require('./alerts.controller')
const { authenticate } = require('../../middleware/auth')

const router = Router()
router.use(authenticate)

router.get('/',          ctrl.getAlerts)
router.patch('/:id/resolve', ctrl.resolveAlert)

module.exports = router