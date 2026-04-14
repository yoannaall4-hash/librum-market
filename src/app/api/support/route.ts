import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const SYSTEM_PROMPT = `Ти си приятелски асистент на Librum Market — платформа за богословска литература в България. Помагаш на купувачи и продавачи с въпроси за платформата.

Знаеш следното за Librum Market:
- Librum Market е пазар за православни и богословски книги в България
- Продавачите публикуват обяви, администраторите ги одобряват преди да са видими
- Плащането минава през платформата (ескроу) — парите се освобождават след потвърдена доставка
- Комисионна: 10% от цената на книгата при успешна продажба
- Доставка чрез Еконт или Спиди
- Можеш да изтъкнеш обяви за 7, 14 или 30 дни
- За въпроси, жалби и проблеми: librum.bookstore@gmail.com

Отговаряй кратко, топло и на български. Ако не можеш да помогнеш с нещо конкретно, препоръчай да се свържат с екипа на имейл librum.bookstore@gmail.com.`

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json()

    if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY.startsWith('sk-ant-replace')) {
      return NextResponse.json({
        reply: 'В момента AI асистентът не е наличен. Моля свържете се с нас на librum.bookstore@gmail.com — ще отговорим до 24 часа.',
      })
    }

    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 400,
      system: SYSTEM_PROMPT,
      messages: messages.map((m: { role: string; content: string }) => ({
        role: m.role,
        content: m.content,
      })),
    })

    const reply = response.content[0].type === 'text' ? response.content[0].text : ''
    return NextResponse.json({ reply })
  } catch {
    return NextResponse.json({
      reply: 'Съжаляваме, възникна грешка. Свържете се с нас на librum.bookstore@gmail.com',
    })
  }
}
