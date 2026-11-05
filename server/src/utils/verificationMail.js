import { clientUrl } from '../config/auth.js'

/**
 * No email provider is configured in v1. The verification link is printed
 * in the API console so the flow can be completed locally.
 */
export function logVerificationLink(email, token) {
  const link = `${clientUrl()}/verify-email?token=${token}`
  console.log(`\nVerification link for ${email}:\n${link}\n`)
}
