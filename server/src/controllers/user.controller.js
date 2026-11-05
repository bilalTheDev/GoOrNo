import User from '../models/User.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { signAccessToken } from '../utils/tokens.js'

/**
 * Returns the signed-in user's public profile.
 */
export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.auth.userId)
  if (!user) {
    return res.status(401).json({ success: false, message: 'Sign in required.' })
  }

  return res.json({ success: true, user: user.toPublic() })
})

/**
 * Adds the founder role without creating a second account.
 */
export const becomeFounder = asyncHandler(async (req, res) => {
  const user = await User.findById(req.auth.userId)
  if (!user) {
    return res.status(401).json({ success: false, message: 'Sign in required.' })
  }

  if (!user.roles.includes('founder')) {
    user.roles.push('founder')
    await user.save()
  }

  return res.json({
    success: true,
    accessToken: signAccessToken(user),
    user: user.toPublic(),
  })
})
