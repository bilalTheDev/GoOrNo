import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import User from '../models/User.js'

export function googleAuthEnabled() {
  return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET)
}

export function configurePassport() {
  if (!googleAuthEnabled()) return

  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL:
          process.env.GOOGLE_CALLBACK_URL ||
          'http://localhost:5000/api/v1/auth/google/callback',
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value?.toLowerCase()
          if (!email) return done(null, false)

          let user = await User.findOne({ $or: [{ googleId: profile.id }, { email }] })
          if (!user) {
            user = await User.create({
              name: profile.displayName || 'GoOrNo member',
              email,
              googleId: profile.id,
              avatar: profile.photos?.[0]?.value || '',
              roles: ['user'],
              emailVerified: true,
            })
            user.$locals.created = true
          } else {
            user.googleId = profile.id
            user.emailVerified = true
            if (!user.avatar && profile.photos?.[0]?.value) {
              user.avatar = profile.photos[0].value
            }
            await user.save()
            user.$locals.created = false
          }

          return done(null, user)
        } catch (error) {
          return done(error)
        }
      },
    ),
  )
}
