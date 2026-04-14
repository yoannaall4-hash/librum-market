import { createClient } from '@libsql/client'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const url = 'https://librum-market-yoanna.aws-eu-west-1.turso.io'
const authToken = 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NzYxNDI4NzcsImlkIjoiMDE5ZDhhMmItYjUwMS03YWExLWIyYTItY2FjMmJkNWQyMGQ3IiwicmlkIjoiMWZkMGI2ZTMtMWViMy00YmViLTljNzEtNGJmZDliMzk4ZTE5In0.-ck8qwV9hkrzRLWBJfkIvdI_6jV3zj32KgEEikTqlfLEzxuy7Y7VOM6UdbLGlCPASs-_t2lZgEi_8ar12xTkBw'

const client = createClient({ url, authToken })

// Run migration 1 then migration 2
const files = [
  join(__dirname, 'migrations/20260414024907_init/migration.sql'),
  join(__dirname, 'migrations/20260414030704_add_fields/migration.sql'),
]

for (const file of files) {
  const sql = readFileSync(file, 'utf-8')

  // Split by semicolon, strip comment lines from each statement
  const statements = sql
    .split(';')
    .map(s => {
      // Remove comment lines but keep the actual SQL
      return s.split('\n')
        .filter(line => !line.trim().startsWith('--'))
        .join('\n')
        .trim()
    })
    .filter(s => s.length > 0)

  console.log(`\n${file.split('/').pop()} — ${statements.length} statements`)

  for (const stmt of statements) {
    try {
      await client.execute(stmt)
      process.stdout.write('.')
    } catch (err) {
      if (err.message?.includes('already exists') || err.message?.includes('duplicate')) {
        process.stdout.write('s')
      } else {
        console.error(`\nERROR: ${err.message}`)
        console.error(`SQL: ${stmt.slice(0, 80)}`)
      }
    }
  }
}

console.log('\n\nDone! Verifying tables...')
const result = await client.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
console.log('Tables:', result.rows.map(r => r.name).join(', '))
client.close()
