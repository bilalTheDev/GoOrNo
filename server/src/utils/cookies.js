import { refreshTokenDays } from '../config/auth.js'

const refreshCookie = 'refreshToken'
const intentCookie = 'oauthIntent'

function cookieOptions(extra = {}) {
  return {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/api/v1/auth',
    ...extra,
  }
}

export function setRefreshCookie(res, token) {
  res.cookie(
    refreshCookie,
    token,
    cookieOptions({ maxAge: refreshTokenDays() * 24 * 60 * 60 * 1000 }),
  )
}

export function clearRefreshCookie(res) {
  res.clearCookie(refreshCookie, cookieOptions())
}

export function readRefreshCookie(req) {
  return req.cookies?.[refreshCookie] || ''
}

export function setOAuthIntentCookie(res, intent) {
  res.cookie(intentCookie, intent, cookieOptions({ maxAge: 10 * 60 * 1000 }))
}

export function readOAuthIntentCookie(req) {
  const intent = req.cookies?.[intentCookie]
  return ['user', 'founder', 'both'].includes(intent) ? intent : 'user'
}

export function clearOAuthIntentCookie(res) {
  res.clearCookie(intentCookie, cookieOptions())
}
