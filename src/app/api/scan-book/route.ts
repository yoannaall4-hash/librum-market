import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'

export const maxDuration = 30

const PROMPT = `You are analyzing a photo of a book cover or back cover. Extract as much information as possible and return a JSON object with these fields (use null for fields you cannot determine):

{
  "title": "book title",
  "authors": ["author 1", "author 2"],
  "description": "full description text from back cover",
  "year": 2020,
  "isbn": "978-xxx",
  "pages": 350,
  "publisher": "publisher name",
  "language": "bg|en|ro|gr|ru|fr|de|other",
  "categorySlug": one of: theology|history|philosophy|fiction|children|psychology|pedagogy|health|economics|music|law|textbooks|archaeology|encyclopedias|tourism|exact-sciences|null
}

Rules:
- Return ONLY the JSON object, no other text
- For language: detect from text on cover (bg=Bulgarian, en=English, ro=Romanian, gr=Greek, ru=Russian)
- For categorySlug: pick the best match based on the book content/genre, or null
- For description: use ALL text from the back cover as-is, preserving paragraphs
- authors should be an array even if only one author`

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

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { inline_data: { mime_type: mimeType, data: base64Data } },
              { text: PROMPT },
            ],
          }],
          generationConfig: { temperature: 0.1, maxOutputTokens: 2048 },
        }),
      }
    )

    if (!res.ok) {
      const errBody = await res.text()
      console.error('Gemini error:', res.status, errBody.slice(0, 300))
      return NextResponse.json({ error: `Грешка ${res.status}: ${errBody.slice(0, 150)}` }, { status: 500 })
    }

    const data = await res.json()
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text ?? ''

    if (!rawText.trim()) {
      return NextResponse.json({ error: 'Не успях да прочета текста. Опитайте с по-ясна снимка.' }, { status: 422 })
    }

    // Parse JSON from response (strip markdown code fences if present)
    const jsonMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)```/)
    const jsonStr = jsonMatch ? jsonMatch[1] : rawText.trim()

    let parsed: Record<string, unknown>
    try {
      parsed = JSON.parse(jsonStr)
    } catch {
      // Fallback: just return the raw text as description
      return NextResponse.json({ description: rawText.trim() })
    }

    return NextResponse.json({
      title: parsed.title || null,
      authors: Array.isArray(parsed.authors) ? parsed.authors.filter(Boolean) : [],
      description: parsed.description || null,
      year: parsed.year ? String(parsed.year) : null,
      isbn: parsed.isbn || null,
      pages: parsed.pages ? String(parsed.pages) : null,
      publisher: parsed.publisher || null,
      language: parsed.language || null,
      categorySlug: parsed.categorySlug || null,
    })
  } catch (err: unknown) {
    console.error('scan-book error:', err)
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: `Грешка: ${message}` }, { status: 500 })
  }
}
