import { createClient } from '@libsql/client'

const url = 'https://librum-market-yoanna.aws-eu-west-1.turso.io'
const authToken = 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NzYxNDI4NzcsImlkIjoiMDE5ZDhhMmItYjUwMS03YWExLWIyYTItY2FjMmJkNWQyMGQ3IiwicmlkIjoiMWZkMGI2ZTMtMWViMy00YmViLTljNzEtNGJmZDliMzk4ZTE5In0.-ck8qwV9hkrzRLWBJfkIvdI_6jV3zj32KgEEikTqlfLEzxuy7Y7VOM6UdbLGlCPASs-_t2lZgEi_8ar12xTkBw'

const client = createClient({ url, authToken })

// ── 1. New category list (alphabetical in Bulgarian) ─────────────────────────
const newCategories = [
  { id: 'cat_archaeology',  name: 'Археология',               slug: 'archaeology' },
  { id: 'cat_theology',     name: 'Богословие',               slug: 'theology' },       // keep existing
  { id: 'cat_children',     name: 'Детски книги',             slug: 'children' },
  { id: 'cat_encyclopedias',name: 'Енциклопедии и речници',   slug: 'encyclopedias' },
  { id: 'cat_health',       name: 'Здраве и хранене',         slug: 'health' },
  { id: 'cat_economics',    name: 'Икономика',                slug: 'economics' },
  { id: 'cat_history',      name: 'История',                  slug: 'history' },        // rename from Църковна история
  { id: 'cat_music',        name: 'Музика',                   slug: 'music' },
  { id: 'cat_pedagogy',     name: 'Педагогика',               slug: 'pedagogy' },
  { id: 'cat_law',          name: 'Право',                    slug: 'law' },
  { id: 'cat_psychology',   name: 'Психология',               slug: 'psychology' },
  { id: 'cat_exact',        name: 'Точни науки',              slug: 'exact-sciences' },
  { id: 'cat_tourism',      name: 'Туризъм',                  slug: 'tourism' },
  { id: 'cat_textbooks',    name: 'Учебници',                 slug: 'textbooks' },
  { id: 'cat_philosophy',   name: 'Философия',                slug: 'philosophy' },     // rename from Религиозна философия
  { id: 'cat_fiction',      name: 'Художествена литература',  slug: 'fiction' },
]

// ── 2. Old categories to merge → Богословие ─────────────────────────────────
const mergeToTheology = ['cat_patristic', 'cat_liturgical', 'cat_hagiography',
                          'cat_spirituality', 'cat_bible', 'cat_iconography']

// ── 3. Insert/update categories ──────────────────────────────────────────────
console.log('Актуализиране на категории...\n')

for (const cat of newCategories) {
  await client.execute({
    sql: `INSERT INTO "Category" (id, name, slug)
          VALUES (?, ?, ?)
          ON CONFLICT(id) DO UPDATE SET name=excluded.name, slug=excluded.slug`,
    args: [cat.id, cat.name, cat.slug],
  })
  console.log(`✓ ${cat.name}`)
}

// ── 4. Merge old theological sub-categories → cat_theology ──────────────────
console.log('\nОбединяване на богословски категории...')
for (const oldId of mergeToTheology) {
  const res = await client.execute({
    sql: `UPDATE "Book" SET categoryId = 'cat_theology' WHERE categoryId = ?`,
    args: [oldId],
  })
  if (res.rowsAffected > 0) console.log(`  merged ${res.rowsAffected} books from ${oldId}`)
}

// ── 5. Rename History slug ───────────────────────────────────────────────────
// cat_history already exists — books with it keep their link, just name changed above

// ── 6. Reassign specific books to new categories ─────────────────────────────
console.log('\nПренасочване на книги...')

const reassign = [
  // Books to reassign by title
  { title: 'Как да отгледаме децата си като зрели личности',                      catId: 'cat_pedagogy' },
  { title: 'Обща история на екскурзоводството – том 1',                           catId: 'cat_tourism' },
  { title: 'Литература и антропология',                                            catId: 'cat_textbooks' },
  { title: 'Митове и архетипи в българската литература',                          catId: 'cat_fiction' },
  { title: 'Чеда на социализма',                                                   catId: 'cat_history' },
  { title: 'A Slavonic-Bulgarian History',                                          catId: 'cat_history' },
  { title: '… И на вси словене книга да четат',                                   catId: 'cat_history' },
  { title: '"Страшният съд" в монументалната живопис на Българското възраждане – ХVІІІ-ХІХ век', catId: 'cat_history' },
  { title: '120 въпроса и отговора от християнската психотерапевтична практика',  catId: 'cat_psychology' },
  { title: 'Ab Oriente lux – музика на православния Изток + CD',                  catId: 'cat_music' },
  { title: 'Православно-християнската вяра и Българската народна църква като фактори за запазването на българския народ', catId: 'cat_history' },
  { title: 'Основаване на Българската църква – 870 г.',                           catId: 'cat_history' },
  { title: '150 години Българска екзархия',                                       catId: 'cat_history' },
  { title: 'Основаване на Българската духовна академия',                          catId: 'cat_history' },
  // Move old "other" books
  { title: 'Богословски размисли',                                                 catId: 'cat_theology' },
]

for (const { title, catId } of reassign) {
  const res = await client.execute({
    sql: `UPDATE "Book" SET categoryId = ? WHERE title = ?`,
    args: [catId, title],
  })
  if (res.rowsAffected > 0) console.log(`  ✓ ${title.slice(0, 60)} → ${catId}`)
}

// ── 7. Delete old empty categories ──────────────────────────────────────────
const toDelete = ['cat_patristic', 'cat_liturgical', 'cat_hagiography',
                   'cat_spirituality', 'cat_bible', 'cat_iconography', 'cat_other']
console.log('\nПочистване на стари категории...')
for (const id of toDelete) {
  try {
    await client.execute({ sql: `DELETE FROM "Category" WHERE id = ?`, args: [id] })
    console.log(`  removed ${id}`)
  } catch {}
}

console.log('\n✅ Категориите са актуализирани!')
client.close()
