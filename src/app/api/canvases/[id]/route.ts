import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { Canvas } from '@/models/Canvas'
import { getTokenFromRequest, verifyToken } from '@/lib/auth'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const shareToken = searchParams.get('token')

    await connectDB()
    const canvas = await Canvas.findById(id)
    if (!canvas) return NextResponse.json({ error: 'Canvas not found' }, { status: 404 })

    // Public share access
    if (shareToken && canvas.shareToken === shareToken) {
      return NextResponse.json({ canvas })
    }

    // Auth access
    const token = getTokenFromRequest(request)
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const payload = await verifyToken(token)
    if (!payload || payload.userId !== canvas.userId.toString()) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json({ canvas })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
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

    const body = await request.json()
    if (body.title !== undefined) canvas.title = body.title
    if (body.items !== undefined) canvas.items = body.items
    await canvas.save()

    return NextResponse.json({ canvas })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
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

    await canvas.deleteOne()
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
