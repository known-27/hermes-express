"use client"

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { useAuth } from '@/contexts/AuthContext'
import { Toolbar } from '@/components/toolbar'
import { LetterCanvas } from '@/components/letter-canvas'
import { PhotoUploader } from '@/components/photo-uploader'
import { VoiceRecorder } from '@/components/voice-recorder'
import { DoodleDrawer } from '@/components/doodle-drawer'
import { LetterItem } from '@/types/canvas'

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

export default function CanvasEditorPage() {
  const params = useParams()
  const router = useRouter()
  const canvasId = params.id as string
  const { user, token, loading: authLoading } = useAuth()

  const [items, setItems] = useState<LetterItem[]>([])
  const [title, setTitle] = useState('Untitled Canvas')
  const [editingTitle, setEditingTitle] = useState(false)
  const [isPhotoUploaderOpen, setIsPhotoUploaderOpen] = useState(false)
  const [isVoiceRecorderOpen, setIsVoiceRecorderOpen] = useState(false)
  const [isDoodleDrawerOpen, setIsDoodleDrawerOpen] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [currentItem, setCurrentItem] = useState<LetterItem | null>(null)
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
  const [isPublic, setIsPublic] = useState(false)
  const [shareToken, setShareToken] = useState('')
  const [loadError, setLoadError] = useState('')
  const [canvasLoaded, setCanvasLoaded] = useState(false)

  const canvasRef = useRef<HTMLDivElement>(null)
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const titleRef = useRef<HTMLInputElement>(null)

  // Auth guard
  useEffect(() => {
    if (!authLoading && !user) router.replace('/login')
  }, [user, authLoading, router])

  // Load canvas
  useEffect(() => {
    if (!token || !canvasId) return
    const load = async () => {
      try {
        const res = await fetch(`/api/canvases/${canvasId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) {
          setLoadError('Canvas not found or access denied.')
          return
        }
        const data = await res.json()
        setTitle(data.canvas.title)
        setItems((data.canvas.items ?? []).map((item: LetterItem) => ({
          ...item,
          content: item.content ?? '',
        })))
        setIsPublic(data.canvas.isPublic)
        setShareToken(data.canvas.shareToken ?? '')
        setCanvasLoaded(true)
      } catch {
        setLoadError('Failed to load canvas.')
      }
    }
    load()
  }, [token, canvasId])

  // Auto-save with debounce
  const save = useCallback(async (updatedItems: LetterItem[], updatedTitle: string) => {
    if (!token || !canvasLoaded) return
    setSaveStatus('saving')
    try {
      const serialized = updatedItems.map(item => ({
        ...item,
        content: item.content instanceof Blob ? '' : item.content,
      }))
      const res = await fetch(`/api/canvases/${canvasId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ items: serialized, title: updatedTitle }),
      })
      setSaveStatus(res.ok ? 'saved' : 'error')
      setTimeout(() => setSaveStatus('idle'), 2000)
    } catch {
      setSaveStatus('error')
    }
  }, [token, canvasId, canvasLoaded])

  const scheduleAutoSave = useCallback((updatedItems: LetterItem[], updatedTitle: string) => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    setSaveStatus('saving')
    saveTimerRef.current = setTimeout(() => save(updatedItems, updatedTitle), 1500)
  }, [save])

  // Share toggle
  const toggleShare = async () => {
    if (!token) return
    const res = await fetch(`/api/canvases/${canvasId}/share`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    })
    if (res.ok) {
      const data = await res.json()
      setIsPublic(data.isPublic)
      setShareToken(data.shareToken ?? '')
      if (data.shareUrl) {
        await navigator.clipboard.writeText(data.shareUrl)
        alert('Share link copied to clipboard!')
      } else {
        alert('Sharing disabled.')
      }
    }
  }

  const copyShareLink = async () => {
    if (!shareToken) return toggleShare()
    const base = process.env.NEXT_PUBLIC_BASE_URL ?? window.location.origin
    const url = `${base}/share/${canvasId}?token=${shareToken}`
    await navigator.clipboard.writeText(url)
    alert('Share link copied!')
  }

  // Canvas helpers
  const getRandomPosition = () => ({ x: Math.floor(Math.random() * 200), y: Math.floor(Math.random() * 200) })
  const getRandomRotation = () => Math.floor((Math.random() - 0.5) * 10)

  const addItem = (item: LetterItem) => {
    setItems(prev => {
      const highest = prev.length > 0 ? Math.max(...prev.map(i => i.zIndex || 0)) : 0
      const updated = [...prev, { ...item, zIndex: highest + 1 }]
      scheduleAutoSave(updated, title)
      return updated
    })
  }

  const updateItemPosition = (id: string, position: { x: number; y: number }) => {
    setItems(prev => {
      const updated = prev.map(item => item.id === id ? { ...item, position } : item)
      scheduleAutoSave(updated, title)
      return updated
    })
  }

  const updateItemContent = (id: string, content: string, field = 'content') => {
    setItems(prev => {
      const updated = prev.map(item => item.id === id ? { ...item, [field]: content } : item)
      scheduleAutoSave(updated, title)
      return updated
    })
  }

  const deleteItem = (id: string) => {
    setItems(prev => {
      const updated = prev.filter(item => item.id !== id)
      scheduleAutoSave(updated, title)
      return updated
    })
  }

  const moveItemForward = (id: string) => {
    setItems(prev => {
      const sorted = [...prev].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0))
      const idx = sorted.findIndex(i => i.id === id)
      if (idx === -1 || idx === sorted.length - 1) return prev
      const next = sorted[idx + 1]
      const cur = sorted[idx]
      return prev.map(item =>
        item.id === id ? { ...item, zIndex: next.zIndex } :
        item.id === next.id ? { ...item, zIndex: cur.zIndex } : item
      )
    })
  }

  const moveItemBackward = (id: string) => {
    setItems(prev => {
      const sorted = [...prev].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0))
      const idx = sorted.findIndex(i => i.id === id)
      if (idx <= 0) return prev
      const prevItem = sorted[idx - 1]
      const cur = sorted[idx]
      return prev.map(item =>
        item.id === id ? { ...item, zIndex: prevItem.zIndex } :
        item.id === prevItem.id ? { ...item, zIndex: cur.zIndex } : item
      )
    })
  }

  const handleDragStart = (e: React.MouseEvent | React.TouchEvent, item: LetterItem) => {
    const position = 'touches' in e ? e.touches[0] : e
    const rect = (e.target as HTMLElement).getBoundingClientRect()
    setIsDragging(true)
    setCurrentItem({
      ...item,
      offsetX: position.clientX - rect.left,
      offsetY: position.clientY - rect.top,
    } as LetterItem & { offsetX: number; offsetY: number })
  }

  const handleDragMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging || !currentItem || !canvasRef.current) return
    const position = 'touches' in e ? e.touches[0] : e
    const rect = canvasRef.current.getBoundingClientRect()
    updateItemPosition(currentItem.id, {
      x: position.clientX - rect.left - (currentItem?.offsetX ?? 0),
      y: position.clientY - rect.top - (currentItem?.offsetY ?? 0),
    })
  }

  const handleDragEnd = () => { setIsDragging(false); setCurrentItem(null) }

  const handleTitleBlur = () => {
    setEditingTitle(false)
    scheduleAutoSave(items, title)
  }

  const statusLabel: Record<SaveStatus, string> = {
    idle: '',
    saving: 'Saving…',
    saved: '✓ Saved',
    error: '⚠ Save failed',
  }

  if (authLoading || (!user && !authLoading)) return null

  if (loadError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <div className="text-4xl mb-4">⚠️</div>
        <h2 className="text-xl font-semibold mb-3" style={{ fontFamily: 'Space Grotesk' }}>{loadError}</h2>
        <Link href="/dashboard" className="btn-gold px-6 py-3 rounded-xl text-sm font-semibold" style={{ textDecoration: 'none' }}>
          Back to Dashboard
        </Link>
      </div>
    )
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="h-screen overflow-hidden flex flex-col" style={{ background: 'var(--bg-primary)' }}>
        {/* Top bar */}
        <header className="flex items-center justify-between px-4 py-2 flex-shrink-0 z-40"
          style={{ background: 'rgba(10,10,15,0.95)', borderBottom: '1px solid var(--border)', minHeight: '52px' }}>
          <div className="flex items-center gap-3">
            <Link href="/dashboard"
              className="flex items-center gap-1 text-sm px-3 py-1.5 rounded-lg transition-colors"
              style={{ color: 'var(--text-secondary)', textDecoration: 'none', background: 'rgba(255,255,255,0.04)' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-secondary)')}>
              ← Dashboard
            </Link>
            <span style={{ color: 'var(--border)' }}>|</span>
            {editingTitle ? (
              <input
                ref={titleRef}
                value={title}
                onChange={e => setTitle(e.target.value)}
                onBlur={handleTitleBlur}
                onKeyDown={e => { if (e.key === 'Enter') titleRef.current?.blur() }}
                className="input-dark px-2 py-1 rounded-lg text-sm font-semibold"
                style={{ minWidth: '180px', maxWidth: '280px', fontFamily: 'Space Grotesk' }}
                autoFocus
              />
            ) : (
              <button
                onClick={() => setEditingTitle(true)}
                className="text-sm font-semibold truncate max-w-xs px-2 py-1 rounded-lg hover:bg-white/5 transition-colors"
                style={{ fontFamily: 'Space Grotesk', color: 'var(--text-primary)', cursor: 'text', background: 'transparent', border: 'none' }}
              >
                {title}
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {saveStatus !== 'idle' && (
              <span className="text-xs" style={{
                color: saveStatus === 'saved' ? '#4ade80' : saveStatus === 'error' ? '#f87171' : 'var(--text-muted)'
              }}>
                {statusLabel[saveStatus]}
              </span>
            )}
            {isPublic && shareToken && (
              <button
                onClick={copyShareLink}
                className="btn-outline px-3 py-1.5 rounded-lg text-xs font-medium"
                style={{ cursor: 'pointer' }}>
                📋 Copy Link
              </button>
            )}
            <button
              onClick={toggleShare}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${isPublic ? '' : 'btn-gold'}`}
              style={{
                cursor: 'pointer',
                ...(isPublic ? {
                  background: 'rgba(74,255,100,0.1)',
                  border: '1px solid rgba(74,255,100,0.3)',
                  color: '#4ade80'
                } : {})
              }}>
              {isPublic ? '🔗 Shared' : '🔗 Share'}
            </button>
          </div>
        </header>

        {/* Canvas area */}
        <main
          className="flex-1 relative overflow-hidden canvas-bg"
          ref={canvasRef}
          onMouseMove={handleDragMove}
          onTouchMove={handleDragMove}
          onMouseUp={handleDragEnd}
          onTouchEnd={handleDragEnd}
          onMouseLeave={handleDragEnd}
        >
          <LetterCanvas
            items={items}
            updateItemPosition={updateItemPosition}
            updateItemContent={updateItemContent}
            deleteItem={deleteItem}
            handleDragStart={handleDragStart}
            isDragging={isDragging}
            currentItem={currentItem}
            moveItemForward={moveItemForward}
            moveItemBackward={moveItemBackward}
          />
        </main>

        {/* Toolbar */}
        <div className="flex-shrink-0 z-30">
          <Toolbar
            onAddPhoto={() => setIsPhotoUploaderOpen(true)}
            onAddNote={(color) => addItem({
              id: Date.now().toString(), type: 'note', content: '',
              position: getRandomPosition(), rotation: getRandomRotation(), color
            })}
            onRecordVoice={() => setIsVoiceRecorderOpen(true)}
            onAddSpotify={(url) => addItem({
              id: Date.now().toString(), type: 'spotify', content: url,
              position: getRandomPosition(), rotation: getRandomRotation()
            })}
            onAddDoodle={() => setIsDoodleDrawerOpen(true)}
          />
        </div>

        {/* Modals */}
        {isPhotoUploaderOpen && (
          <PhotoUploader
            onClose={() => setIsPhotoUploaderOpen(false)}
            onPhotoAdd={(photoUrl) => {
              addItem({ id: Date.now().toString(), type: 'photo', content: photoUrl, position: getRandomPosition(), rotation: getRandomRotation(), caption: '' })
              setIsPhotoUploaderOpen(false)
            }}
          />
        )}
        {isVoiceRecorderOpen && (
          <VoiceRecorder
            onClose={() => setIsVoiceRecorderOpen(false)}
            onVoiceAdd={(audioBlob) => {
              addItem({ id: Date.now().toString(), type: 'voice', content: audioBlob, position: getRandomPosition(), rotation: getRandomRotation() })
              setIsVoiceRecorderOpen(false)
            }}
          />
        )}
        {isDoodleDrawerOpen && (
          <DoodleDrawer
            onClose={() => setIsDoodleDrawerOpen(false)}
            onDoodleAdd={(doodleUrl) => {
              addItem({ id: Date.now().toString(), type: 'doodle', content: doodleUrl, position: getRandomPosition(), rotation: getRandomRotation() })
              setIsDoodleDrawerOpen(false)
            }}
          />
        )}
      </div>
    </DndProvider>
  )
}
