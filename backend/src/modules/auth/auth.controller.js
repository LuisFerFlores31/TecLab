const { login } = require('./auth.service')

async function handleLogin(req, res) {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ error: 'Email y password requeridos' })
  }

  try {
    const result = await login(email, password)
    res.json(result)
  } catch (err) {
    res.status(401).json({ error: err.message })
  }
}

module.exports = { handleLogin }