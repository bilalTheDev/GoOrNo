const apiOrigin = import.meta.env.VITE_API_URL || 'http://localhost:5000'

let readAccessToken = () => ''

export function bindAccessToken(reader) {
  readAccessToken = reader
}

export function googleAuthUrl(intent = 'user') {
  const safeIntent = ['user', 'founder', 'both'].includes(intent) ? intent : 'user'
  return `${apiOrigin}/api/v1/auth/google?intent=${safeIntent}`
}

export class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.status = status
  }
}

export async function api(path, { method = 'GET', body, auth = false } = {}) {
  const headers = {}
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  if (auth) {
    const token = readAccessToken()
    if (token) headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(path, {
    method,
    headers,
    credentials: 'include',
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  const payload = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new ApiError(payload.message || 'Request failed.', response.status)
  }
  return payload
}

const verifyRequests = new Map()

export function verifyEmail(token) {
  if (!verifyRequests.has(token)) {
    verifyRequests.set(
      token,
      api('/api/v1/auth/verify-email', { method: 'POST', body: { token } }),
    )
  }
  return verifyRequests.get(token)
}
