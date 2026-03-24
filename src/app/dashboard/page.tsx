"use client"

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'

interface CanvasCard {
  _id: string
  title: string
  isPublic: boolean
  createdAt: string
  updatedAt: string
}

export default function DashboardPage() {
  const { user, token, loading, logout } = useAuth()
  const router = useRouter()
  const [canvases, setCanvases] = useState<CanvasCard[]>([])
  const [fetching, setFetching] = useState(true)
  const [creating, setCreating] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    if (!loading && !user) router.replace('/login')
  }, [user, loading, router])

  const fetchCanvases = useCallback(async () => {
    if (!token) return
    setFetching(true)
    try {
      const res = await fetch('/api/canvases', { headers: { Authorization: `Bearer ${token}` } })
      if (res.ok) {
        const data = await res.json()
        setCanvases(data.canvases)
      }
    } finally {
      setFetching(false)
    }
  }, [token])

  useEffect(() => {
    if (token) fetchCanvases()
  }, [token, fetchCanvases])

  const createCanvas = async () => {
    if (!token) return
    setCreating(true)
    try {
      const res = await fetch('/api/canvases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title: 'Untitled Canvas' }),
      })
      if (res.ok) {
        const data = await res.json()
        router.push(`/canvas/${data.canvas._id}`)
      }
    } finally {
      setCreating(false)
    }
  }

  const deleteCanvas = async (id: string) => {
    if (!token || !confirm('Delete this canvas? This cannot be undone.')) return
    setDeletingId(id)
    try {
      await fetch(`/api/canvases/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
      setCanvases(prev => prev.filter(c => c._id !== id))
    } finally {
      setDeletingId(null)
    }
  }

  const formatDate = (d: string) => {
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  if (loading || (!user && !loading)) return null

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      {/* Top Nav */}
      <nav className="sticky top-0 z-40 flex items-center justify-between px-6 py-4"
        style={{ background: 'rgba(10,10,15,0.9)', backdropFilter: 'blur(20px)', borderBottom: '1px solid var(--border)' }}>
        <Link href="/" className="text-lg font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif', textDecoration: 'none' }}>
          <span className="gold-text">HERMES</span>
          <span style={{ color: 'var(--text-primary)' }}> EXPRESS</span>
        </Link>
        <div className="flex items-center gap-4">
          <span className="text-sm hidden sm:block" style={{ color: 'var(--text-secondary)' }}>
            {user?.name}
          </span>
          <button onClick={logout} className="btn-outline px-4 py-2 rounded-xl text-sm font-medium"
            style={{ cursor: 'pointer' }}>
            Sign out
          </button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              My Canvases
            </h1>
            <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
              {canvases.length} canvas{canvases.length !== 1 ? 'es' : ''}
            </p>
          </div>
          <button
            onClick={createCanvas}
            disabled={creating}
            className="btn-gold px-5 py-3 rounded-xl text-sm font-semibold flex items-center gap-2 disabled:opacity-60"
            style={{ cursor: creating ? 'not-allowed' : 'pointer' }}
          >
            <span className="text-lg">+</span>
            {creating ? 'Creating…' : 'New Canvas'}
          </button>
        </div>

        {/* Canvas Grid */}
        {fetching ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="glass rounded-2xl h-52 animate-pulse" style={{ border: '1px solid var(--border)' }} />
            ))}
          </div>
        ) : canvases.length === 0 ? (
          <div className="flex flex-col items-center justify-center glass rounded-3xl py-20 text-center"
            style={{ border: '1px solid var(--border)' }}>
            <div className="text-5xl mb-4">🎨</div>
            <h2 className="text-xl font-semibold mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>No canvases yet</h2>
            <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
              Create your first canvas to start preserving memories
            </p>
            <button
              onClick={createCanvas}
              disabled={creating}
              className="btn-gold px-6 py-3 rounded-xl text-sm font-semibold"
              style={{ cursor: creating ? 'not-allowed' : 'pointer' }}
            >
              {creating ? 'Creating…' : 'Create First Canvas →'}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {canvases.map((c) => (
              <div key={c._id} className="glass glass-hover glow-border rounded-2xl overflow-hidden group relative"
                style={{ border: '1px solid var(--border)' }}>
                {/* Canvas preview area */}
                <Link href={`/canvas/${c._id}`} style={{ textDecoration: 'none', display: 'block' }}>
                  <div className="h-36 canvas-bg relative overflow-hidden flex items-center justify-center">
                    <div className="text-4xl opacity-30">🖼️</div>
                    {c.isPublic && (
                      <div className="absolute top-2 right-2 px-2 py-1 rounded-lg text-xs font-medium"
                        style={{ background: 'rgba(212,168,83,0.2)', border: '1px solid rgba(212,168,83,0.4)', color: 'var(--accent-gold)' }}>
                        Shared
                      </div>
                    )}
                  </div>
                </Link>

                {/* Info */}
                <div className="p-4">
                  <Link href={`/canvas/${c._id}`} style={{ textDecoration: 'none' }}>
                    <h3 className="font-semibold text-sm truncate mb-1"
                      style={{ fontFamily: 'Space Grotesk, sans-serif', color: 'var(--text-primary)' }}>
                      {c.title}
                    </h3>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      Updated {formatDate(c.updatedAt)}
                    </p>
                  </Link>

                  <div className="flex items-center justify-between mt-3 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
                    <Link href={`/canvas/${c._id}`}
                      className="text-xs font-medium"
                      style={{ color: 'var(--accent-gold)', textDecoration: 'none' }}>
                      Open →
                    </Link>
                    <button
                      onClick={() => deleteCanvas(c._id)}
                      disabled={deletingId === c._id}
                      className="text-xs px-2 py-1 rounded-lg transition-colors"
                      style={{ color: 'var(--text-muted)', cursor: 'pointer', background: 'transparent', border: 'none' }}
                      onMouseEnter={e => (e.currentTarget.style.color = '#f87171')}
                      onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
                    >
                      {deletingId === c._id ? '…' : 'Delete'}
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Add new card */}
            <button
              onClick={createCanvas}
              disabled={creating}
              className="glass glass-hover rounded-2xl h-52 flex flex-col items-center justify-center gap-3 transition-all"
              style={{ border: '2px dashed var(--border)', cursor: creating ? 'not-allowed' : 'pointer', background: 'transparent' }}
            >
              <div className="text-3xl" style={{ color: 'var(--text-muted)' }}>+</div>
              <span className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
                {creating ? 'Creating…' : 'New Canvas'}
              </span>
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
