import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { api } from '../api/client.js'
import { CATEGORIES } from '../constants/categories.js'

const sorts = [
  { id: 'newest', label: 'Newest' },
  { id: 'trending', label: 'Trending' },
  { id: 'top', label: 'Top' },
]

export default function ExplorePage() {
  const [params, setParams] = useSearchParams()
  const page = Math.max(1, Number(params.get('page')) || 1)
  const category = params.get('category') || ''
  const sort = params.get('sort') || 'newest'
  const q = params.get('q') || ''
  const [draftQuery, setDraftQuery] = useState(q)

  const feed = useQuery({
    queryKey: ['pitches', page, category, sort, q],
    queryFn: () => {
      const search = new URLSearchParams({ page: String(page), sort })
      if (category) search.set('category', category)
      if (q) search.set('q', q)
      return api(`/api/v1/pitches?${search.toString()}`)
    },
  })

  function update(next) {
    const following = { page: '1', sort, category, q, ...next }
    const search = new URLSearchParams()
    if (following.page !== '1') search.set('page', following.page)
    if (following.sort && following.sort !== 'newest') search.set('sort', following.sort)
    if (following.category) search.set('category', following.category)
    if (following.q) search.set('q', following.q)
    setParams(search)
  }

  const pitches = feed.data?.pitches || []

  return (
    <main className="mx-auto max-w-5xl px-6 pb-16">
      <p className="text-xs font-semibold tracking-[0.16em] text-[#6b645b] uppercase">
        Explore
      </p>
      <h1 className="mt-2 font-serif text-5xl">Ideas waiting for a vote</h1>
      <form
        className="mt-6 flex flex-wrap gap-3"
        onSubmit={(event) => {
          event.preventDefault()
          update({ q: draftQuery.trim(), page: '1' })
        }}
      >
        <input
          value={draftQuery}
          onChange={(event) => setDraftQuery(event.target.value)}
          placeholder="Search pitches"
          className="min-w-56 flex-1 rounded-xl border border-[#e4dccf] bg-white px-3 py-2.5"
          aria-label="Search pitches"
        />
        <select
          value={category}
          onChange={(event) => update({ category: event.target.value, page: '1' })}
          className="rounded-xl border border-[#e4dccf] bg-white px-3 py-2.5"
          aria-label="Category"
        >
          <option value="">All categories</option>
          {CATEGORIES.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
        <select
          value={sort}
          onChange={(event) => update({ sort: event.target.value, page: '1' })}
          className="rounded-xl border border-[#e4dccf] bg-white px-3 py-2.5"
          aria-label="Sort"
        >
          {sorts.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="rounded-full bg-[#1c1915] px-4 py-2.5 text-sm font-semibold text-[#fffdf8]"
        >
          Search
        </button>
      </form>

      {feed.isLoading ? <p className="mt-8 text-sm">Loading pitches…</p> : null}
      {feed.isError ? (
        <p className="mt-8 text-sm text-[#9a3412]">{feed.error.message}</p>
      ) : null}

      {feed.isSuccess && pitches.length === 0 ? (
        <p className="mt-10 max-w-md text-sm leading-6">
          No live pitches match that filter yet. Founders can publish one from New pitch.
        </p>
      ) : null}

      <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {pitches.map((pitch) => (
          <Link
            key={pitch.id}
            to={`/pitches/${pitch.id}`}
            className="overflow-hidden rounded-3xl border border-[#e4dccf] bg-[#fffdf8]"
          >
            {pitch.images[0] ? (
              <img
                src={pitch.images[0].url}
                alt=""
                className="h-40 w-full object-cover"
              />
            ) : (
              <div className="flex h-40 items-end bg-[#e7f3ec] p-4 text-sm font-semibold text-[#0f7a45]">
                {pitch.category || 'Uncategorized'}
              </div>
            )}
            <div className="p-4">
              <p className="text-xs font-semibold tracking-wide text-[#6b645b] uppercase">
                {pitch.category || 'Draft category'}
              </p>
              <h2 className="mt-1 font-serif text-2xl leading-tight">{pitch.title}</h2>
              <p className="mt-2 line-clamp-3 text-sm text-[#3f3a34]">{pitch.tagline}</p>
              <p className="mt-4 text-xs text-[#6b645b]">
                {pitch.founder.name} · {pitch.votes.up} Go · {pitch.votes.down} No
              </p>
            </div>
          </Link>
        ))}
      </section>

      {feed.data && feed.data.totalPages > 1 ? (
        <div className="mt-8 flex items-center gap-3 text-sm">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => update({ page: String(page - 1) })}
            className="rounded-full border border-[#e4dccf] bg-white px-4 py-2 disabled:opacity-50"
          >
            Previous
          </button>
          <span>
            Page {feed.data.page} of {feed.data.totalPages}
          </span>
          <button
            type="button"
            disabled={page >= feed.data.totalPages}
            onClick={() => update({ page: String(page + 1) })}
            className="rounded-full border border-[#e4dccf] bg-white px-4 py-2 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      ) : null}
    </main>
  )
}
