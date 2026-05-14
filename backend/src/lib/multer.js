const multer = require('multer')
const path   = require('path')
const fs     = require('fs')

const uploadDir = path.join(__dirname, '../../uploads')
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true })

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename:    (_req, file, cb) => {
    const ext  = path.extname(file.originalname).toLowerCase()
    const base = `asset-${Date.now()}-${Math.round(Math.random() * 1e6)}`
    cb(null, `${base}${ext}`)
  }
})

const ALLOWED = ['.jpg', '.jpeg', '.png', '.webp', '.gif']

const fileFilter = (_req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase()
  ALLOWED.includes(ext)
    ? cb(null, true)
    : cb(new Error(`Formato no permitido. Usa: ${ALLOWED.join(', ')}`))
}

module.exports = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } })