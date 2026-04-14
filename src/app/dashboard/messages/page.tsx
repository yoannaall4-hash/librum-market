import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import MessagesClient from '@/components/MessagesClient'

export default async function MessagesPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  // Get all conversations (unique users)
  const messages = await prisma.message.findMany({
    where: {
      OR: [{ senderId: session.id }, { receiverId: session.id }],
    },
    include: {
      sender: { select: { id: true, name: true, avatar: true } },
      receiver: { select: { id: true, name: true, avatar: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  // Group by conversation partner
  const conversationMap = new Map<string, {
    user: { id: string; name: string; avatar: string | null }
    lastMessage: string
    unread: number
    lastAt: Date
  }>()

  for (const msg of messages) {
    const partner = msg.senderId === session.id ? msg.receiver : msg.sender
    if (!conversationMap.has(partner.id)) {
      conversationMap.set(partner.id, {
        user: partner,
        lastMessage: msg.content,
        unread: (!msg.isRead && msg.receiverId === session.id) ? 1 : 0,
        lastAt: msg.createdAt,
      })
    } else {
      const existing = conversationMap.get(partner.id)!
      if (!msg.isRead && msg.receiverId === session.id) existing.unread++
    }
  }

  const conversations = Array.from(conversationMap.values())

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-stone-800 mb-8">Съобщения</h1>
      <MessagesClient conversations={conversations} currentUserId={session.id} />
    </div>
  )
}
