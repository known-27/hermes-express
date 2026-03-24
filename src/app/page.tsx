"use client"

import Link from 'next/link'
import { useEffect, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'

const features = [
  {
    icon: '🖼️',
    title: 'Multi-Canvas Workspace',
    desc: 'Create unlimited canvases for every moment — birthdays, anniversaries, road trips, or just because.',
  },
  {
    icon: '📸',
    title: 'Rich Media Elements',
    desc: 'Drop in photos, sticky notes, doodles, and voice messages. Layer and arrange them freely.',
  },
  {
    icon: '🔗',
    title: 'Instant Share Links',
    desc: 'Generate a unique link to your canvas and share it with anyone — no account required to view.',
  },
  {
    icon: '☁️',
    title: 'Auto-Save Everything',
    desc: 'Every brushstroke and note is saved instantly to the cloud. Never lose a memory again.',
  },
  {
    icon: '🎨',
    title: 'Freehand Doodles',
    desc: 'Draw, sketch, and annotate directly on your canvas with full color and brush controls.',
  },
  {
    icon: '🎤',
    title: 'Voice Messages',
    desc: 'Record a voice note and pin it to the canvas. Let them hear your voice alongside your words.',
  },
]

export default function LandingPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!loading && user) router.push('/dashboard')
  }, [user, loading, router])

  // Particle animation
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId: number
    const particles: { x: number; y: number; vx: number; vy: number; r: number; alpha: number }[] = []

    const resize = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    resize()
    window.addEventListener('resize', resize)

    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        r: Math.random() * 1.5 + 0.5,
        alpha: Math.random() * 0.4 + 0.1,
      })
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.forEach((p) => {
        p.x += p.vx
        p.y += p.vy
        if (p.x < 0) p.x = canvas.width
        if (p.x > canvas.width) p.x = 0
        if (p.y < 0) p.y = canvas.height
        if (p.y > canvas.height) p.y = 0

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(212, 168, 83, ${p.alpha})`
        ctx.fill()
      })
      animId = requestAnimationFrame(draw)
    }
    draw()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      {/* Nav */}
      <nav className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 py-4"
        style={{ background: 'rgba(10,10,15,0.8)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <span className="text-xl font-bold tracking-tight" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
          <span className="gold-text">HERMES</span>
          <span style={{ color: 'var(--text-primary)' }}> EXPRESS</span>
        </span>
        <div className="flex items-center gap-3">
          <Link href="/login" className="btn-outline px-4 py-2 rounded-xl text-sm font-medium cursor-pointer" style={{ display: 'inline-block', textDecoration: 'none' }}>
            Log in
          </Link>
          <Link href="/signup" className="btn-gold px-4 py-2 rounded-xl text-sm font-medium cursor-pointer" style={{ display: 'inline-block', textDecoration: 'none' }}>
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative flex flex-col items-center justify-center min-h-screen text-center px-6 overflow-hidden">
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />

        {/* Background orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl"
            style={{ background: 'radial-gradient(circle, #d4a853, transparent)' }} />
          <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full opacity-8 blur-3xl"
            style={{ background: 'radial-gradient(circle, #4a7cf0, transparent)' }} />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-8 fade-in"
            style={{ background: 'rgba(212,168,83,0.1)', border: '1px solid rgba(212,168,83,0.25)', color: 'var(--accent-gold)' }}>
            ✦ The Canvas for Your Memories
          </div>

          <h1 className="text-6xl md:text-8xl font-bold leading-none mb-6 fade-in fade-in-delay-1" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            <span className="gold-text">HERMES</span>
            <br />
            <span style={{ color: 'var(--text-primary)' }}>EXPRESS</span>
          </h1>

          <p className="text-xl md:text-2xl mb-10 max-w-2xl mx-auto fade-in fade-in-delay-2" style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Craft living memory canvases with photos, notes, doodles & voice messages. 
            Share them with a single link — no login required to view.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 fade-in fade-in-delay-3">
            <Link href="/signup" className="btn-gold px-8 py-4 rounded-2xl text-base font-semibold cursor-pointer"
              style={{ display: 'inline-block', textDecoration: 'none', minWidth: '180px' }}>
              Start Creating Free →
            </Link>
            <Link href="/login" className="btn-outline px-8 py-4 rounded-2xl text-base font-medium cursor-pointer"
              style={{ display: 'inline-block', textDecoration: 'none', minWidth: '180px' }}>
              Sign in
            </Link>
          </div>
        </div>

        {/* Floating canvas preview */}
        <div className="relative z-10 mt-20 w-full max-w-3xl mx-auto fade-in fade-in-delay-4">
          <div className="float glass rounded-3xl overflow-hidden" style={{ border: '1px solid rgba(212,168,83,0.15)' }}>
            <div className="flex items-center gap-2 px-5 py-3" style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="w-3 h-3 rounded-full" style={{ background: '#ff5f57' }} />
              <div className="w-3 h-3 rounded-full" style={{ background: '#febc2e' }} />
              <div className="w-3 h-3 rounded-full" style={{ background: '#28c840' }} />
              <span className="ml-3 text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'monospace' }}>My Birthday Canvas</span>
            </div>
            <div className="h-48 canvas-bg relative overflow-hidden">
              {/* Decorative items */}
              <div className="absolute top-6 left-10 px-3 py-2 rounded-lg text-xs font-medium shadow-lg rotate-[-3deg]"
                style={{ background: '#fef9c3', color: '#666', fontFamily: 'monospace' }}>
                🎂 Happy Birthday!!
              </div>
              <div className="absolute top-10 right-16 w-20 h-14 rounded-lg shadow-lg rotate-[4deg]"
                style={{ background: '#dbeafe', border: '2px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
                📸
              </div>
              <div className="absolute bottom-6 left-1/3 px-3 py-2 rounded-lg text-xs shadow-lg rotate-[2deg]"
                style={{ background: '#fce7f3', color: '#888', fontFamily: 'monospace' }}>
                🎤 Voice note
              </div>
              <div className="absolute bottom-4 right-10 w-16 h-16 rounded-xl shadow-lg rotate-[-5deg]"
                style={{ background: 'white', border: '2px solid #e5e5e5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>
                🎨
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Everything you need to <span className="gold-text">express yourself</span>
            </h2>
            <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
              A full creative suite for your most cherished moments.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div key={i} className="glass glass-hover glow-border p-6 rounded-2xl"
                style={{ border: '1px solid var(--border)' }}>
                <div className="text-4xl mb-4">{f.icon}</div>
                <h3 className="text-lg font-semibold mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{f.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <div className="max-w-2xl mx-auto text-center glass rounded-3xl p-12"
          style={{ border: '1px solid rgba(212,168,83,0.2)' }}>
          <h2 className="text-4xl font-bold mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Ready to send something <span className="gold-text">unforgettable?</span>
          </h2>
          <p className="mb-8" style={{ color: 'var(--text-secondary)' }}>
            Create your first canvas in seconds. Free forever.
          </p>
          <Link href="/signup" className="btn-gold px-10 py-4 rounded-2xl text-base font-semibold cursor-pointer"
            style={{ display: 'inline-block', textDecoration: 'none' }}>
            Create Your Canvas →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 text-center" style={{ borderTop: '1px solid var(--border)', color: 'var(--text-muted)' }}>
        <p className="text-sm">
          <span className="gold-text font-semibold">HERMES EXPRESS</span> · Built with love &amp; creativity
        </p>
      </footer>
    </div>
  )
}