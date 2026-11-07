import mongoose from 'mongoose'
import { CATEGORIES } from '../constants/categories.js'

const pitchSchema = new mongoose.Schema(
  {
    founderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true },
    tagline: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    category: { type: String, enum: ['', ...CATEGORIES], default: '' },
    images: [
      {
        url: { type: String, required: true },
        publicId: { type: String, default: '' },
      },
    ],
    priceHint: { type: String, default: '' },
    status: {
      type: String,
      enum: ['draft', 'live', 'closed', 'launched'],
      default: 'draft',
      index: true,
    },
    votes: {
      up: { type: Number, default: 0 },
      down: { type: Number, default: 0 },
    },
    voterIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    commentCount: { type: Number, default: 0 },
    preBookingEnabled: { type: Boolean, default: false },
    preBookingGoalCount: { type: Number, default: 0 },
    preBookingPrice: { type: Number, default: 0 },
    preBookingCount: { type: Number, default: 0 },
    launchDate: { type: Date, default: null },
  },
  { timestamps: true },
)

pitchSchema.index({ status: 1, createdAt: -1 })

export default mongoose.model('Pitch', pitchSchema)
