'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Star, X } from 'lucide-react'
import { submitReview } from '@/app/(storefront)/[shopSlug]/review-actions'

export default function ReviewForm({ shopSlug, productId }: { shopSlug: string; productId: string }) {
  const [open, setOpen] = useState(false)
  const [rating, setRating] = useState(5)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = async () => {
    setSubmitting(true)
    setError(null)
    const result = await submitReview(shopSlug, productId, rating, title, body)
    setSubmitting(false)

    if (result.requiresLogin) {
      router.push(`/user/login?redirect=/${shopSlug}`)
      return
    }
    if ('error' in result) {
      setError(result.error)
      return
    }
    setOpen(false)
    setTitle('')
    setBody('')
    router.refresh()
  }

  return (
    <>
      <button className="btn btn-ghost btn-sm" style={{ border: '1px solid var(--sf-border)', color: 'var(--sf-text-primary)' }} onClick={() => setOpen(true)}>
        Write a Review
      </button>

      {open && (
        <div className="modal-backdrop" onClick={() => setOpen(false)}>
          <div className="modal" style={{ maxWidth: 420 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Write a review</h3>
              <button onClick={() => setOpen(false)} aria-label="Close"><X size={18} /></button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <div>
                <label className="input-label" style={{ display: 'block', marginBottom: 'var(--space-2)' }}>Rating</label>
                <div style={{ display: 'flex', gap: 4 }}>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button key={n} type="button" onClick={() => setRating(n)} aria-label={`${n} star${n > 1 ? 's' : ''}`}>
                      <Star size={22} fill={n <= rating ? 'var(--color-warning-400)' : 'none'} color="var(--color-warning-400)" />
                    </button>
                  ))}
                </div>
              </div>
              <div className="input-wrapper">
                <label className="input-label">Title (optional)</label>
                <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Great product!" />
              </div>
              <div className="input-wrapper">
                <label className="input-label">Review</label>
                <textarea className="input textarea" value={body} onChange={(e) => setBody(e.target.value)} placeholder="Share your experience…" rows={4} />
              </div>
              {error && <p className="input-helper error">{error}</p>}
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setOpen(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSubmit} disabled={submitting}>
                {submitting ? 'Submitting…' : 'Submit Review'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
