import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword, verifyPassword, generateToken } from '@/lib/auth'
import { cookies } from 'next/headers'

const SESSION_DURATION_DAYS = 30

export async function POST(request: NextRequest) {
  const { action, ...data } = await request.json()

  if (action === 'register') {
    const { name, email, password, sellerType } = data

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Всички полета са задължителни' }, { status: 400 })
    }

    const exists = await prisma.user.findUnique({ where: { email } })
    if (exists) {
      return NextResponse.json({ error: 'Имейлът вече е регистриран' }, { status: 400 })
    }

    const hashedPassword = await hashPassword(password)
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: sellerType ? 'seller' : 'user',
        sellerType: sellerType || null,
      },
    })

    const token = generateToken()
    const expiresAt = new Date(Date.now() + SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000)
    await prisma.session.create({ data: { userId: user.id, token, expiresAt } })

    const cookieStore = await cookies()
    cookieStore.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: expiresAt,
      path: '/',
    })

    return NextResponse.json({ success: true, user: { id: user.id, name: user.name, email: user.email, role: user.role } })
  }

  if (action === 'login') {
    const { email, password } = data
    if (!email || !password) {
      return NextResponse.json({ error: 'Имейлът и паролата са задължителни' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return NextResponse.json({ error: 'Невалиден имейл или парола' }, { status: 401 })
    }

    if (user.isBanned) {
      return NextResponse.json({ error: 'Акаунтът е блокиран' }, { status: 403 })
    }

    const valid = await verifyPassword(password, user.password)
    if (!valid) {
      return NextResponse.json({ error: 'Невалиден имейл или парола' }, { status: 401 })
    }

    const token = generateToken()
    const expiresAt = new Date(Date.now() + SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000)
    await prisma.session.create({ data: { userId: user.id, token, expiresAt } })

    const cookieStore = await cookies()
    cookieStore.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: expiresAt,
      path: '/',
    })

    return NextResponse.json({ success: true, user: { id: user.id, name: user.name, email: user.email, role: user.role } })
  }

  if (action === 'logout') {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth_token')?.value
    if (token) {
      await prisma.session.deleteMany({ where: { token } })
      cookieStore.delete('auth_token')
    }
    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ error: 'Невалидно действие' }, { status: 400 })
}
