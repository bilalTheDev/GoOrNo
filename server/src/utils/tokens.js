import crypto from 'crypto'
import jwt from 'jsonwebtoken'
import { accessTokenTtl, refreshTokenDays } from '../config/auth.js'

export function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex')
}

export function signAccessToken(user) {
  return jwt.sign(
    { sub: user._id.toString(), roles: user.roles },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: accessTokenTtl() },
  )
}

export function signRefreshToken(user) {
  return jwt.sign({ sub: user._id.toString() }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: `${refreshTokenDays()}d`,
  })
}

export function verifyAccessToken(token) {
  return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
}

export function verifyRefreshToken(token) {
  return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET)
}

export function createVerificationToken() {
  const token = crypto.randomBytes(32).toString('hex')
  return {
    token,
    hash: hashToken(token),
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
  }
}
