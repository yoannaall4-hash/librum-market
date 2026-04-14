import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

// Block contact info patterns
function sanitizeMessage(content: string): string {
  // Remove phone numbers
  content = content.replace(/(\+?3598[0-9]{8}|08[0-9]{8})/g, '[телефон скрит]')
  // Remove emails
  content = content.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[имейл скрит]')
  // Remove common payment handles or social media
  content = content.replace(/(instagram|facebook|viber|whatsapp|telegram)\.?(com|me)?\/?[^\s]*/gi, '[контакт скрит]')
  return content
}

export async function GET(request: NextRequest) {
  const user = await getSession()
  if (!user) return NextResponse.json({ error: 'Неоторизиран' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const conversationWith = searchParams.get('with')
  const bookId = searchParams.get('bookId')
  const orderId = searchParams.get('orderId')

  const where: Record<string, unknown> = {
    OR: [{ senderId: user.id }, { receiverId: user.id }],
  }
  if (conversationWith) {
    where.OR = [
      { senderId: user.id, receiverId: conversationWith },
      { senderId: conversationWith, receiverId: user.id },
    ]
  }
  if (bookId) where.bookId = bookId
  if (orderId) where.orderId = orderId

  const messages = await prisma.message.findMany({
    where,
    include: {
      sender: { select: { id: true, name: true, avatar: true } },
    },
    orderBy: { createdAt: 'asc' },
  })

  // Mark as read
  await prisma.message.updateMany({
    where: { receiverId: user.id, isRead: false, ...(conversationWith ? { senderId: conversationWith } : {}) },
    data: { isRead: true },
  })

  return NextResponse.json({ messages })
}

export async function POST(request: NextRequest) {
  const user = await getSession()
  if (!user) return NextResponse.json({ error: 'Неоторизиран' }, { status: 401 })

  const { receiverId, content, bookId, orderId } = await request.json()

  if (!receiverId || !content?.trim()) {
    return NextResponse.json({ error: 'Получателят и съдържанието са задължителни' }, { status: 400 })
  }

  if (receiverId === user.id) {
    return NextResponse.json({ error: 'Не можете да изпратите съобщение на себе си' }, { status: 400 })
  }

  const receiver = await prisma.user.findUnique({ where: { id: receiverId } })
  if (!receiver) return NextResponse.json({ error: 'Получателят не е намерен' }, { status: 404 })

  const sanitized = sanitizeMessage(content.trim())

  const message = await prisma.message.create({
    data: {
      senderId: user.id,
      receiverId,
      content: sanitized,
      bookId: bookId || null,
      orderId: orderId || null,
    },
    include: {
      sender: { select: { id: true, name: true, avatar: true } },
    },
  })

  return NextResponse.json({ message }, { status: 201 })
}
