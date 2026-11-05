import { useCallback, useEffect, useState } from 'react'

const apiBase = import.meta.env.VITE_API_URL || ''

function formatTime(value) {
  if (!value) return '—'
  return new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
  }).format(new Date(value))
}

export default function App() {
  const [status, setStatus] = useState('loading')
  const [health, setHealth] = useState(null)
  const [error, setError] = useState('')

  const checkPipeline = useCallback(async () => {
    setStatus('loading')
    setError('')

    try {
      const response = await fetch(`${apiBase}/api/v1/health`)
      const body = await response.json()

      if (!response.ok || !body.success) {
        throw new Error(body.message || 'The API could not confirm the database.')
      }

      setHealth(body)
      setStatus('ok')
    } catch (err) {
      setHealth(null)
      setStatus('error')
      setError(err.message || 'Could not reach the GoOrNo API.')
    }
  }, [])

  useEffect(() => {
    checkPipeline()
  }, [checkPipeline])

  return (
    <main className="page">
      <p className="eyebrow">Phase 0 · pipeline check</p>
      <h1>
        Go<span>Or</span>No
      </h1>
      <p className="tagline">Go or No? Let the market decide before you build.</p>

      <section className="card" aria-live="polite">
        <header className="card-head">
          <h2>Frontend → API → MongoDB</h2>
          <span className={`pill pill-${status}`}>
            {status === 'loading'
              ? 'Checking'
              : status === 'ok'
                ? 'Connected'
                : 'Offline'}
          </span>
        </header>

        {status === 'ok' && health ? (
          <dl>
            <div>
              <dt>Service</dt>
              <dd>{health.service}</dd>
            </div>
            <div>
              <dt>Database</dt>
              <dd>{health.database.name}</dd>
            </div>
            <div>
              <dt>Document</dt>
              <dd>{health.ping.message}</dd>
            </div>
            <div>
              <dt>Writes</dt>
              <dd>{health.ping.count}</dd>
            </div>
            <div>
              <dt>Last write</dt>
              <dd>{formatTime(health.ping.updatedAt)}</dd>
            </div>
          </dl>
        ) : null}

        {status === 'error' ? <p className="error">{error}</p> : null}
        {status === 'loading' ? <p className="muted">Writing a test document…</p> : null}

        <button type="button" onClick={checkPipeline} disabled={status === 'loading'}>
          Check again
        </button>
      </section>
    </main>
  )
}
