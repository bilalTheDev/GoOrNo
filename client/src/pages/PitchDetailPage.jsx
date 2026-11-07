import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../api/client.js'
import { useAuthStore } from '../store/authStore.js'

export default function PitchDetailPage() {
  const { id } = useParams()
  const accessToken = useAuthStore((state) => state.accessToken)
  const user = useAuthStore((state) => state.user)
  const [active, setActive] = useState(0)

  const pitchQuery = useQuery({
    queryKey: ['pitch', id],
    queryFn: () => api(`/api/v1/pitches/${id}`, { auth: Boolean(accessToken) }),
  })

  const pitch = pitchQuery.data?.pitch
  const image = pitch?.images?.[active] || pitch?.images?.[0]
  const owns = user && pitch && String(user.id) === String(pitch.founder.id)

  return (
    <main className="mx-auto max-w-3xl px-6 pb-16">
      {pitchQuery.isLoading ? <p className="text-sm">Loading pitch…</p> : null}
      {pitchQuery.isError ? (
        <p className="text-sm text-[#9a3412]">{pitchQuery.error.message}</p>
      ) : null}
      {pitch ? (
        <>
          <p className="text-xs font-semibold tracking-[0.16em] text-[#6b645b] uppercase">
            {pitch.category || 'Uncategorized'} · {pitch.status}
          </p>
          <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
            <h1 className="font-serif text-5xl leading-none">{pitch.title}</h1>
            {owns ? (
              <Link
                to={`/pitches/${pitch.id}/edit`}
                className="rounded-full border border-[#e4dccf] bg-white px-4 py-2 text-sm font-semibold"
              >
                Edit
              </Link>
            ) : null}
          </div>
          <p className="mt-4 text-lg text-[#3f3a34]">{pitch.tagline}</p>
          <p className="mt-2 text-sm text-[#6b645b]">
            {pitch.founder.name}
            {pitch.founder.companyName ? ` · ${pitch.founder.companyName}` : ''} ·{' '}
            {pitch.votes.up} Go · {pitch.votes.down} No
          </p>

          {image ? (
            <img
              src={image.url}
              alt=""
              className="mt-6 aspect-[16/10] w-full rounded-3xl object-cover"
            />
          ) : (
            <div className="mt-6 flex aspect-[16/10] items-end rounded-3xl bg-[#e7f3ec] p-6 text-[#0f7a45]">
              No mockups yet
            </div>
          )}
          {pitch.images.length > 1 ? (
            <div className="mt-3 flex gap-2">
              {pitch.images.map((item, index) => (
                <button
                  key={item.url}
                  type="button"
                  onClick={() => setActive(index)}
                  className="overflow-hidden rounded-xl"
                >
                  <img
                    src={item.url}
                    alt=""
                    className={`h-16 w-20 object-cover ${index === active ? 'ring-2 ring-[#0f7a45]' : ''}`}
                  />
                </button>
              ))}
            </div>
          ) : null}

          {pitch.priceHint ? (
            <p className="mt-6 text-sm font-semibold">Price hint · {pitch.priceHint}</p>
          ) : null}
          <div className="mt-6 space-y-4 text-base leading-7">
            {pitch.description.split(/\n{2,}/).map((paragraph) => (
              <p key={paragraph.slice(0, 40)} className="whitespace-pre-wrap">
                {paragraph}
              </p>
            ))}
          </div>
        </>
      ) : null}
    </main>
  )
}
