'use client'
import { useState, useEffect, useRef } from 'react'
import { formatDate } from '@/lib/utils'
import Button from './ui/Button'

interface ConversationUser {
  id: string
  name: string
  avatar: string | null
}

interface Conversation {
  user: ConversationUser
  lastMessage: string
  unread: number
  lastAt: Date
}

interface Message {
  id: string
  content: string
  senderId: string
  createdAt: string
  sender: { id: string; name: string; avatar: string | null }
}

export default function MessagesClient({
  conversations,
  currentUserId,
}: {
  conversations: Conversation[]
  currentUserId: string
}) {
  const [activeUser, setActiveUser] = useState<ConversationUser | null>(
    conversations[0]?.user || null
  )
  const [messages, setMessages] = useState<Message[]>([])
  const [content, setContent] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!activeUser) return
    fetch(`/api/messages?with=${activeUser.id}`)
      .then((r) => r.json())
      .then((data) => setMessages(data.messages || []))
  }, [activeUser])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function send() {
    if (!content.trim() || !activeUser) return
    setSending(true)
    const res = await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ receiverId: activeUser.id, content }),
    })
    if (res.ok) {
      const data = await res.json()
      setMessages((prev) => [...prev, data.message])
      setContent('')
    }
    setSending(false)
  }

  if (conversations.length === 0) {
    return (
      <div className="text-center py-20 text-stone-400">
        <p className="text-5xl mb-4">💬</p>
        <p className="text-lg">Нямате съобщения все още</p>
        <p className="text-sm mt-2">Разгледайте книги и задайте въпрос на продавач</p>
      </div>
    )
  }

  return (
    <div className="flex gap-0 bg-white rounded-2xl border border-stone-200 overflow-hidden h-[600px]">
      {/* Sidebar */}
      <div className="w-72 border-r border-stone-200 flex flex-col">
        <div className="p-4 border-b border-stone-100">
          <h2 className="font-semibold text-stone-700 text-sm">Разговори</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.map((conv) => (
            <button
              key={conv.user.id}
              onClick={() => setActiveUser(conv.user)}
              className={`w-full text-left p-4 border-b border-stone-50 hover:bg-stone-50 transition-colors ${activeUser?.id === conv.user.id ? 'bg-amber-50 border-l-2 border-l-amber-700' : ''}`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-700 flex items-center justify-center text-white font-bold shrink-0">
                  {conv.user.name[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-stone-800 truncate">{conv.user.name}</p>
                    {conv.unread > 0 && (
                      <span className="w-5 h-5 rounded-full bg-amber-700 text-white text-xs flex items-center justify-center">
                        {conv.unread}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-stone-400 truncate">{conv.lastMessage}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat */}
      {activeUser ? (
        <div className="flex-1 flex flex-col">
          <div className="p-4 border-b border-stone-100 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-amber-700 flex items-center justify-center text-white font-bold text-sm">
              {activeUser.name[0].toUpperCase()}
            </div>
            <p className="font-semibold text-stone-700">{activeUser.name}</p>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex gap-2 ${msg.senderId === currentUserId ? 'flex-row-reverse' : ''}`}>
                <div className="w-7 h-7 rounded-full bg-stone-200 flex items-center justify-center text-xs font-bold shrink-0">
                  {msg.sender.name[0].toUpperCase()}
                </div>
                <div className={`max-w-xs lg:max-w-sm rounded-2xl px-3 py-2 text-sm ${
                  msg.senderId === currentUserId
                    ? 'bg-amber-700 text-white rounded-tr-sm'
                    : 'bg-stone-100 text-stone-800 rounded-tl-sm'
                }`}>
                  <p>{msg.content}</p>
                  <p className={`text-xs mt-1 ${msg.senderId === currentUserId ? 'text-amber-200' : 'text-stone-400'}`}>
                    {formatDate(msg.createdAt)}
                  </p>
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          <div className="p-4 border-t border-stone-100 flex gap-3">
            <input
              type="text"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && send()}
              placeholder="Напишете съобщение..."
              className="flex-1 text-sm border border-stone-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
            <Button onClick={send} loading={sending} disabled={!content.trim()} size="sm">
              Изпрати
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-stone-400">
          Изберете разговор
        </div>
      )}
    </div>
  )
}
