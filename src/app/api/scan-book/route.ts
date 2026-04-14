import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'

export const maxDuration = 30

const FRONT_PROMPT = `You are analyzing a photo of a FRONT book cover. Extract only what is visibly written on the cover.
Return ONLY a JSON object, nothing else:
{
  "title": "exact book title as written on cover, or null",
  "authors": ["author name as written"],
  "language": "bg|en|ro|gr|ru|fr|de|other"
}
Rules:
- title and authors must be EXACTLY as written on the cover
- Do not guess or look up anything — only what you can read
- language: detect from the text script (bg=Bulgarian/Cyrillic, en=English, ro=Romanian, gr=Greek, ru=Russian)
- authors array can be empty if no author visible on cover
- If you cannot read the title clearly, still try your best`

const BACK_PROMPT = `You are analyzing a photo of a BACK book cover. Extract all visible text fields.
Return ONLY a JSON object, nothing else:
{
  "description": "the book description or blurb text visible on the back, or null",
  "isbn": "ISBN number if visible (digits only, no dashes), or null",
  "year": "4-digit publication year if visible, or null",
  "publisher": "publisher name if visible, or null",
  "pages": "number of pages if visible, or null",
  "price": "price if visible, or null"
}
Rules:
- Extract text exactly as written on the back cover
- ISBN is usually near the barcode at the bottom
- Do not invent or guess information not visible on the cover
- If a field is not visible, return null`

async function geminiScan(apiKey: string, imageBase64: string, mimeType: string, prompt: string) {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            { inline_data: { mime_type: mimeType, data: imageBase64 } },
            { text: prompt },
          ],
        }],
        generationConfig: { temperature: 0.1, maxOutputTokens: 1024 },
      }),
    }
  )

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Gemini error: ${err.slice(0, 150)}`)
  }

  const data = await res.json()
  const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text ?? ''

  try {
    const jsonMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)```/)
    const jsonStr = jsonMatch ? jsonMatch[1] : rawText.trim()
    return JSON.parse(jsonStr)
  } catch {
    return {}
  }
}

async function lookupByIsbn(isbn: string) {
  try {
    const url = `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}&maxResults=1`
    const res = await fetch(url, { next: { revalidate: 3600 } })
    if (!res.ok) return null
    const data = await res.json()
    const info = data.items?.[0]?.volumeInfo
    if (!info) return null

    const identifiers = info.industryIdentifiers as Array<{ type: string; identifier: string }> | undefined
    const isbn13 = identifiers?.find((i: { type: string }) => i.type === 'ISBN_13')?.identifier
    const isbn10 = identifiers?.find((i: { type: string }) => i.type === 'ISBN_10')?.identifier

    return {
      pages: info.pageCount ? String(info.pageCount) : null,
      publisher: info.publisher ? String(info.publisher) : null,
      year: info.publishedDate ? String(info.publishedDate).slice(0, 4) : null,
      isbn: isbn13 ?? isbn10 ?? isbn,
    }
  } catch {
    return null
  }
}

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
    const body = await request.json()
    const { image, type } = body as { image?: string; type?: 'front' | 'back' }

    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 })
    }
    if (type !== 'front' && type !== 'back') {
      return NextResponse.json({ error: 'type must be "front" or "back"' }, { status: 400 })
    }

    const base64Data = image.replace(/^data:image\/\w+;base64,/, '')
    const mimeType = image.match(/^data:(image\/\w+);base64,/)?.[1] ?? 'image/jpeg'

    if (type === 'front') {
      const result = await geminiScan(apiKey, base64Data, mimeType, FRONT_PROMPT)

      const title: string = result.title ?? ''
      const authors: string[] = Array.isArray(result.authors) ? result.authors : []
      const language: string = result.language ?? 'bg'

      if (!title) {
        return NextResponse.json({ error: 'Не успях да разчета заглавието. Опитайте с по-ясна снимка.' }, { status: 422 })
      }

      return NextResponse.json({ type: 'front', title, authors, language })
    }

    // Back cover
    const result = await geminiScan(apiKey, base64Data, mimeType, BACK_PROMPT)

    const description: string | null = result.description ?? null
    const isbn: string | null = result.isbn ?? null
    const year: string | null = result.year ?? null
    const publisher: string | null = result.publisher ?? null
    const pages: string | null = result.pages ?? null

    // If we got an ISBN, try Google Books for any missing fields
    let extra: { pages?: string | null; publisher?: string | null; year?: string | null; isbn?: string | null } = {}
    if (isbn) {
      const gb = await lookupByIsbn(isbn)
      if (gb) {
        extra = {
          pages: pages ?? gb.pages,
          publisher: publisher ?? gb.publisher,
          year: year ?? gb.year,
          isbn: gb.isbn ?? isbn,
        }
      }
    }

    return NextResponse.json({
      type: 'back',
      description,
      isbn: extra.isbn ?? isbn,
      year: extra.year ?? year,
      publisher: extra.publisher ?? publisher,
      pages: extra.pages ?? pages,
    })

  } catch (err: unknown) {
    console.error('scan-book error:', err)
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: `Грешка: ${message}` }, { status: 500 })
  }
}
