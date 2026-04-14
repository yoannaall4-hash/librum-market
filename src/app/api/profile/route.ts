import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession, hashPassword, verifyPassword } from '@/lib/auth'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Неоторизиран' }, { status: 401 })

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    select: {
      id: true, name: true, email: true, phone: true,
      avatar: true, address: true, role: true, sellerType: true,
      bio: true, bankAccount: true, isVerified: true,
      createdAt: true,
      _count: {
        select: { listings: true, purchases: true, sales: true },
      },
    },
  })

  return NextResponse.json({ user })
}

export async function PATCH(request: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Неоторизиран' }, { status: 401 })

  const data = await request.json()
  const { name, phone, bio, address, bankAccount, sellerType,
          currentPassword, newPassword } = data

  const updateData: Record<string, unknown> = {}
  if (name?.trim()) updateData.name = name.trim()
  if (phone !== undefined) updateData.phone = phone || null
  if (bio !== undefined) updateData.bio = bio || null
  if (address !== undefined) updateData.address = address || null
  if (bankAccount !== undefined) updateData.bankAccount = bankAccount || null
  if (sellerType !== undefined) updateData.sellerType = sellerType || null

  // Update seller role if sellerType set
  if (sellerType && session.role === 'user') {
    updateData.role = 'seller'
  }

  // Password change
  if (newPassword) {
    if (!currentPassword) {
      return NextResponse.json({ error: 'Необходима е текущата парола' }, { status: 400 })
    }
    const user = await prisma.user.findUnique({ where: { id: session.id } })
    if (!user) return NextResponse.json({ error: 'Потребителят не е намерен' }, { status: 404 })
    const valid = await verifyPassword(currentPassword, user.password)
    if (!valid) return NextResponse.json({ error: 'Грешна текуща парола' }, { status: 400 })
    if (newPassword.length < 8) return NextResponse.json({ error: 'Паролата трябва да е поне 8 символа' }, { status: 400 })
    updateData.password = await hashPassword(newPassword)
  }

  const updated = await prisma.user.update({
    where: { id: session.id },
    data: updateData,
    select: {
      id: true, name: true, email: true, phone: true,
      address: true, role: true, sellerType: true, bio: true, bankAccount: true,
    },
  })

  return NextResponse.json({ user: updated })
}
