import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { Canvas } from '@/models/Canvas'
import { getTokenFromRequest, verifyToken } from '@/lib/auth'

export async function GET(request: Request) {
  try {
    const token = getTokenFromRequest(request)
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const payload = await verifyToken(token)
    if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })

    await connectDB()
    const canvases = await Canvas.find({ userId: payload.userId })
      .select('title isPublic createdAt updatedAt')
      .sort({ updatedAt: -1 })

    return NextResponse.json({ canvases })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const token = getTokenFromRequest(request)
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const payload = await verifyToken(token)
    if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })

    const body = await request.json().catch(() => ({}))
    const title = body.title ?? 'Untitled Canvas'

    await connectDB()
    const canvas = await Canvas.create({ title, userId: payload.userId, items: [] })

    return NextResponse.json({ canvas }, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
