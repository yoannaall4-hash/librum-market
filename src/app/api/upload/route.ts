import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'

const MAX_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

export async function POST(request: NextRequest) {
  try {
    const user = await getSession()
    if (!user) return NextResponse.json({ error: 'Неоторизиран' }, { status: 401 })

    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) return NextResponse.json({ error: 'Няма файл' }, { status: 400 })
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Позволени формати: JPG, PNG, WebP' }, { status: 400 })
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'Максимален размер: 5MB' }, { status: 400 })
    }

    // Convert to base64 data URL (works on Vercel without filesystem)
    const buffer = Buffer.from(await file.arrayBuffer())
    const base64 = buffer.toString('base64')
    const dataUrl = `data:${file.type};base64,${base64}`

    return NextResponse.json({ url: dataUrl })
  } catch (err) {
    console.error('[upload] error:', err)
    return NextResponse.json({ error: 'Грешка при качване на файла' }, { status: 500 })
  }
}
