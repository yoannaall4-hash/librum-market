import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'
import bcrypt from 'bcryptjs'

const adapter = new PrismaLibSql({ url: 'file:dev.db' })
const prisma = new PrismaClient({ adapter })

async function main() {
  const password = await bcrypt.hash('librum2024!', 10)

  const admins = [
    { email: 'yoanna.all4@gmail.com', name: 'Йоана' },
    { email: 'librum.bookstore@gmail.com', name: 'Librum Admin' },
  ]

  for (const admin of admins) {
    const user = await prisma.user.upsert({
      where: { email: admin.email },
      update: { role: 'admin' },
      create: {
        email: admin.email,
        name: admin.name,
        password,
        role: 'admin',
      },
    })
    console.log(`✓ ${user.email} — роля: ${user.role}`)
  }

  console.log('\nПарола по подразбиране: librum2024!')
  console.log('Сменете я при първо влизане от /profile')
}

main().catch(console.error).finally(() => process.exit(0))
