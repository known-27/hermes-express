import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { Canvas } from '@/models/Canvas'
import { getTokenFromRequest, verifyToken } from '@/lib/auth'
import { v4 as uuidv4 } from 'uuid'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params
    const token = getTokenFromRequest(request)
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const payload = await verifyToken(token)
    if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })

    await connectDB()
    const canvas = await Canvas.findById(id)
    if (!canvas) return NextResponse.json({ error: 'Canvas not found' }, { status: 404 })
    if (payload.userId !== canvas.userId.toString()) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Toggle sharing
    if (canvas.isPublic && canvas.shareToken) {
      canvas.isPublic = false
      canvas.shareToken = ''
    } else {
      canvas.isPublic = true
      canvas.shareToken = uuidv4()
    }

    await canvas.save()

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'
    const shareUrl = canvas.isPublic
      ? `${baseUrl}/share/${canvas._id}?token=${canvas.shareToken}`
      : null

    return NextResponse.json({ isPublic: canvas.isPublic, shareToken: canvas.shareToken, shareUrl })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
