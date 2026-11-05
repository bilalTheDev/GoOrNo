import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { api, googleAuthUrl } from '../api/client.js'
import { Button, TextField } from '../components/FormControls.jsx'
import { useAuthStore } from '../store/authStore.js'

const googleErrors = {
  google_unavailable: "Google sign-in isn't configured yet. Use email and password.",
  google_failed: 'Google sign-in did not finish. Try again or use email and password.',
}

export default function LoginPage() {
  const status = useAuthStore((state) => state.status)
  const setSession = useAuthStore((state) => state.setSession)
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [form, setForm] = useState({ email: '', password: '' })
  const googleMessage = googleErrors[params.get('error')] || ''

  const login = useMutation({
    mutationFn: () => api('/api/v1/auth/login', { method: 'POST', body: form }),
    onSuccess: (data) => {
      setSession(data.user, data.accessToken)
      navigate('/account')
    },
  })

  if (status === 'authenticated') return <Navigate to="/account" replace />

  function update(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  return (
    <main className="mx-auto max-w-lg px-6 pb-16">
      <h1 className="font-serif text-4xl">Sign in</h1>
      <p className="mt-2 text-sm text-[#3f3a34]">
        New here?{' '}
        <Link to="/register?role=user" className="underline">
          Create an account
        </Link>
      </p>
      <form
        className="mt-8 space-y-4"
        onSubmit={(event) => {
          event.preventDefault()
          login.mutate()
        }}
      >
        <TextField
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          value={form.email}
          onChange={update}
          required
        />
        <TextField
          label="Password"
          name="password"
          type="password"
          autoComplete="current-password"
          value={form.password}
          onChange={update}
          required
        />
        {googleMessage ? <p className="text-sm text-[#9a3412]">{googleMessage}</p> : null}
        {login.isError ? (
          <p className="text-sm text-[#9a3412]">{login.error.message}</p>
        ) : null}
        <Button type="submit" disabled={login.isPending}>
          {login.isPending ? 'Signing in…' : 'Sign in'}
        </Button>
        <a
          href={googleAuthUrl('user')}
          className="ml-3 inline-flex rounded-full border border-[#e4dccf] bg-white px-4 py-2.5 text-sm font-semibold"
        >
          Continue with Google
        </a>
      </form>
    </main>
  )
}
