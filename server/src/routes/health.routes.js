import { Router } from 'express'
import mongoose from 'mongoose'
import HealthPing from '../models/HealthPing.js'

const router = Router()

/**
 * GET /api/v1/health
 * Confirms the API process is up and that MongoDB can read and write.
 * Upserts one pipeline document so repeated checks do not grow the collection.
 */
router.get('/', async (req, res) => {
  try {
    const ping = await HealthPing.findOneAndUpdate(
      { key: 'pipeline' },
      {
        $set: { message: 'Hello from GoOrNo' },
        $inc: { count: 1 },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    )

    res.status(200).json({
      success: true,
      service: 'goorno-api',
      status: 'ok',
      database: {
        connected: mongoose.connection.readyState === 1,
        name: mongoose.connection.name,
      },
      ping: {
        id: ping._id,
        message: ping.message,
        count: ping.count,
        updatedAt: ping.updatedAt,
      },
    })
  } catch {
    res.status(503).json({
      success: false,
      service: 'goorno-api',
      status: 'degraded',
      message: 'Database read/write failed',
    })
  }
})

export default router
