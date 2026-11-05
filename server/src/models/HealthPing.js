import mongoose from 'mongoose'

const healthPingSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
    },
    message: {
      type: String,
      required: true,
    },
    count: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
)

export default mongoose.model('HealthPing', healthPingSchema)
