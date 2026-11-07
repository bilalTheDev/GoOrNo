import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../api/client.js'
import { Button, TextField } from '../components/FormControls.jsx'
import { CATEGORIES } from '../constants/categories.js'
import { useAuthStore } from '../store/authStore.js'

const steps = ['Pitch', 'Story', 'Details', 'Review']

const emptyForm = {
  title: '',
  tagline: '',
  description: '',
  category: '',
  priceHint: '',
  images: [],
  status: 'draft',
}

export default function PitchWizardPage() {
  const { id: routeId } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const emailVerified = useAuthStore((state) => state.user?.emailVerified)
  const [step, setStep] = useState(0)
  const [pitchId, setPitchId] = useState(routeId || '')
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState(false)
  const [form, setForm] = useState(emptyForm)

  const existing = useQuery({
    queryKey: ['pitch', routeId],
    enabled: Boolean(routeId),
    queryFn: () => api(`/api/v1/pitches/${routeId}`, { auth: true }),
  })

  useEffect(() => {
    const pitch = existing.data?.pitch
    if (!pitch) return
    setPitchId(pitch.id)
    setForm({
      title: pitch.title,
      tagline: pitch.tagline,
      description: pitch.description || '',
      category: pitch.category || '',
      priceHint: pitch.priceHint || '',
      images: pitch.images || [],
      status: pitch.status,
    })
  }, [existing.data])

  function applyPitch(pitch) {
    setPitchId(pitch.id)
    setForm({
      title: pitch.title,
      tagline: pitch.tagline,
      description: pitch.description || '',
      category: pitch.category || '',
      priceHint: pitch.priceHint || '',
      images: pitch.images || [],
      status: pitch.status,
    })
    queryClient.setQueryData(['pitch', pitch.id], { success: true, pitch })
    queryClient.invalidateQueries({ queryKey: ['my-pitches'] })
    queryClient.invalidateQueries({ queryKey: ['pitches'] })
  }

  const save = useMutation({
    mutationFn: (action) => {
      if (action === 'create') {
        return api('/api/v1/pitches', {
          method: 'POST',
          auth: true,
          body: { title: form.title, tagline: form.tagline },
        })
      }
      if (action === 'basics') {
        return api(`/api/v1/pitches/${pitchId}`, {
          method: 'PATCH',
          auth: true,
          body: { title: form.title, tagline: form.tagline },
        })
      }
      if (action === 'story') {
        return api(`/api/v1/pitches/${pitchId}`, {
          method: 'PATCH',
          auth: true,
          body: { description: form.description },
        })
      }
      if (action === 'details') {
        return api(`/api/v1/pitches/${pitchId}`, {
          method: 'PATCH',
          auth: true,
          body: { category: form.category, priceHint: form.priceHint },
        })
      }
      return api(`/api/v1/pitches/${pitchId}/publish`, { method: 'POST', auth: true })
    },
  })

  function update(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  async function next() {
    setError('')
    try {
      let data
      if (step === 0) data = await save.mutateAsync(pitchId ? 'basics' : 'create')
      else if (step === 1) data = await save.mutateAsync('story')
      else data = await save.mutateAsync('details')
      applyPitch(data.pitch)
      setStep((current) => current + 1)
    } catch (err) {
      setError(err.message)
    }
  }

  async function publish() {
    setError('')
    try {
      const data = await save.mutateAsync('publish')
      applyPitch(data.pitch)
      navigate(`/pitches/${data.pitch.id}`)
    } catch (err) {
      setError(err.message)
    }
  }

  async function upload(event) {
    const files = [...event.target.files]
    event.target.value = ''
    if (!files.length) return
    const body = new FormData()
    files.forEach((file) => body.append('images', file))
    setUploading(true)
    setError('')
    try {
      const data = await api(`/api/v1/pitches/${pitchId}/images`, {
        method: 'POST',
        auth: true,
        body,
      })
      applyPitch(data.pitch)
    } catch (err) {
      setError(err.message)
    } finally {
      setUploading(false)
    }
  }

  async function removeImage(url) {
    setError('')
    try {
      const data = await api(`/api/v1/pitches/${pitchId}/images`, {
        method: 'DELETE',
        auth: true,
        body: { url },
      })
      applyPitch(data.pitch)
    } catch (err) {
      setError(err.message)
    }
  }

  if (routeId && existing.isLoading) return <p className="px-6 text-sm">Loading pitch…</p>
  if (routeId && existing.isError) {
    return <p className="px-6 text-sm text-[#9a3412]">{existing.error.message}</p>
  }

  return (
    <main className="mx-auto max-w-xl px-6 pb-16">
      <p className="text-xs font-semibold tracking-[0.16em] text-[#6b645b] uppercase">
        Step {step + 1} of {steps.length}
      </p>
      <h1 className="mt-2 font-serif text-4xl">{steps[step]}</h1>
      <ol className="mt-4 flex gap-2 text-xs font-semibold">
        {steps.map((label, index) => (
          <li
            key={label}
            className={index === step ? 'text-[#0f7a45]' : 'text-[#6b645b]'}
          >
            {label}
          </li>
        ))}
      </ol>

      {step === 0 ? (
        <div className="mt-6 space-y-4">
          <TextField
            label="Title"
            name="title"
            value={form.title}
            onChange={update}
            required
          />
          <TextField
            label="Tagline"
            name="tagline"
            value={form.tagline}
            onChange={update}
            required
          />
        </div>
      ) : null}

      {step === 1 ? (
        <div className="mt-6 space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">Description</span>
            <textarea
              name="description"
              value={form.description}
              onChange={update}
              rows={8}
              className="w-full rounded-xl border border-[#e4dccf] bg-white px-3 py-2.5"
            />
          </label>
          <label className="block text-sm font-medium">
            Mockups
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              multiple
              onChange={upload}
              className="mt-2 block w-full text-sm"
            />
          </label>
          {uploading ? <p className="text-sm">Uploading…</p> : null}
          <div className="grid grid-cols-3 gap-2">
            {form.images.map((image) => (
              <figure key={image.url} className="overflow-hidden rounded-xl">
                <img src={image.url} alt="" className="h-24 w-full object-cover" />
                <button
                  type="button"
                  className="mt-1 text-xs text-[#9a3412]"
                  onClick={() => removeImage(image.url)}
                >
                  Remove
                </button>
              </figure>
            ))}
          </div>
        </div>
      ) : null}

      {step === 2 ? (
        <div className="mt-6 space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">Category</span>
            <select
              name="category"
              value={form.category}
              onChange={update}
              className="w-full rounded-xl border border-[#e4dccf] bg-white px-3 py-2.5"
            >
              <option value="">Choose one</option>
              {CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>
          <TextField
            label="Price hint"
            name="priceHint"
            value={form.priceHint}
            onChange={update}
            placeholder="$12 / month"
          />
        </div>
      ) : null}

      {step === 3 ? (
        <section className="mt-6 space-y-3 rounded-3xl border border-[#e4dccf] bg-[#fffdf8] p-5 text-sm">
          <h2 className="font-serif text-3xl">{form.title}</h2>
          <p>{form.tagline}</p>
          <p className="whitespace-pre-wrap text-[#3f3a34]">{form.description}</p>
          <p>
            {form.category || 'No category'}
            {form.priceHint ? ` · ${form.priceHint}` : ''}
          </p>
          <p>
            {form.images.length} image{form.images.length === 1 ? '' : 's'}
          </p>
          {emailVerified ? null : (
            <p className="text-[#9a3412]">
              Verify your email before this pitch can go live. You can keep the draft.
            </p>
          )}
          {form.status !== 'draft' ? <p>This pitch is already {form.status}.</p> : null}
        </section>
      ) : null}

      {error ? <p className="mt-4 text-sm text-[#9a3412]">{error}</p> : null}

      <div className="mt-6 flex gap-3">
        {step > 0 ? (
          <Button variant="ghost" onClick={() => setStep((current) => current - 1)}>
            Back
          </Button>
        ) : null}
        {step < 3 ? (
          <Button onClick={next} disabled={save.isPending}>
            {save.isPending ? 'Saving…' : 'Continue'}
          </Button>
        ) : (
          <Button onClick={publish} disabled={save.isPending || !emailVerified}>
            {save.isPending
              ? 'Publishing…'
              : form.status === 'draft'
                ? 'Publish'
                : 'Save changes'}
          </Button>
        )}
      </div>
    </main>
  )
}
