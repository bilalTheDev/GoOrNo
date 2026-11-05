import cookieParser from 'cookie-parser'
import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import passport from 'passport'
import { clientUrl } from './config/auth.js'
import { connectDB } from './config/db.js'
import { configurePassport } from './config/passport.js'
import authRouter from './routes/auth.routes.js'
import healthRouter from './routes/health.routes.js'
import userRouter from './routes/user.routes.js'

dotenv.config()

const requiredEnv = ['MONGODB_URI', 'ACCESS_TOKEN_SECRET', 'REFRESH_TOKEN_SECRET']
for (const key of requiredEnv) {
  if (!process.env[key]) {
    console.error(`Missing ${key}. Add it to server/.env`)
    process.exit(1)
  }
}

const app = express()
const port = Number(process.env.PORT) || 5000

configurePassport()

app.use(
  cors({
    origin: clientUrl(),
    credentials: true,
  }),
)
app.use(express.json())
app.use(cookieParser())
app.use(passport.initialize())

app.use('/api/v1/health', healthRouter)
app.use('/api/v1/auth', authRouter)
app.use('/api/v1/users', userRouter)

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' })
})

app.use((error, req, res, next) => {
  if (res.headersSent) return next(error)
  console.error(error)
  return res.status(500).json({ success: false, message: 'Something went wrong.' })
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
