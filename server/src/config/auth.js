export function accessTokenTtl() {
  return process.env.ACCESS_TOKEN_TTL || '15m'
}

export function refreshTokenDays() {
  const days = Number(process.env.REFRESH_TOKEN_DAYS || 7)
  if (!Number.isFinite(days) || days < 1 || days > 30) return 7
  return days
}

export function clientUrl() {
  return process.env.CLIENT_URL || 'http://localhost:5173'
}

export function rolesFromIntent(intent) {
  if (intent === 'both') return ['user', 'founder']
  if (intent === 'founder') return ['founder']
  return ['user']
}
