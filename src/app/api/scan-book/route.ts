import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { getSession } from '@/lib/auth'

export const maxDuration = 30

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'Липсва GEMINI_API_KEY в настройките на сървъра' }, { status: 500 })
  }

  try {
    const { image } = await request.json()
    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 })
    }

    const base64Data = image.replace(/^data:image\/\w+;base64,/, '')
    const mediaTypeMatch = image.match(/^data:(image\/\w+);base64,/)
    const mimeType = (mediaTypeMatch?.[1] ?? 'image/jpeg') as string

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    const result = await model.generateContent([
      {
        inlineData: {
          data: base64Data,
          mimeType,
        },
      },
      `This is a book cover photo. Identify the book and return ALL available information.

Return ONLY a valid JSON object (no markdown, no code blocks, no explanation) with these exact fields:
{
  "title": "exact book title",
  "authors": ["Author Name"],
  "description": "2-4 sentence description in Bulgarian language",
  "isbn": "ISBN if visible or known, else null",
  "year": 2023,
  "pages": 350,
  "publisher": "publisher name or null",
  "category": "one of: theology, psychology, philosophy, history, pedagogy, children, archaeology, encyclopedias, health, economics, music, tourism, textbooks, law, fiction, exact-sciences",
  "language": "bg"
}

Rules: description MUST be in Bulgarian. Use null for unknown fields. Numbers must be integers not strings.`,
    ])

    const text = result.response.text()

    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return NextResponse.json({ error: 'Не успях да разпозная книгата. Опитайте с по-ясна снимка.' }, { status: 422 })
    }

    const bookData = JSON.parse(jsonMatch[0])
    return NextResponse.json({ book: bookData })
  } catch (err: unknown) {
    console.error('scan-book error:', err)
    const message = err instanceof Error ? err.message : String(err)
    if (message.includes('API_KEY') || message.includes('API key') || message.includes('403')) {
      return NextResponse.json({ error: 'Невалиден GEMINI_API_KEY' }, { status: 500 })
    }
    return NextResponse.json({ error: 'Грешка при анализ на снимката. Опитайте отново.' }, { status: 500 })
  }
}
