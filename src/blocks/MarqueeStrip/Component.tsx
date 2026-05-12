import React from 'react'

type Props = {
  items: { text: string; id?: string | null }[]
}

export const MarqueeStripBlockComponent: React.FC<Props> = ({ items }) => {
  if (!items || items.length === 0) return null

  // Duplicate the list so the animation loops seamlessly
  const doubled = [...items, ...items]

  return (
    <div
      className="overflow-hidden py-3"
      style={{ background: '#2C2A27' }}
      aria-label="Announcements"
    >
      <div
        className="flex gap-12 whitespace-nowrap"
        style={{
          width: 'max-content',
          animation: 'marquee-scroll 22s linear infinite',
        }}
      >
        {doubled.map((item, i) => (
          <React.Fragment key={i}>
            <span className="font-sans text-[0.65rem] font-bold tracking-[0.2em] uppercase text-white">
              {item.text}
            </span>
            <span className="font-sans text-[0.65rem] font-bold" style={{ color: '#C4714A' }}>
              ✦
            </span>
          </React.Fragment>
        ))}
      </div>

      {/* Scoped keyframe — injected once via a style tag */}
      <style>{`
        @keyframes marquee-scroll {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  )
}
