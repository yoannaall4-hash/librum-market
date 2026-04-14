'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminActions({ userId, isBanned }: { userId: string; isBanned: boolean }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function toggleBan() {
    setLoading(true)
    await fetch(`/api/admin/users/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isBanned: !isBanned }),
    })
    router.refresh()
    setLoading(false)
  }

  return (
    <button
      onClick={toggleBan}
      disabled={loading}
      className={`text-xs px-2 py-1 rounded-lg transition-colors ${isBanned ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-100 text-red-700 hover:bg-red-200'}`}
    >
      {isBanned ? 'Разблокирай' : 'Блокирай'}
    </button>
  )
}
