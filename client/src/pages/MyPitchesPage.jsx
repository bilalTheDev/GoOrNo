import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { api } from '../api/client.js'

export default function MyPitchesPage() {
  const queryClient = useQueryClient()
  const pitches = useQuery({
    queryKey: ['my-pitches'],
    queryFn: () => api('/api/v1/pitches/mine', { auth: true }),
  })

  const remove = useMutation({
    mutationFn: (id) => api(`/api/v1/pitches/${id}`, { method: 'DELETE', auth: true }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['my-pitches'] }),
  })

  return (
    <main className="mx-auto max-w-3xl px-6 pb-16">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold tracking-[0.16em] text-[#6b645b] uppercase">
            Founder
          </p>
          <h1 className="mt-2 font-serif text-5xl">Your pitches</h1>
        </div>
        <Link
          to="/pitches/new"
          className="rounded-full bg-[#1c1915] px-4 py-2.5 text-sm font-semibold text-[#fffdf8]"
        >
          New pitch
        </Link>
      </div>
      {pitches.isLoading ? <p className="mt-8 text-sm">Loading your pitches…</p> : null}
      {pitches.isError ? (
        <p className="mt-8 text-sm text-[#9a3412]">{pitches.error.message}</p>
      ) : null}
      {pitches.data?.pitches?.length === 0 ? (
        <p className="mt-8 text-sm">You have not started a pitch yet.</p>
      ) : null}
      <ul className="mt-8 space-y-3">
        {(pitches.data?.pitches || []).map((pitch) => (
          <li
            key={pitch.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-[#e4dccf] bg-[#fffdf8] p-4"
          >
            <div>
              <p className="text-xs font-semibold tracking-wide text-[#6b645b] uppercase">
                {pitch.status}
              </p>
              <h2 className="font-serif text-2xl">{pitch.title}</h2>
              <p className="text-sm text-[#3f3a34]">{pitch.tagline}</p>
            </div>
            <div className="flex gap-2 text-sm">
              <Link
                to={`/pitches/${pitch.id}`}
                className="rounded-full border border-[#e4dccf] bg-white px-3 py-2"
              >
                View
              </Link>
              <Link
                to={`/pitches/${pitch.id}/edit`}
                className="rounded-full border border-[#e4dccf] bg-white px-3 py-2"
              >
                Edit
              </Link>
              <button
                type="button"
                className="rounded-full px-3 py-2 text-[#9a3412]"
                onClick={() => {
                  if (window.confirm(`Delete “${pitch.title}”?`)) remove.mutate(pitch.id)
                }}
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </main>
  )
}
