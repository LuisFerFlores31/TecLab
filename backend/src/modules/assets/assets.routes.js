const { Router } = require('express')
const ctrl = require('./assets.controller')
const upload      = require('../../lib/multer')
const { authenticate } = require('../../middleware/auth')
const { authorizeLab } = require('../../middleware/authorize')

const router = Router()

router.use(authenticate)

router.get('/lab/:labId',          authorizeLab, ctrl.getAssets)
router.post('/lab/:labId',         authorizeLab, ctrl.createAsset)
router.get('/:id',                               ctrl.getAsset)
router.patch('/:id',                             ctrl.updateAsset)
router.patch('/:id/status',                      ctrl.changeStatus)
router.post('/:id/image',          upload.single('image'), ctrl.uploadImage)
router.delete('/:id',                            ctrl.deleteAsset)
router.get('/:id/audit',                         ctrl.getAuditLog)

module.exports = router