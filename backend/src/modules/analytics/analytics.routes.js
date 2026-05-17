const { Router }     = require('express')
const ctrl           = require('./analytics.controller')
const { authenticate } = require('../../middleware/auth')

const router = Router()
router.use(authenticate)
router.get('/summary', ctrl.getSummary)

module.exports = router