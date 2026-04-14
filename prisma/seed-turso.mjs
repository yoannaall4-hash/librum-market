import { createClient } from '@libsql/client'

const url = 'https://librum-market-yoanna.aws-eu-west-1.turso.io'
const authToken = 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NzYxNDI4NzcsImlkIjoiMDE5ZDhhMmItYjUwMS03YWExLWIyYTItY2FjMmJkNWQyMGQ3IiwicmlkIjoiMWZkMGI2ZTMtMWViMy00YmViLTljNzEtNGJmZDliMzk4ZTE5In0.-ck8qwV9hkrzRLWBJfkIvdI_6jV3zj32KgEEikTqlfLEzxuy7Y7VOM6UdbLGlCPASs-_t2lZgEi_8ar12xTkBw'

const client = createClient({ url, authToken })

const categories = [
  { id: 'cat_patristic',    name: 'Патристика',           slug: 'patristic' },
  { id: 'cat_liturgical',   name: 'Богослужебни книги',   slug: 'liturgical' },
  { id: 'cat_theology',     name: 'Богословие',           slug: 'theology' },
  { id: 'cat_hagiography',  name: 'Жития на светии',      slug: 'hagiography' },
  { id: 'cat_history',      name: 'Църковна история',     slug: 'history' },
  { id: 'cat_spirituality', name: 'Духовност и молитва',  slug: 'spirituality' },
  { id: 'cat_bible',        name: 'Библия и коментари',   slug: 'bible' },
  { id: 'cat_philosophy',   name: 'Религиозна философия', slug: 'philosophy' },
  { id: 'cat_iconography',  name: 'Иконография',          slug: 'iconography' },
  { id: 'cat_other',        name: 'Други',                slug: 'other' },
]

for (const cat of categories) {
  try {
    await client.execute({
      sql: `INSERT OR IGNORE INTO "Category" (id, name, slug) VALUES (?, ?, ?)`,
      args: [cat.id, cat.name, cat.slug],
    })
    console.log(`✓ ${cat.name}`)
  } catch (err) {
    console.error(`✗ ${cat.name}: ${err.message}`)
  }
}

console.log('\nКатегориите са добавени!')
client.close()
