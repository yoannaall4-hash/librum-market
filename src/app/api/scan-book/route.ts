import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'

export const maxDuration = 30

const GEMINI_PROMPT = `You are analyzing a photo of a book cover. Extract the book title and author(s) visible on the cover.
Return ONLY a JSON object, nothing else:
{
  "title": "exact book title as written on cover",
  "authors": ["author name 1", "author name 2"],
  "language": "bg|en|ro|gr|ru|fr|de|other"
}
Rules:
- title and authors must be exactly as written on the cover
- language: detect from the text script/language (bg=Bulgarian/Cyrillic, en=English, ro=Romanian, gr=Greek, ru=Russian)
- authors is an array, even if only one author
- If you cannot read the title, still try your best`

const CATEGORY_MAP: Record<string, string> = {
  'Religion': 'theology',
  'Christianity': 'theology',
  'Theology': 'theology',
  'Philosophy': 'philosophy',
  'History': 'history',
  'Psychology': 'psychology',
  'Education': 'pedagogy',
  'Children': 'children',
  'Music': 'music',
  'Law': 'law',
  'Health': 'health',
  'Economics': 'economics',
  'Fiction': 'fiction',
  'Science': 'exact-sciences',
}

async function searchGoogleBooks(title: string, authors: string[], language: string) {
  try {
    // Build query — title is most reliable, add author if available
    const authorQ = authors.length ? `+inauthor:${encodeURIComponent(authors[0])}` : ''
    const langQ = ['bg', 'ru', 'gr'].includes(language) ? '' : `&langRestrict=${language}`
    const url = `https://www.googleapis.com/books/v1/volumes?q=intitle:${encodeURIComponent(title)}${authorQ}${langQ}&maxResults=3&printType=books`

    const res = await fetch(url, { next: { revalidate: 3600 } })
    if (!res.ok) return null
    const data = await res.json()

    const items: unknown[] = data.items ?? []
    if (!items.length) {
      // Fallback: search by title only
      const url2 = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(title)}&maxResults=3&printType=books`
      const res2 = await fetch(url2, { next: { revalidate: 3600 } })
      if (!res2.ok) return null
      const data2 = await res2.json()
      if (!data2.items?.length) return null
      items.push(...(data2.items as unknown[]))
    }

    // Pick best match: prefer items whose title closely matches
    const titleLower = title.toLowerCase()
    const sortedItems = (items as Array<{ volumeInfo: Record<string, unknown> }>).sort((a, b) => {
      const aTitle = String(a.volumeInfo?.title ?? '').toLowerCase()
      const bTitle = String(b.volumeInfo?.title ?? '').toLowerCase()
      const aScore = aTitle.includes(titleLower) || titleLower.includes(aTitle) ? 1 : 0
      const bScore = bTitle.includes(titleLower) || titleLower.includes(bTitle) ? 1 : 0
      return bScore - aScore
    })

    const info = sortedItems[0]?.volumeInfo as Record<string, unknown>
    if (!info) return null

    // Extract ISBN-13 preferring, else ISBN-10
    const identifiers = info.industryIdentifiers as Array<{ type: string; identifier: string }> | undefined
    const isbn13 = identifiers?.find(i => i.type === 'ISBN_13')?.identifier
    const isbn10 = identifiers?.find(i => i.type === 'ISBN_10')?.identifier
    const isbn = isbn13 ?? isbn10 ?? null

    // Map Google categories to our slugs
    const googleCats = info.categories as string[] | undefined
    let categorySlug: string | null = null
    if (googleCats?.length) {
      for (const cat of googleCats) {
        for (const [key, slug] of Object.entries(CATEGORY_MAP)) {
          if (cat.toLowerCase().includes(key.toLowerCase())) {
            categorySlug = slug
            break
          }
        }
        if (categorySlug) break
      }
    }

    // Get cover image from Google Books (high quality)
    const imageLinks = info.imageLinks as Record<string, string> | undefined
    const googleCover = imageLinks?.extraLarge ?? imageLinks?.large ?? imageLinks?.medium ?? imageLinks?.thumbnail ?? null

    return {
      title: String(info.title ?? ''),
      authors: Array.isArray(info.authors) ? info.authors as string[] : [],
      description: info.description ? String(info.description) : null,
      year: info.publishedDate ? String(info.publishedDate).slice(0, 4) : null,
      isbn,
      pages: info.pageCount ? String(info.pageCount) : null,
      publisher: info.publisher ? String(info.publisher) : null,
      categorySlug,
      googleCover,
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
    const { image } = await request.json()
    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 })
    }

    const base64Data = image.replace(/^data:image\/\w+;base64,/, '')
    const mimeType = image.match(/^data:(image\/\w+);base64,/)?.[1] ?? 'image/jpeg'

    // Step 1: Gemini reads title + author from cover photo
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { inline_data: { mime_type: mimeType, data: base64Data } },
              { text: GEMINI_PROMPT },
            ],
          }],
          generationConfig: { temperature: 0.1, maxOutputTokens: 512 },
        }),
      }
    )

    if (!geminiRes.ok) {
      const errBody = await geminiRes.text()
      return NextResponse.json({ error: `Gemini грешка: ${errBody.slice(0, 150)}` }, { status: 500 })
    }

    const geminiData = await geminiRes.json()
    const rawText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text ?? ''

    let geminiResult: { title?: string; authors?: string[]; language?: string } = {}
    try {
      const jsonMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)```/)
      const jsonStr = jsonMatch ? jsonMatch[1] : rawText.trim()
      geminiResult = JSON.parse(jsonStr)
    } catch {
      // Could not parse — continue with empty
    }

    const titleFromCover = geminiResult.title ?? ''
    const authorsFromCover: string[] = Array.isArray(geminiResult.authors) ? geminiResult.authors : []
    const language = geminiResult.language ?? 'bg'

    if (!titleFromCover) {
      return NextResponse.json({ error: 'Не успях да разчета заглавието. Опитайте с по-ясна снимка.' }, { status: 422 })
    }

    // Step 2: Search Google Books
    const googleData = await searchGoogleBooks(titleFromCover, authorsFromCover, language)

    // Step 3: Merge — Google Books wins for structured data, Gemini cover scan for title/authors
    const finalTitle = googleData?.title || titleFromCover
    const finalAuthors = (googleData?.authors?.length ? googleData.authors : authorsFromCover)

    return NextResponse.json({
      title: finalTitle,
      authors: finalAuthors,
      description: googleData?.description ?? null,
      year: googleData?.year ?? null,
      isbn: googleData?.isbn ?? null,
      pages: googleData?.pages ?? null,
      publisher: googleData?.publisher ?? null,
      language,
      categorySlug: googleData?.categorySlug ?? null,
      googleCover: googleData?.googleCover ?? null,
      foundOnGoogle: !!googleData,
    })
  } catch (err: unknown) {
    console.error('scan-book error:', err)
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: `Грешка: ${message}` }, { status: 500 })
  }
}
