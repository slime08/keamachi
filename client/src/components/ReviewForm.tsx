import React, { useState } from 'react'
import { Review } from '../types'
import { safeGetJSON, safeSetJSON } from '../utils/storage'

export default function ReviewForm({ facilityId, onSaved }: { facilityId: number, onSaved?: () => void }) {
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [author, setAuthor] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const all: Review[] = safeGetJSON<Review[]>('reviews', [])
    const newReview: Review = {
      id: Math.random().toString(36).slice(2,9),
      facilityId,
      rating,
      comment,
      author: author || '匿名',
      createdAt: new Date().toISOString()
    }
    all.push(newReview)
    safeSetJSON('reviews', all)
    setComment('')
    setAuthor('')
    setRating(5)
    if (onSaved) onSaved()
  }

  return (
    <form className="review-form" onSubmit={handleSubmit}>
      <div className="form-row">
        <label>評価</label>
        <select value={rating} onChange={e => setRating(Number(e.target.value))}>
          <option value={5}>5</option>
          <option value={4}>4</option>
          <option value={3}>3</option>
          <option value={2}>2</option>
          <option value={1}>1</option>
        </select>
      </div>
      <div className="form-row">
        <label>氏名（任意）</label>
        <input value={author} onChange={e=>setAuthor(e.target.value)} placeholder="お名前" />
      </div>
      <div className="form-row">
        <label>コメント</label>
        <textarea value={comment} onChange={e=>setComment(e.target.value)} required placeholder="レビューを投稿してください" />
      </div>
      <div className="form-actions">
        <button type="submit" className="btn btn-primary">レビューを投稿</button>
      </div>
    </form>
  )
}