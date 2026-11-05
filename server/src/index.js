import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import { connectDB } from './config/db.js'
import healthRouter from './routes/health.routes.js'

dotenv.config()

const app = express()
const port = Number(process.env.PORT) || 5000
const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173'

app.use(
  cors({
    origin: clientUrl,
    credentials: true,
  }),
)
app.use(express.json())

app.use('/api/v1/health', healthRouter)

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' })
})

async function start() {
  try {
    const connection = await connectDB(process.env.MONGODB_URI)
    app.listen(port, () => {
      console.log(`GoOrNo API listening on http://localhost:${port}`)
      console.log(`MongoDB connected: ${connection.name}`)
    })
  } catch (error) {
    console.error('Failed to start server:', error.message)
    process.exit(1)
  }
}

start()
