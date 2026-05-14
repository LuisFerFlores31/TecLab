const { Router } = require('express')
const { handleLogin } = require('./auth.controller')

const router = Router()

router.post('/login', handleLogin)

module.exports = router