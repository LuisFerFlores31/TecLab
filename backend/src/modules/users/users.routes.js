const { Router } = require('express')
const ctrl = require('./users.controller')
const { authenticate } = require('../../middleware/auth')
const { coordinatorOnly } = require('../../middleware/authorize')

const router = Router()

router.use(authenticate)
router.use(coordinatorOnly)

router.get('/',       ctrl.getUsers)
router.post('/',      ctrl.createUser)
router.delete('/:id', ctrl.deactivateUser)

module.exports = router