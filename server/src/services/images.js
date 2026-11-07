import fs from 'fs/promises'
import path from 'path'
import { v2 as cloudinary } from 'cloudinary'
import { uploadDir } from '../middleware/uploadImages.js'

export function cloudinaryEnabled() {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET,
  )
}

function configureCloudinary() {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  })
}

function publicBase() {
  return process.env.API_PUBLIC_URL || `http://localhost:${process.env.PORT || 5000}`
}

export async function storeImage(file) {
  if (cloudinaryEnabled()) {
    configureCloudinary()
    const result = await cloudinary.uploader.upload(file.path, {
      folder: 'goorno/pitches',
    })
    await fs.unlink(file.path).catch(() => {})
    return { url: result.secure_url, publicId: result.public_id }
  }

  return {
    url: `${publicBase()}/uploads/${file.filename}`,
    publicId: '',
  }
}

export async function removeStoredImage(image) {
  if (!image) return
  if (image.publicId && cloudinaryEnabled()) {
    configureCloudinary()
    await cloudinary.uploader.destroy(image.publicId)
    return
  }

  const marker = '/uploads/'
  const index = image.url?.lastIndexOf(marker) ?? -1
  if (index === -1) return
  const filename = image.url.slice(index + marker.length)
  if (
    !filename ||
    filename.includes('..') ||
    filename.includes('/') ||
    filename.includes('\\')
  ) {
    return
  }
  await fs.unlink(path.join(uploadDir, filename)).catch(() => {})
}
