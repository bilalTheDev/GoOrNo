import { verifyAccessToken } from '../utils/tokens.js'

export function optionalAuth(req, res, next) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : ''
  if (!token) return next()

  try {
    const payload = verifyAccessToken(token)
    req.auth = { userId: payload.sub, roles: payload.roles || [] }
  } catch {
    req.auth = null
  }
  return next()
}
