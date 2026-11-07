import mongoose from 'mongoose'
import { CATEGORIES } from '../constants/categories.js'
import Pitch from '../models/Pitch.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { presentPitch } from '../utils/presentPitch.js'
import { removeStoredImage, storeImage } from '../services/images.js'
import { publishError, validateCreate, validatePatch } from '../validators/pitch.js'

const founderFields = 'name avatar founderProfile'
const publicStatuses = ['live', 'closed', 'launched']

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function sortFor(sort) {
  if (sort === 'top') return { 'votes.up': -1, createdAt: -1 }
  if (sort === 'trending') return { 'votes.up': -1, 'votes.down': 1, createdAt: -1 }
  return { createdAt: -1 }
}

async function ownedPitch(req, res) {
  if (!mongoose.isValidObjectId(req.params.id)) {
    res.status(404).json({ success: false, message: 'Pitch not found.' })
    return null
  }
  const pitch = await Pitch.findById(req.params.id)
  if (!pitch || String(pitch.founderId) !== String(req.user._id)) {
    res.status(404).json({ success: false, message: 'Pitch not found.' })
    return null
  }
  return pitch
}

/**
 * POST /api/v1/pitches
 * Founder creates a draft from a title and tagline.
 */
export const createPitch = asyncHandler(async (req, res) => {
  const { errors, value } = validateCreate(req.body)
  if (errors.length) return res.status(400).json({ success: false, message: errors[0] })

  const pitch = await Pitch.create({
    founderId: req.user._id,
    title: value.title,
    tagline: value.tagline,
  })
  await pitch.populate('founderId', founderFields)
  return res.status(201).json({ success: true, pitch: presentPitch(pitch) })
})

/**
 * GET /api/v1/pitches
 * Public paginated list of pitches that are no longer drafts.
 * Query: page, limit, category, sort=newest|top|trending, q
 */
export const listPitches = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1)
  const limit = Math.min(24, Math.max(1, Number(req.query.limit) || 9))
  const filter = { status: { $in: publicStatuses } }

  if (req.query.category && CATEGORIES.includes(req.query.category)) {
    filter.category = req.query.category
  }

  const q = String(req.query.q || '')
    .trim()
    .slice(0, 80)
  if (q) {
    const pattern = new RegExp(escapeRegex(q), 'i')
    filter.$or = [{ title: pattern }, { tagline: pattern }]
  }

  const [total, pitches] = await Promise.all([
    Pitch.countDocuments(filter),
    Pitch.find(filter)
      .sort(sortFor(req.query.sort))
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('founderId', founderFields),
  ])

  return res.json({
    success: true,
    pitches: pitches.map((pitch) => presentPitch(pitch, { summary: true })),
    page,
    limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / limit)),
    categories: CATEGORIES,
  })
})

/**
 * GET /api/v1/pitches/mine
 * Drafts and published pitches owned by the signed-in founder.
 */
export const listMine = asyncHandler(async (req, res) => {
  const pitches = await Pitch.find({ founderId: req.user._id })
    .sort({ updatedAt: -1 })
    .populate('founderId', founderFields)

  return res.json({
    success: true,
    pitches: pitches.map((pitch) => presentPitch(pitch)),
  })
})

/**
 * GET /api/v1/pitches/:id
 * Public for live, closed, and launched pitches. Drafts are visible to the owner.
 */
export const getPitch = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(404).json({ success: false, message: 'Pitch not found.' })
  }

  const pitch = await Pitch.findById(req.params.id).populate('founderId', founderFields)
  if (!pitch) return res.status(404).json({ success: false, message: 'Pitch not found.' })

  const isOwner =
    req.auth && String(pitch.founderId?._id || pitch.founderId) === req.auth.userId
  if (!publicStatuses.includes(pitch.status) && !isOwner) {
    return res.status(404).json({ success: false, message: 'Pitch not found.' })
  }

  return res.json({ success: true, pitch: presentPitch(pitch) })
})

/**
 * PATCH /api/v1/pitches/:id
 * Founder updates their own pitch. Status changes go through publish.
 */
export const updatePitch = asyncHandler(async (req, res) => {
  const pitch = await ownedPitch(req, res)
  if (!pitch) return undefined

  const { errors, value } = validatePatch(req.body)
  if (errors.length) return res.status(400).json({ success: false, message: errors[0] })

  Object.assign(pitch, value)
  await pitch.save()
  await pitch.populate('founderId', founderFields)
  return res.json({ success: true, pitch: presentPitch(pitch) })
})

/**
 * DELETE /api/v1/pitches/:id
 * Founder deletes their own pitch and its stored images.
 */
export const deletePitch = asyncHandler(async (req, res) => {
  const pitch = await ownedPitch(req, res)
  if (!pitch) return undefined
  await Promise.all(pitch.images.map((image) => removeStoredImage(image)))
  await pitch.deleteOne()
  return res.json({ success: true })
})

/**
 * POST /api/v1/pitches/:id/publish
 * Moves a draft live. The founder's email must already be verified.
 */
export const publishPitch = asyncHandler(async (req, res) => {
  const pitch = await ownedPitch(req, res)
  if (!pitch) return undefined

  if (!req.user.emailVerified) {
    return res.status(403).json({
      success: false,
      message: 'Verify your email before publishing a pitch.',
    })
  }

  const problem = publishError(pitch)
  if (problem) return res.status(400).json({ success: false, message: problem })

  if (pitch.status === 'draft') pitch.status = 'live'
  await pitch.save()
  await pitch.populate('founderId', founderFields)
  return res.json({ success: true, pitch: presentPitch(pitch) })
})

/**
 * POST /api/v1/pitches/:id/images
 * Multipart field "images". Stores files on Cloudinary when configured, otherwise locally.
 */
export const addImages = asyncHandler(async (req, res) => {
  const pitch = await ownedPitch(req, res)
  if (!pitch) return undefined

  const files = req.files || []
  if (files.length === 0) {
    return res.status(400).json({ success: false, message: 'Choose at least one image.' })
  }
  if (pitch.images.length + files.length > 5) {
    return res
      .status(400)
      .json({ success: false, message: 'A pitch can have up to 5 images.' })
  }

  const stored = []
  for (const file of files) {
    stored.push(await storeImage(file))
  }
  pitch.images.push(...stored)
  await pitch.save()
  await pitch.populate('founderId', founderFields)
  return res.json({ success: true, pitch: presentPitch(pitch) })
})

/**
 * DELETE /api/v1/pitches/:id/images
 * Body: { url }. Removes one image from the pitch.
 */
export const removeImage = asyncHandler(async (req, res) => {
  const pitch = await ownedPitch(req, res)
  if (!pitch) return undefined

  const url = String(req.body?.url || '')
  const image = pitch.images.find((item) => item.url === url)
  if (!image) return res.status(404).json({ success: false, message: 'Image not found.' })

  await removeStoredImage(image)
  pitch.images = pitch.images.filter((item) => item.url !== url)
  await pitch.save()
  await pitch.populate('founderId', founderFields)
  return res.json({ success: true, pitch: presentPitch(pitch) })
})
