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
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' })

    const prompt = `This is a book cover photo. Identify the book and return ALL available information.

Return ONLY a valid JSON object (no markdown, no code blocks, no explanation) with these exact fields:
{
  "title": "exact book title",
  "authors": ["Author Name"],
  "description": "2-4 sentence description in Bulgarian language",
  "isbn": null,
  "year": null,
  "pages": null,
  "publisher": null,
  "category": "one of: theology, psychology, philosophy, history, pedagogy, children, archaeology, encyclopedias, health, economics, music, tourism, textbooks, law, fiction, exact-sciences",
  "language": "bg"
}

Rules: description MUST be in Bulgarian. Use null for unknown fields. Numbers must be integers not strings.`

    const result = await model.generateContent({
      contents: [{
        role: 'user',
        parts: [
          { inlineData: { data: base64Data, mimeType } },
          { text: prompt },
        ],
      }],
    })

    const text = result.response.text()
    console.log('Gemini response:', text.slice(0, 300))

    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return NextResponse.json({ error: 'Не успях да разпозная книгата. Опитайте с по-ясна снимка.' }, { status: 422 })
    }

    const bookData = JSON.parse(jsonMatch[0])
    return NextResponse.json({ book: bookData })
  } catch (err: unknown) {
    console.error('scan-book full error:', err)
    const message = err instanceof Error ? err.message : String(err)
    if (message.includes('API_KEY') || message.includes('API key') || message.includes('403')) {
      return NextResponse.json({ error: 'Невалиден GEMINI_API_KEY' }, { status: 500 })
    }
    if (message.includes('quota') || message.includes('429')) {
      return NextResponse.json({ error: 'Достигнат лимит на безплатния план. Опитайте след малко.' }, { status: 429 })
    }
    return NextResponse.json({ error: `Грешка: ${message}` }, { status: 500 })
  }
}
