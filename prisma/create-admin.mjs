import { createClient } from '@libsql/client'
import bcrypt from 'bcryptjs'

const url = 'https://librum-market-yoanna.aws-eu-west-1.turso.io'
const authToken = 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NzYxNDI4NzcsImlkIjoiMDE5ZDhhMmItYjUwMS03YWExLWIyYTItY2FjMmJkNWQyMGQ3IiwicmlkIjoiMWZkMGI2ZTMtMWViMy00YmViLTljNzEtNGJmZDliMzk4ZTE5In0.-ck8qwV9hkrzRLWBJfkIvdI_6jV3zj32KgEEikTqlfLEzxuy7Y7VOM6UdbLGlCPASs-_t2lZgEi_8ar12xTkBw'

const client = createClient({ url, authToken })

const password = await bcrypt.hash('librum2024!', 10)
const now = new Date().toISOString()

const admins = [
  { email: 'librum.bookstore@gmail.com', name: 'Librum Admin' },
  { email: 'yoanna.all4@gmail.com', name: 'Йоана' },
]

for (const admin of admins) {
  // Check if user exists
  const existing = await client.execute({
    sql: 'SELECT id, role FROM "User" WHERE email = ?',
    args: [admin.email],
  })

  if (existing.rows.length > 0) {
    // Update to admin
    await client.execute({
      sql: 'UPDATE "User" SET role = \'admin\' WHERE email = ?',
      args: [admin.email],
    })
    console.log(`✓ ${admin.email} — обновен до admin`)
  } else {
    // Create new admin
    const id = crypto.randomUUID()
    await client.execute({
      sql: `INSERT INTO "User" (id, name, email, password, role, "isVerified", "isBanned", "createdAt", "updatedAt")
            VALUES (?, ?, ?, ?, 'admin', 1, 0, ?, ?)`,
      args: [id, admin.name, admin.email, password, now, now],
    })
    console.log(`✓ ${admin.email} — създаден като admin`)
  }
}

console.log('\nПарола: librum2024!')
console.log('Сменете я от /profile след влизане.')
client.close()
