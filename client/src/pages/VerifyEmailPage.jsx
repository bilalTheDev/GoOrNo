import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { verifyEmail } from '../api/client.js'

export default function VerifyEmailPage() {
  const [params] = useSearchParams()
  const token = params.get('token') || ''
  const [state, setState] = useState({
    status: token ? 'loading' : 'error',
    message: token ? '' : 'This verification link is missing a token.',
  })

  useEffect(() => {
    if (!token) return undefined
    let active = true
    verifyEmail(token)
      .then((data) => {
        if (active) setState({ status: 'success', message: data.message })
      })
      .catch((error) => {
        if (active) setState({ status: 'error', message: error.message })
      })
    return () => {
      active = false
    }
  }, [token])

  return (
    <main className="mx-auto max-w-lg px-6 pb-16">
      <h1 className="font-serif text-4xl">Verify email</h1>
      <p className="mt-4 text-sm leading-6">
        {state.status === 'loading' ? 'Checking your link…' : state.message}
      </p>
      {state.status === 'success' ? (
        <Link to="/login" className="mt-6 inline-block text-sm font-semibold underline">
          Sign in
        </Link>
      ) : null}
    </main>
  )
}
