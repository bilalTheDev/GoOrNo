import { Router } from 'express'
import { becomeFounder, getMe } from '../controllers/user.controller.js'
import { requireAuth } from '../middleware/requireAuth.js'

const router = Router()

/**
 * GET /api/v1/users/me
 * Public profile of the signed-in user.
 */
router.get('/me', requireAuth, getMe)

/**
 * POST /api/v1/users/me/founder
 * Add the founder role to the signed-in user.
 */
router.post('/me/founder', requireAuth, becomeFounder)

export default router
