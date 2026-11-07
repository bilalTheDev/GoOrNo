import { CATEGORIES } from '../constants/categories.js'

export function validateCreate(body) {
  const title = String(body?.title || '').trim()
  const tagline = String(body?.tagline || '').trim()
  const errors = []

  if (title.length < 4 || title.length > 120) {
    errors.push('Title must be 4–120 characters.')
  }
  if (tagline.length < 8 || tagline.length > 160) {
    errors.push('Tagline must be 8–160 characters.')
  }

  return { errors, value: { title, tagline } }
}

export function validatePatch(body) {
  const value = {}
  const errors = []

  if (body?.title !== undefined) {
    const title = String(body.title).trim()
    if (title.length < 4 || title.length > 120)
      errors.push('Title must be 4–120 characters.')
    else value.title = title
  }

  if (body?.tagline !== undefined) {
    const tagline = String(body.tagline).trim()
    if (tagline.length < 8 || tagline.length > 160) {
      errors.push('Tagline must be 8–160 characters.')
    } else value.tagline = tagline
  }

  if (body?.description !== undefined) {
    const description = String(body.description).trim()
    if (description.length > 8000)
      errors.push('Description must be 8000 characters or fewer.')
    else value.description = description
  }

  if (body?.category !== undefined) {
    const category = String(body.category)
    if (category && !CATEGORIES.includes(category)) errors.push('Choose a category.')
    else value.category = category
  }

  if (body?.priceHint !== undefined) {
    const priceHint = String(body.priceHint).trim()
    if (priceHint.length > 80) errors.push('Price hint must be 80 characters or fewer.')
    else value.priceHint = priceHint
  }

  return { errors, value }
}

export function publishError(pitch) {
  if (!pitch.title || pitch.title.trim().length < 4)
    return 'Add a title before publishing.'
  if (!pitch.tagline || pitch.tagline.trim().length < 8)
    return 'Add a tagline before publishing.'
  if (!pitch.description || pitch.description.trim().length < 20) {
    return 'Add a description of at least 20 characters.'
  }
  if (!CATEGORIES.includes(pitch.category)) return 'Choose a category before publishing.'
  return ''
}
