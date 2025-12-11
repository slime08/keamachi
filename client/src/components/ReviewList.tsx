import React, { useEffect, useState } from 'react'
import { Review } from '../types'
import { safeGetJSON } from '../utils/storage'

export default function ReviewList({ facilityId }: { facilityId: number }) {
  const [reviews, setReviews] = useState<Review[]>([])

  useEffect(() => {
    const all: Review[] = safeGetJSON<Review[]>('reviews', [])
    setReviews(all.filter(r => r.facilityId === facilityId).sort((a,b)=> +new Date(b.createdAt) - +new Date(a.createdAt)))
  }, [facilityId])

  if (reviews.length === 0) return <div className="reviews-empty">まだレビューはありません。</div>

  return (
    <div className="review-list">
      {reviews.map(r => (
        <div key={r.id} className="review-item">
          <div className="review-meta">
            <strong>{r.author || '匿名'}</strong>
            <span className="review-date">{new Date(r.createdAt).toLocaleString()}</span>
            <span className="review-rating">{'⭐'.repeat(r.rating)}{r.rating < 5 ? '☆'.repeat(5-r.rating) : ''}</span>
          </div>
          <div className="review-body">{r.comment}</div>
        </div>
      ))}
    </div>
  )
}