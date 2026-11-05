import mongoose from 'mongoose'

mongoose.set('strictQuery', true)

/**
 * Open the MongoDB connection used by the API.
 * @param {string} uri
 */
export async function connectDB(uri) {
  if (!uri) {
    throw new Error('MONGODB_URI is not set')
  }

  await mongoose.connect(uri)
  return mongoose.connection
}
