import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { getSession } from '@/lib/auth'

export const maxDuration = 30

const client = new Anthropic()

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { image } = await request.json()
    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 })
    }

    // Strip data URL prefix if present
    const base64Data = image.replace(/^data:image\/\w+;base64,/, '')
    const mediaTypeMatch = image.match(/^data:(image\/\w+);base64,/)
    const mediaType = (mediaTypeMatch?.[1] ?? 'image/jpeg') as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp'

    const response = await client.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mediaType,
                data: base64Data,
              },
            },
            {
              type: 'text',
              text: `This is a book cover photo. Please identify the book and return ALL available information about it.

Return ONLY a valid JSON object (no markdown, no explanation) with these fields:
{
  "title": "exact book title in Bulgarian or original language",
  "authors": ["Author Name 1", "Author Name 2"],
  "description": "2-4 sentence description of the book content in Bulgarian",
  "isbn": "ISBN number if visible or known",
  "year": 2023,
  "pages": 350,
  "publisher": "publisher name",
  "category": "one of: theology, psychology, philosophy, history, pedagogy, children, archaeology, encyclopedias, health, economics, music, tourism, textbooks, law, fiction, exact-sciences",
  "language": "bg"
}

If you cannot identify a field, use null. The description MUST be in Bulgarian. Focus on accuracy — only include information you are confident about.`,
            },
          ],
        },
      ],
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : ''

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return NextResponse.json({ error: 'Could not parse book data from image' }, { status: 422 })
    }

    const bookData = JSON.parse(jsonMatch[0])

    return NextResponse.json({ book: bookData })
  } catch (err) {
    console.error('scan-book error:', err)
    return NextResponse.json({ error: 'Failed to analyze image' }, { status: 500 })
  }
}
