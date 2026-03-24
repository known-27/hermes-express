import mongoose, { Schema, Document } from 'mongoose'

export interface CanvasItem {
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

export interface ICanvas extends Document {
  title: string
  userId: mongoose.Types.ObjectId
  items: CanvasItem[]
  isPublic: boolean
  shareToken: string
  createdAt: Date
  updatedAt: Date
}

const CanvasItemSchema = new Schema<CanvasItem>(
  {
    id: String,
    type: { type: String, enum: ['photo', 'note', 'voice', 'spotify', 'doodle'] },
    content: String,
    position: { x: Number, y: Number },
    rotation: Number,
    scale: Number,
    color: String,
    caption: String,
    zIndex: Number,
  },
  { _id: false }
)

const CanvasSchema = new Schema<ICanvas>(
  {
    title: { type: String, default: 'Untitled Canvas', trim: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    items: { type: [CanvasItemSchema], default: [] },
    isPublic: { type: Boolean, default: false },
    shareToken: { type: String, default: '' },
  },
  { timestamps: true }
)

export const Canvas = mongoose.models.Canvas ?? mongoose.model<ICanvas>('Canvas', CanvasSchema)
