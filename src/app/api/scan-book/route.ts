import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'

export const maxDuration = 30

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'Липсва GEMINI_API_KEY' }, { status: 500 })
  }

  try {
    const { image } = await request.json()
    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 })
    }

    const base64Data = image.replace(/^data:image\/\w+;base64,/, '')
    const mediaTypeMatch = image.match(/^data:(image\/\w+);base64,/)
    const mimeType = mediaTypeMatch?.[1] ?? 'image/jpeg'

    const prompt = `This is a book cover photo. Identify the book and return ALL available information.

Return ONLY a valid JSON object (no markdown, no code blocks) with these exact fields:
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

Description MUST be in Bulgarian. Use null for unknown fields. Numbers must be integers.`

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { inline_data: { mime_type: mimeType, data: base64Data } },
              { text: prompt },
            ],
          }],
          generationConfig: { temperature: 0.1, maxOutputTokens: 1024 },
        }),
      }
    )

    if (!res.ok) {
      const errBody = await res.text()
      console.error('Gemini API error:', res.status, errBody)
      return NextResponse.json({ error: `Gemini грешка ${res.status}: ${errBody.slice(0, 200)}` }, { status: 500 })
    }

    const data = await res.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
    console.log('Gemini response:', text.slice(0, 300))

    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return NextResponse.json({ error: 'Не успях да разпозная книгата. Опитайте с по-ясна снимка.' }, { status: 422 })
    }

    const bookData = JSON.parse(jsonMatch[0])
    return NextResponse.json({ book: bookData })
  } catch (err: unknown) {
    console.error('scan-book error:', err)
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: `Грешка: ${message}` }, { status: 500 })
  }
}
