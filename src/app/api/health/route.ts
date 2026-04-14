import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const checks: Record<string, string> = {
    DATABASE_URL: process.env.DATABASE_URL ? `set (${process.env.DATABASE_URL.slice(0, 30)}...)` : 'MISSING',
    DATABASE_AUTH_TOKEN: process.env.DATABASE_AUTH_TOKEN
      ? `set (starts with: ${process.env.DATABASE_AUTH_TOKEN.slice(0, 4)})`
      : 'MISSING',
  }

  try {
    await prisma.$queryRaw`SELECT 1`
    checks.database = 'OK'
  } catch (err: unknown) {
    checks.database = `ERROR: ${err instanceof Error ? err.message : String(err)}`
  }

  return NextResponse.json(checks)
}
