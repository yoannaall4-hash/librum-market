import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params
  const { isBanned, role } = await request.json()

  const data: Record<string, unknown> = {}
  if (isBanned !== undefined) data.isBanned = isBanned
  if (role !== undefined) data.role = role

  const user = await prisma.user.update({ where: { id }, data })
  return NextResponse.json({ user })
}
