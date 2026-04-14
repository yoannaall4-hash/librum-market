import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'

export const maxDuration = 30

const PROMPT = `You are analyzing a photo of a book cover (front or back). Extract every piece of information you can read from the image.
Return ONLY a valid JSON object, nothing else:
{
  "title": "book title if visible, or null",
  "authors": ["author name(s) if visible"],
  "description": "the book description or blurb text if visible, or null",
  "isbn": "ISBN number digits only (no dashes) if visible, or null",
  "year": "4-digit publication year if visible, or null",
  "publisher": "publisher name if visible, or null",
  "pages": "number of pages if visible, or null",
  "price": "price as number if visible, or null",
  "iban": "IBAN bank account number if visible, or null",
  "language": "bg|en|ro|gr|ru|fr|de|other"
}
Rules:
- Extract ONLY what is physically written/printed on the cover in the photo
- Do NOT invent, guess, or look up anything from external knowledge
- authors array can be empty [] if no author is visible
- For price: extract the numeric value only (e.g. 15.00)
- For IBAN: extract the full account number string
- language: detect from the text script on the cover`

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
    const { image } = await request.json() as { image?: string }

    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 })
    }

    const base64Data = image.replace(/^data:image\/\w+;base64,/, '')
    const mimeType = image.match(/^data:(image\/\w+);base64,/)?.[1] ?? 'image/jpeg'

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
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
          generationConfig: { temperature: 0.1, maxOutputTokens: 1024 },
        }),
      }
    )

    if (!res.ok) {
      const errBody = await res.text()
      return NextResponse.json({ error: `Грешка при разпознаване: ${errBody.slice(0, 200)}` }, { status: 500 })
    }

    const data = await res.json()
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text ?? ''

    let result: Record<string, unknown> = {}
    try {
      const jsonMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)```/)
      const jsonStr = jsonMatch ? jsonMatch[1] : rawText.trim()
      result = JSON.parse(jsonStr)
    } catch {
      return NextResponse.json({ error: 'Не успях да разчета текста. Опитайте с по-ясна снимка.' }, { status: 422 })
    }

    return NextResponse.json({
      title: result.title ?? null,
      authors: Array.isArray(result.authors) ? result.authors : [],
      description: result.description ?? null,
      isbn: result.isbn ?? null,
      year: result.year ?? null,
      publisher: result.publisher ?? null,
      pages: result.pages ?? null,
      price: result.price ?? null,
      iban: result.iban ?? null,
      language: result.language ?? null,
    })

  } catch (err: unknown) {
    console.error('scan-book error:', err)
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: `Грешка: ${message}` }, { status: 500 })
  }
}
