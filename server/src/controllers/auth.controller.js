import bcrypt from 'bcrypt'
import passport from 'passport'
import { clientUrl, rolesFromIntent } from '../config/auth.js'
import { googleAuthEnabled } from '../config/passport.js'
import User from '../models/User.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import {
  clearOAuthIntentCookie,
  clearRefreshCookie,
  readOAuthIntentCookie,
  readRefreshCookie,
  setOAuthIntentCookie,
  setRefreshCookie,
} from '../utils/cookies.js'
import {
  createVerificationToken,
  hashToken,
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} from '../utils/tokens.js'
import { logVerificationLink } from '../utils/verificationMail.js'
import { validateLogin, validateRegister } from '../validators/auth.js'

async function issueSession(user, res) {
  const refreshToken = signRefreshToken(user)
  await User.updateOne(
    { _id: user._id },
    { $set: { refreshTokenHash: hashToken(refreshToken) } },
  )
  setRefreshCookie(res, refreshToken)
  return signAccessToken(user)
}

/**
 * Creates the account and prints an email verification link in the API console.
 */
export const register = asyncHandler(async (req, res) => {
  const { errors, value } = validateRegister(req.body)
  if (errors.length) {
    return res.status(400).json({ success: false, message: errors[0] })
  }

  const password = await bcrypt.hash(value.password, 12)
  const verification = createVerificationToken()

  try {
    await User.create({
      name: value.name,
      email: value.email,
      password,
      roles: value.roles,
      emailVerificationTokenHash: verification.hash,
      emailVerificationExpires: verification.expires,
    })
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'An account with that email already exists.',
      })
    }
    throw error
  }

  logVerificationLink(value.email, verification.token)
  return res.status(201).json({
    success: true,
    message:
      'Account created. Use the verification link printed in the API server console.',
  })
})

/**
 * Checks email and password, then sets the refresh cookie and returns an access token.
 */
export const login = asyncHandler(async (req, res) => {
  const { errors, value } = validateLogin(req.body)
  if (errors.length) {
    return res.status(400).json({ success: false, message: errors[0] })
  }

  const user = await User.findOne({ email: value.email }).select('+password')
  if (!user?.password) {
    const message = user?.googleId
      ? 'This account uses Google sign-in.'
      : 'Invalid email or password.'
    return res.status(401).json({ success: false, message })
  }

  const matches = await bcrypt.compare(value.password, user.password)
  if (!matches) {
    return res.status(401).json({ success: false, message: 'Invalid email or password.' })
  }

  const accessToken = await issueSession(user, res)
  return res.json({ success: true, accessToken, user: user.toPublic() })
})

/**
 * Clears the refresh cookie and the stored refresh-token hash.
 */
export const logout = asyncHandler(async (req, res) => {
  const token = readRefreshCookie(req)
  if (token) {
    try {
      const payload = verifyRefreshToken(token)
      await User.updateOne(
        { _id: payload.sub, refreshTokenHash: hashToken(token) },
        { $unset: { refreshTokenHash: 1 } },
      )
    } catch {
      // An expired cookie should still be cleared.
    }
  }

  clearRefreshCookie(res)
  return res.json({ success: true })
})

/**
 * Issues a new access token from the httpOnly refresh cookie.
 * The refresh token itself is kept until logout so a double page load cannot sign the user out.
 */
export const refresh = asyncHandler(async (req, res) => {
  const token = readRefreshCookie(req)
  if (!token) {
    return res.status(401).json({ success: false, message: 'Sign in required.' })
  }

  let payload
  try {
    payload = verifyRefreshToken(token)
  } catch {
    clearRefreshCookie(res)
    return res.status(401).json({ success: false, message: 'Sign in required.' })
  }

  const user = await User.findById(payload.sub).select('+refreshTokenHash')
  if (!user || user.refreshTokenHash !== hashToken(token)) {
    clearRefreshCookie(res)
    return res.status(401).json({ success: false, message: 'Sign in required.' })
  }

  return res.json({
    success: true,
    accessToken: signAccessToken(user),
    user: user.toPublic(),
  })
})

/**
 * Marks the account verified when the emailed token is still valid.
 */
export const verifyEmail = asyncHandler(async (req, res) => {
  const token = String(req.body?.token || '')
  if (!token) {
    return res
      .status(400)
      .json({ success: false, message: 'Verification token is missing.' })
  }

  const user = await User.findOneAndUpdate(
    {
      emailVerificationTokenHash: hashToken(token),
      emailVerificationExpires: { $gt: new Date() },
    },
    {
      $set: { emailVerified: true },
      $unset: { emailVerificationTokenHash: 1, emailVerificationExpires: 1 },
    },
    { new: true },
  )

  if (!user) {
    return res.status(400).json({
      success: false,
      message: 'This verification link is invalid or has expired.',
    })
  }

  return res.json({ success: true, message: 'Email verified. You can sign in.' })
})

/**
 * Prints a fresh verification link. Authenticated callers get a direct confirmation.
 * Public callers always receive the same response.
 */
export const resendVerification = asyncHandler(async (req, res) => {
  const header = req.headers.authorization || ''
  let user = null

  if (header.startsWith('Bearer ')) {
    try {
      const payload = verifyAccessToken(header.slice(7))
      user = await User.findById(payload.sub)
    } catch {
      user = null
    }
  }

  if (!user && req.body?.email) {
    user = await User.findOne({ email: String(req.body.email).trim().toLowerCase() })
  }

  if (user && !user.emailVerified) {
    const verification = createVerificationToken()
    await User.updateOne(
      { _id: user._id },
      {
        $set: {
          emailVerificationTokenHash: verification.hash,
          emailVerificationExpires: verification.expires,
        },
      },
    )
    logVerificationLink(user.email, verification.token)
  }

  const message = header
    ? 'A new verification link was printed in the API server console.'
    : 'If that account exists and is unverified, a link was printed in the API server console.'

  return res.json({ success: true, message })
})

/**
 * Starts Google OAuth. Stores the chosen account type in a short-lived cookie.
 */
export function startGoogle(req, res, next) {
  if (!googleAuthEnabled()) {
    return res.redirect(`${clientUrl()}/login?error=google_unavailable`)
  }

  const intent = ['user', 'founder', 'both'].includes(req.query.intent)
    ? req.query.intent
    : 'user'
  setOAuthIntentCookie(res, intent)
  return passport.authenticate('google', { scope: ['profile', 'email'], session: false })(
    req,
    res,
    next,
  )
}

/**
 * Finishes Google OAuth, applies the sign-up role for new accounts, and starts a session.
 */
export function googleCallback(req, res, next) {
  if (!googleAuthEnabled()) {
    return res.redirect(`${clientUrl()}/login?error=google_unavailable`)
  }

  return passport.authenticate('google', { session: false }, async (error, user) => {
    const intent = readOAuthIntentCookie(req)
    clearOAuthIntentCookie(res)

    try {
      if (error || !user) {
        return res.redirect(`${clientUrl()}/login?error=google_failed`)
      }

      if (user.$locals?.created && intent !== 'user') {
        user.roles = rolesFromIntent(intent)
        await user.save()
      }

      await issueSession(user, res)
      return res.redirect(`${clientUrl()}/account`)
    } catch (callbackError) {
      console.error(callbackError)
      return res.redirect(`${clientUrl()}/login?error=google_failed`)
    }
  })(req, res, next)
}
