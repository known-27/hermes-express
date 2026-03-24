"use client"

import { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import Link from 'next/link'

interface CanvasItem {
  id: string
  type: 'photo' | 'note' | 'voice' | 'spotify' | 'doodle'
  content: string
  position: { x: number; y: number }
  rotation: number
  scale?: number
  color?: string
  caption?: string
  zIndex?: number
}

interface CanvasData {
  title: string
  items: CanvasItem[]
}

export default function SharePage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const canvasId = params.id as string
  const shareToken = searchParams.get('token')

  const [canvas, setCanvas] = useState<CanvasData | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!canvasId || !shareToken) { setError('Invalid share link.'); return }
    fetch(`/api/canvases/${canvasId}?token=${shareToken}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) setError(data.error)
        else setCanvas(data.canvas)
      })
      .catch(() => setError('Failed to load canvas.'))
  }, [canvasId, shareToken])

  const colorMap: Record<string, string> = {
    'yellow': '#fef9c3',
    'blue': '#dbeafe',
    'green': '#dcfce7',
    'pink': '#fce7f3',
    'white': '#ffffff',
  }

  const getBgColor = (item: CanvasItem) => {
    if (item.color) {
      const key = Object.keys(colorMap).find(k => item.color?.includes(k))
      return key ? colorMap[key] : '#fef9c3'
    }
    return '#fef9c3'
  }

  if (error) return (
    <div className="min-h-screen flex flex-col items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
      <div className="text-5xl mb-4">🔒</div>
      <h2 className="text-xl font-semibold mb-2" style={{ fontFamily: 'Space Grotesk' }}>Canvas not accessible</h2>
      <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>{error}</p>
      <Link href="/" className="btn-gold px-6 py-3 rounded-xl text-sm font-semibold" style={{ textDecoration: 'none' }}>
        Create Your Own →
      </Link>
    </div>
  )

  if (!canvas) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
      <div className="text-center">
        <div className="text-2xl mb-3 animate-pulse">Loading canvas…</div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-primary)' }}>
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 flex-shrink-0"
        style={{ background: 'rgba(10,10,15,0.95)', borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center gap-3">
          <Link href="/" className="text-lg font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif', textDecoration: 'none' }}>
            <span className="gold-text">HERMES</span>
            <span style={{ color: 'var(--text-primary)' }}> EXPRESS</span>
          </Link>
          <span style={{ color: 'var(--border)' }}>|</span>
          <span className="text-sm font-semibold truncate max-w-xs" style={{ fontFamily: 'Space Grotesk', color: 'var(--text-primary)' }}>
            {canvas.title}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs px-2 py-1 rounded-lg" style={{ background: 'rgba(212,168,83,0.1)', border: '1px solid rgba(212,168,83,0.25)', color: 'var(--accent-gold)' }}>
            👁 Read only
          </span>
          <Link href="/signup" className="btn-gold px-4 py-2 rounded-xl text-xs font-semibold" style={{ textDecoration: 'none' }}>
            Create Yours →
          </Link>
        </div>
      </header>

      {/* Canvas */}
      <div className="flex-1 canvas-bg relative overflow-hidden">
        {canvas.items.map(item => (
          <div
            key={item.id}
            style={{
              position: 'absolute',
              left: item.position?.x ?? 0,
              top: item.position?.y ?? 0,
              transform: `rotate(${item.rotation || 0}deg)`,
              zIndex: item.zIndex || 1,
              maxWidth: '220px',
            }}
          >
            {item.type === 'note' && (
              <div className="p-3 rounded-lg shadow-md text-sm leading-relaxed"
                style={{ background: getBgColor(item), color: '#333', fontFamily: 'monospace', minWidth: '120px', minHeight: '80px', whiteSpace: 'pre-wrap' }}>
                {item.content || <span style={{ color: '#aaa', fontStyle: 'italic' }}>Empty note</span>}
              </div>
            )}
            {item.type === 'photo' && (
              <div className="shadow-lg" style={{ border: '4px solid white' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.content} alt={item.caption || 'Photo'} style={{ maxWidth: '200px', maxHeight: '200px', display: 'block' }} />
                {item.caption && (
                  <div className="text-xs text-center py-1" style={{ background: 'white', color: '#666', fontFamily: 'monospace' }}>{item.caption}</div>
                )}
              </div>
            )}
            {item.type === 'doodle' && (
              <div className="shadow-md" style={{ border: '3px solid white', borderRadius: '8px', overflow: 'hidden' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.content} alt="Doodle" style={{ maxWidth: '200px', display: 'block' }} />
              </div>
            )}
            {item.type === 'voice' && (
              <div className="px-4 py-3 rounded-xl shadow-md flex items-center gap-2"
                style={{ background: '#e8e8e8', minWidth: '120px' }}>
                <span>🎤</span>
                <span className="text-xs" style={{ color: '#555', fontFamily: 'monospace' }}>Voice note</span>
              </div>
            )}
            {item.type === 'spotify' && (
              <div className="p-0 rounded-xl overflow-hidden shadow-md" style={{ width: '200px' }}>
                <iframe
                  src={`https://open.spotify.com/embed/track/${item.content.split('/').pop()?.split('?')[0]}`}
                  width="200" height="80" style={{ border: 'none' }} allow="autoplay; clipboard-write; encrypted-media; picture-in-picture"
                />
              </div>
            )}
          </div>
        ))}

        {canvas.items.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p style={{ color: '#aaa', fontFamily: 'monospace' }}>This canvas is empty.</p>
          </div>
        )}
      </div>

      {/* Footer CTA */}
      <div className="flex-shrink-0 py-4 px-6 flex items-center justify-center gap-4"
        style={{ background: 'rgba(10,10,15,0.95)', borderTop: '1px solid var(--border)' }}>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          Want to create your own memory canvas?
        </p>
        <Link href="/signup" className="btn-gold px-5 py-2 rounded-xl text-sm font-semibold" style={{ textDecoration: 'none' }}>
          Get started free →
        </Link>
      </div>
    </div>
  )
}
