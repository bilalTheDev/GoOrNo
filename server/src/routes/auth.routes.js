import { Router } from 'express'
import {
  googleCallback,
  login,
  logout,
  refresh,
  register,
  resendVerification,
  startGoogle,
  verifyEmail,
} from '../controllers/auth.controller.js'

const router = Router()

/**
 * POST /api/v1/auth/register
 * Create an account. Body: { name, email, password, roles: ["user"|"founder"] }.
 */
router.post('/register', register)

/**
 * POST /api/v1/auth/login
 * Sign in with email and password. Sets the refresh cookie.
 */
router.post('/login', login)

/**
 * POST /api/v1/auth/logout
 * End the session and clear the refresh cookie.
 */
router.post('/logout', logout)

/**
 * POST /api/v1/auth/refresh
 * Read the refresh cookie and return a new access token plus the user.
 */
router.post('/refresh', refresh)

/**
 * POST /api/v1/auth/verify-email
 * Body: { token }. Marks the matching account as email-verified.
 */
router.post('/verify-email', verifyEmail)

/**
 * POST /api/v1/auth/verification-email
 * Body: { email }. Prints a new verification link in the API console.
 */
router.post('/verification-email', resendVerification)

/**
 * GET /api/v1/auth/google
 * Start Google OAuth. Query: intent=user|founder|both.
 */
router.get('/google', startGoogle)

/**
 * GET /api/v1/auth/google/callback
 * Google redirects here after consent.
 */
router.get('/google/callback', googleCallback)

export default router
