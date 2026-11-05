import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../api/client.js'
import { Button } from '../components/FormControls.jsx'
import { useAuthStore } from '../store/authStore.js'

const roleLabels = { user: 'Backer', founder: 'Founder' }

export default function AccountPage() {
  const setSession = useAuthStore((state) => state.setSession)
  const accessToken = useAuthStore((state) => state.accessToken)
  const queryClient = useQueryClient()

  const me = useQuery({
    queryKey: ['me'],
    enabled: Boolean(accessToken),
    queryFn: async () => {
      const data = await api('/api/v1/users/me', { auth: true })
      setSession(data.user, accessToken)
      return data.user
    },
  })

  const resend = useMutation({
    mutationFn: () =>
      api('/api/v1/auth/verification-email', { method: 'POST', auth: true, body: {} }),
  })

  const founder = useMutation({
    mutationFn: () =>
      api('/api/v1/users/me/founder', { method: 'POST', auth: true, body: {} }),
    onSuccess: (data) => {
      setSession(data.user, data.accessToken)
      queryClient.setQueryData(['me'], data.user)
    },
  })

  const user = me.data

  return (
    <main className="mx-auto max-w-lg px-6 pb-16">
      <h1 className="font-serif text-4xl">Your account</h1>
      {me.isLoading ? <p className="mt-4 text-sm">Loading your profile…</p> : null}
      {me.isError ? (
        <p className="mt-4 text-sm text-[#9a3412]">{me.error.message}</p>
      ) : null}
      {user ? (
        <section className="mt-6 rounded-3xl border border-[#e4dccf] bg-[#fffdf8] p-5">
          <h2 className="font-serif text-2xl">{user.name}</h2>
          <p className="mt-1 text-sm text-[#3f3a34]">{user.email}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {user.roles.map((role) => (
              <span
                key={role}
                className="rounded-full bg-[#e5f6ec] px-3 py-1 text-xs font-semibold text-[#0f7a45]"
              >
                {roleLabels[role] || role}
              </span>
            ))}
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                user.emailVerified
                  ? 'bg-[#e5f6ec] text-[#0f7a45]'
                  : 'bg-[#fde8e1] text-[#9a3412]'
              }`}
            >
              {user.emailVerified ? 'Email verified' : 'Email not verified'}
            </span>
          </div>
          {user.emailVerified ? null : (
            <div className="mt-4">
              <p className="text-sm">
                Verify your email before a founder pitch can go live.
              </p>
              <Button
                className="mt-3"
                onClick={() => resend.mutate()}
                disabled={resend.isPending}
              >
                {resend.isPending ? 'Sending…' : 'Send a new link'}
              </Button>
              {resend.isSuccess ? (
                <p className="mt-2 text-sm">{resend.data.message}</p>
              ) : null}
            </div>
          )}
          {user.roles.includes('founder') ? null : (
            <div className="mt-5 border-t border-[#efe8dc] pt-4">
              <p className="text-sm">
                Want to post a pitch later? Add the founder role to this account.
              </p>
              <Button
                className="mt-3"
                variant="ghost"
                onClick={() => founder.mutate()}
                disabled={founder.isPending}
              >
                {founder.isPending ? 'Updating…' : 'Become a Founder'}
              </Button>
            </div>
          )}
        </section>
      ) : null}
    </main>
  )
}
