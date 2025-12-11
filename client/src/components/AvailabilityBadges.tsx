import React from 'react'

type Availability = {
  mon?: 'open'|'limited'|'closed'
  tue?: 'open'|'limited'|'closed'
  wed?: 'open'|'limited'|'closed'
  thu?: 'open'|'limited'|'closed'
  fri?: 'open'|'limited'|'closed'
  sat?: 'open'|'limited'|'closed'
  sun?: 'open'|'limited'|'closed'
}

export default function AvailabilityBadges({ availability }: { availability?: Availability }) {
  const days = ['mon','tue','wed','thu','fri','sat','sun']
  const labels: any = { mon: '月', tue: '火', wed: '水', thu: '木', fri: '金', sat: '土', sun: '日' }

  return (
    <div className="availability-badges-wrapper">
      <div className="weekday-labels" style={{display:'flex',gap:8,alignItems:'center'}}>
        {days.map(d => (
          <div key={d} className="weekday-label">{labels[d]}</div>
        ))}
      </div>
      <div className="weekday-badges" style={{display:'flex',gap:8,alignItems:'center',marginTop:4}}>
        {days.map(d => {
          const status = availability && (availability as any)[d]
          const symbol = status === 'open' ? '〇' : status === 'limited' ? '△' : '✕'
          const cls = status ? status : 'closed'
          return (
            <div key={d} title={`${labels[d]}: ${status ?? 'closed'}`} className={`weekday-badge ${cls}`}>
              {symbol}
            </div>
          )
        })}
      </div>
    </div>
  )
}