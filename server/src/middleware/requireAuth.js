import { verifyAccessToken } from '../utils/tokens.js'

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : ''

  if (!token) {
    return res.status(401).json({ success: false, message: 'Sign in required.' })
  }

  try {
    const payload = verifyAccessToken(token)
    req.auth = { userId: payload.sub, roles: payload.roles || [] }
    return next()
  } catch {
    return res.status(401).json({ success: false, message: 'Sign in required.' })
  }
}
