import { Router } from 'express'
import {
  addImages,
  createPitch,
  deletePitch,
  getPitch,
  listMine,
  listPitches,
  publishPitch,
  removeImage,
  updatePitch,
} from '../controllers/pitch.controller.js'
import { optionalAuth } from '../middleware/optionalAuth.js'
import { receiveImages } from '../middleware/uploadImages.js'
import { requireAuth } from '../middleware/requireAuth.js'
import { requireFounder } from '../middleware/requireFounder.js'

const router = Router()
const founder = [requireAuth, requireFounder]

/**
 * GET /api/v1/pitches
 * Public feed of non-draft pitches.
 */
router.get('/', listPitches)

/**
 * GET /api/v1/pitches/mine
 * Pitches owned by the signed-in founder, including drafts.
 */
router.get('/mine', ...founder, listMine)

/**
 * POST /api/v1/pitches
 * Create a draft. Body: { title, tagline }.
 */
router.post('/', ...founder, createPitch)

/**
 * GET /api/v1/pitches/:id
 * Pitch detail. Drafts require the owner.
 */
router.get('/:id', optionalAuth, getPitch)

/**
 * PATCH /api/v1/pitches/:id
 * Update title, tagline, description, category, or priceHint.
 */
router.patch('/:id', ...founder, updatePitch)

/**
 * DELETE /api/v1/pitches/:id
 * Delete a pitch owned by the signed-in founder.
 */
router.delete('/:id', ...founder, deletePitch)

/**
 * POST /api/v1/pitches/:id/publish
 * Publish a complete draft. Requires a verified email.
 */
router.post('/:id/publish', ...founder, publishPitch)

/**
 * POST /api/v1/pitches/:id/images
 * Upload up to 5 images for a pitch.
 */
router.post('/:id/images', ...founder, receiveImages, addImages)

/**
 * DELETE /api/v1/pitches/:id/images
 * Body: { url }. Remove one image.
 */
router.delete('/:id/images', ...founder, removeImage)

export default router
