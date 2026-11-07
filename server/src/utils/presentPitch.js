export function presentPitch(pitch, { summary = false } = {}) {
  const founderDoc = pitch.founderId?.name ? pitch.founderId : null
  const founderId = founderDoc ? founderDoc._id : pitch.founderId
  const payload = {
    id: pitch._id,
    title: pitch.title,
    tagline: pitch.tagline,
    category: pitch.category || '',
    images: (pitch.images || []).map((image) => ({
      url: image.url,
      publicId: image.publicId || '',
    })),
    priceHint: pitch.priceHint || '',
    status: pitch.status,
    votes: {
      up: pitch.votes?.up || 0,
      down: pitch.votes?.down || 0,
    },
    commentCount: pitch.commentCount || 0,
    preBookingEnabled: Boolean(pitch.preBookingEnabled),
    preBookingGoalCount: pitch.preBookingGoalCount || 0,
    preBookingPrice: pitch.preBookingPrice || 0,
    preBookingCount: pitch.preBookingCount || 0,
    launchDate: pitch.launchDate || null,
    createdAt: pitch.createdAt,
    updatedAt: pitch.updatedAt,
    founder: {
      id: founderId,
      name: founderDoc?.name || 'Founder',
      avatar: founderDoc?.avatar || '',
      companyName: founderDoc?.founderProfile?.companyName || '',
    },
  }

  if (!summary) payload.description = pitch.description || ''
  return payload
}
