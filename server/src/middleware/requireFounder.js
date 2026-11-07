import User from '../models/User.js'
import { asyncHandler } from '../utils/asyncHandler.js'

export const requireFounder = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.auth.userId)
  if (!user) {
    return res.status(401).json({ success: false, message: 'Sign in required.' })
  }
  if (!user.roles.includes('founder')) {
    return res.status(403).json({ success: false, message: 'Only founders can do that.' })
  }
  req.user = user
  return next()
})
