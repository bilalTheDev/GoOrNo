const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function validateRegister(body) {
  const name = String(body?.name || '').trim()
  const email = String(body?.email || '')
    .trim()
    .toLowerCase()
  const password = String(body?.password || '')
  const roles = Array.isArray(body?.roles) ? [...new Set(body.roles)] : []
  const errors = []

  if (name.length < 2 || name.length > 80) {
    errors.push('Name must be 2–80 characters.')
  }

  if (!emailPattern.test(email)) {
    errors.push('Enter a valid email.')
  }

  if (password.length < 8 || password.length > 72) {
    errors.push('Password must be 8–72 characters.')
  }

  const allowed = new Set(['user', 'founder'])
  if (roles.length === 0 || roles.some((role) => !allowed.has(role))) {
    errors.push('Choose a valid account type.')
  }

  return { errors, value: { name, email, password, roles } }
}

export function validateLogin(body) {
  const email = String(body?.email || '')
    .trim()
    .toLowerCase()
  const password = String(body?.password || '')
  if (!email || !password) {
    return { errors: ['Email and password are required.'], value: { email, password } }
  }
  return { errors: [], value: { email, password } }
}
