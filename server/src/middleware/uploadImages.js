import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import multer from 'multer'

export const uploadDir = path.resolve('uploads')
fs.mkdirSync(uploadDir, { recursive: true })

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase()
    cb(null, `${crypto.randomBytes(16).toString('hex')}${ext}`)
  },
})

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024, files: 5 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (allowed.includes(file.mimetype)) cb(null, true)
    else cb(new Error('Only JPEG, PNG, WEBP, and GIF images are allowed.'))
  },
})

export function receiveImages(req, res, next) {
  upload.array('images', 5)(req, res, (error) => {
    if (!error) return next()
    const message =
      error.code === 'LIMIT_FILE_SIZE'
        ? 'Each image must be 5 MB or smaller.'
        : error.message || 'Could not upload that image.'
    return res.status(400).json({ success: false, message })
  })
}
