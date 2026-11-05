import mongoose from 'mongoose'

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, select: false },
    avatar: { type: String, default: '' },
    bio: { type: String, default: '' },
    roles: {
      type: [{ type: String, enum: ['user', 'founder'] }],
      required: true,
      validate: {
        validator: (roles) => Array.isArray(roles) && roles.length > 0,
        message: 'At least one role is required',
      },
    },
    founderProfile: {
      companyName: { type: String, default: '' },
      website: { type: String, default: '' },
      verified: { type: Boolean, default: false },
    },
    followersCount: { type: Number, default: 0 },
    emailVerified: { type: Boolean, default: false },
    emailVerificationTokenHash: { type: String, select: false },
    emailVerificationExpires: { type: Date, select: false },
    googleId: { type: String, unique: true, sparse: true },
    refreshTokenHash: { type: String, select: false },
  },
  { timestamps: true },
)

userSchema.methods.toPublic = function toPublic() {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    avatar: this.avatar || '',
    bio: this.bio || '',
    roles: this.roles,
    founderProfile: {
      companyName: this.founderProfile?.companyName || '',
      website: this.founderProfile?.website || '',
      verified: Boolean(this.founderProfile?.verified),
    },
    followersCount: this.followersCount || 0,
    emailVerified: Boolean(this.emailVerified),
    createdAt: this.createdAt,
  }
}

export default mongoose.model('User', userSchema)
