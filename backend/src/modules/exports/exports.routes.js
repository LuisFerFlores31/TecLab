const express = require('express')
const router = express.Router()
const { authenticate } = require('../../middleware/auth')
const controller = require('./exports.controller')

router.use(authenticate)

router.post('/', controller.createExportJob)
router.get('/:id/status', controller.getJobStatus)
router.get('/:id/download', controller.downloadFile)

module.exports = router
