//entrypoint for the backend server

require('dotenv').config()
const express = require('express')
const cors    = require('cors')
const path    = require('path')

const authRoutes      = require('./modules/auth/auth.routes')
const labRoutes       = require('./modules/labs/labs.routes')
const assetRoutes     = require('./modules/assets/assets.routes')
const userRoutes      = require('./modules/users/users.routes')
//const alertRoutes     = require('./modules/alerts/alerts.routes')
//const analyticsRoutes = require('./modules/analytics/analytics.routes')

const app  = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())
//app.use('/uploads', express.static(path.join(__dirname, '../uploads')))

app.use('/api/auth',      authRoutes)
app.use('/api/labs',      labRoutes)
app.use('/api/assets',    assetRoutes)
app.use('/api/users',     userRoutes)
//app.use('/api/alerts',    alertRoutes)
//app.use('/api/analytics', analyticsRoutes)

app.get('/api/health', (_req, res) => res.json({ ok: true }))

app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
//require('./lib/cron')