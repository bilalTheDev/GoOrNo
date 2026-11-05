import { useMutation } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { Link, Navigate, useSearchParams } from 'react-router-dom'
import { api, googleAuthUrl } from '../api/client.js'
import { Button, TextField } from '../components/FormControls.jsx'
import { useAuthStore } from '../store/authStore.js'

const choices = [
  { id: 'user', label: "I'm here to vote/back ideas" },
  { id: 'founder', label: "I'm launching a product" },
  { id: 'both', label: 'I want to do both' },
]

function rolesFor(choice) {
  if (choice === 'both') return ['user', 'founder']
  return [choice]
}

export default function RegisterPage() {
  const status = useAuthStore((state) => state.status)
  const [params] = useSearchParams()
  const preset = ['user', 'founder', 'both'].includes(params.get('role'))
    ? params.get('role')
    : 'user'
  const [choice, setChoice] = useState(preset)
  const [form, setForm] = useState({ name: '', email: '', password: '' })

  useEffect(() => {
    setChoice(preset)
  }, [preset])

  const register = useMutation({
    mutationFn: () =>
      api('/api/v1/auth/register', {
        method: 'POST',
        body: { ...form, roles: rolesFor(choice) },
      }),
  })

  if (status === 'authenticated') return <Navigate to="/account" replace />

  function update(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  return (
    <main className="mx-auto max-w-lg px-6 pb-16">
      <h1 className="font-serif text-4xl">Create your account</h1>
      <p className="mt-2 text-sm text-[#3f3a34]">
        Already have one?{' '}
        <Link to="/login" className="underline">
          Sign in
        </Link>
      </p>

      {register.isSuccess ? (
        <section className="mt-8 rounded-3xl border border-[#e4dccf] bg-[#fffdf8] p-5">
          <h2 className="font-serif text-2xl">Check the API console</h2>
          <p className="mt-2 text-sm leading-6">{register.data.message}</p>
          <Link to="/login" className="mt-4 inline-block text-sm font-semibold underline">
            Continue to sign in
          </Link>
        </section>
      ) : (
        <form
          className="mt-8 space-y-4"
          onSubmit={(event) => {
            event.preventDefault()
            register.mutate()
          }}
        >
          <fieldset className="space-y-2">
            <legend className="mb-2 text-sm font-medium">I am joining as</legend>
            {choices.map((option) => (
              <label
                key={option.id}
                className={`flex cursor-pointer items-center gap-3 rounded-2xl border px-3 py-3 ${
                  choice === option.id
                    ? 'border-[#0f7a45] bg-[#e5f6ec]'
                    : 'border-[#e4dccf] bg-[#fffdf8]'
                }`}
              >
                <input
                  type="radio"
                  name="role"
                  value={option.id}
                  checked={choice === option.id}
                  onChange={() => setChoice(option.id)}
                />
                <span className="text-sm">{option.label}</span>
              </label>
            ))}
          </fieldset>
          <TextField
            label="Name"
            name="name"
            value={form.name}
            onChange={update}
            required
          />
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
            autoComplete="new-password"
            minLength={8}
            value={form.password}
            onChange={update}
            required
          />
          {register.isError ? (
            <p className="text-sm text-[#9a3412]">{register.error.message}</p>
          ) : null}
          <Button type="submit" disabled={register.isPending}>
            {register.isPending ? 'Creating account…' : 'Create account'}
          </Button>
          <a
            href={googleAuthUrl(choice)}
            className="ml-3 inline-flex rounded-full border border-[#e4dccf] bg-white px-4 py-2.5 text-sm font-semibold"
          >
            Continue with Google
          </a>
        </form>
      )}
    </main>
  )
}
