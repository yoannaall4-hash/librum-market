import { createClient } from '@libsql/client'

const url = 'https://librum-market-yoanna.aws-eu-west-1.turso.io'
const authToken = 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NzYxNDI4NzcsImlkIjoiMDE5ZDhhMmItYjUwMS03YWExLWIyYTItY2FjMmJkNWQyMGQ3IiwicmlkIjoiMWZkMGI2ZTMtMWViMy00YmViLTljNzEtNGJmZDliMzk4ZTE5In0.-ck8qwV9hkrzRLWBJfkIvdI_6jV3zj32KgEEikTqlfLEzxuy7Y7VOM6UdbLGlCPASs-_t2lZgEi_8ar12xTkBw'

const client = createClient({ url, authToken })

function cuid() {
  return 'c' + Math.random().toString(36).slice(2, 9) + Date.now().toString(36)
}

// ── 1. Find admin user ───────────────────────────────────────────────────────
const adminRes = await client.execute({
  sql: `SELECT id FROM "User" WHERE email = ? LIMIT 1`,
  args: ['librum.bookstore@gmail.com'],
})
if (adminRes.rows.length === 0) {
  console.error('❌ Admin user librum.bookstore@gmail.com not found. Run create-admin.mjs first.')
  process.exit(1)
}
const adminId = adminRes.rows[0].id
console.log(`✓ Admin found: ${adminId}`)

// ── 2. Upsert publishers ─────────────────────────────────────────────────────
async function upsertPublisher(name) {
  const existing = await client.execute({
    sql: `SELECT id FROM "Publisher" WHERE name = ? LIMIT 1`,
    args: [name],
  })
  if (existing.rows.length > 0) return existing.rows[0].id
  const id = cuid()
  await client.execute({
    sql: `INSERT INTO "Publisher" (id, name) VALUES (?, ?)`,
    args: [id, name],
  })
  console.log(`  + Publisher: ${name}`)
  return id
}

// ── 3. Upsert authors ────────────────────────────────────────────────────────
async function upsertAuthor(name) {
  const existing = await client.execute({
    sql: `SELECT id FROM "Author" WHERE name = ? LIMIT 1`,
    args: [name],
  })
  if (existing.rows.length > 0) return existing.rows[0].id
  const id = cuid()
  await client.execute({
    sql: `INSERT INTO "Author" (id, name) VALUES (?, ?)`,
    args: [id, name],
  })
  console.log(`  + Author: ${name}`)
  return id
}

// ── 4. Find category by slug ─────────────────────────────────────────────────
async function findCategory(slug) {
  const res = await client.execute({
    sql: `SELECT id FROM "Category" WHERE slug = ? LIMIT 1`,
    args: [slug],
  })
  return res.rows.length > 0 ? res.rows[0].id : null
}

// ── 5. Insert book + authors ─────────────────────────────────────────────────
async function insertBook(book) {
  const pubId = book.publisher ? await upsertPublisher(book.publisher) : null
  const catId = book.categorySlug ? await findCategory(book.categorySlug) : null

  const bookId = cuid()
  await client.execute({
    sql: `INSERT INTO "Book"
      (id, title, description, isbn, language, condition, price, originalPrice,
       stock, images, year, pages, status, sellerId, publisherId, categoryId, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, 'bg', 'new', ?, NULL, 1, '[]', ?, ?, 'active', ?, ?, ?, datetime('now'), datetime('now'))`,
    args: [
      bookId,
      book.title,
      book.description,
      book.isbn ?? null,
      book.price,
      book.year ?? null,
      book.pages ?? null,
      adminId,
      pubId,
      catId,
    ],
  })

  for (const authorName of (book.authors ?? [])) {
    const authorId = await upsertAuthor(authorName)
    await client.execute({
      sql: `INSERT OR IGNORE INTO "BookAuthor" (bookId, authorId) VALUES (?, ?)`,
      args: [bookId, authorId],
    })
  }

  console.log(`✓ ${book.title}`)
}

// ── 6. Book data ─────────────────────────────────────────────────────────────
const books = [
  {
    title: 'Взаимните отношения между светите апостоли Петър и Павел, отразени в техните послания',
    authors: ['Архимандрит Сергий Язаджиев'],
    price: 9.00,
    publisher: 'Синодално издателство',
    year: 1967,
    pages: 9,
    categorySlug: 'theology',
    description: 'Научен труд, изследващ взаимните отношения между светите апостоли Петър и Павел, отразени в техните послания. Публикуван в Годишника на Духовната академия „Св. Климент Охридски", София.',
  },
  {
    title: 'Проповедта и дейността на Господния предтеча св. Йоан Кръстител – ч.1',
    authors: ['Архимандрит Сергий Язаджиев'],
    price: 9.13,
    publisher: 'Синодално издателство',
    year: 1962,
    pages: 79,
    categorySlug: 'theology',
    description: 'Трудът разглежда подготвителния характер на Йоан Кръстителевото служение чрез покайническата проповед и кръщението на покаяние. Обхваща публичното му служение, обличенията към фарисеите и садукеите и първото свидетелство за Иисус Христос.',
  },
  {
    title: 'Ръководство за изучаване пророческите книги на Стария Завет',
    authors: ['Христо Попов'],
    price: 25.99,
    publisher: 'Синодално издателство',
    year: 1990,
    pages: 341,
    categorySlug: 'theology',
    description: 'Учебно помагало, задълбочено разглеждащо старозаветните пророчества, техния предмет, отличителни черти, исторически контекст и произход. Второ преработено и допълнено издание.',
  },
  {
    title: 'Дванадесетте пророци – Пророк Михей',
    authors: ['Иван Марковски'],
    price: 6.00,
    publisher: 'Синодално издателство',
    year: 1956,
    pages: 16,
    categorySlug: 'theology',
    description: 'Изследва личността на пророк Михей, периода на неговата дейност, религиозните и нравствените идеи в книгата му и предсказанията за месианско бъдеще.',
  },
  {
    title: 'Основаване на Българската църква – 870 г.',
    authors: ['Тодор Събев'],
    price: 6.71,
    publisher: 'Синодално издателство',
    year: 1971,
    pages: 44,
    categorySlug: 'history',
    description: 'Подробен анализ на събитията и факторите, свързани с приемането на християнството в България и формирането на Българската православна църква като самостоятелна институция. Публикуван в Годишника на Духовната академия „Св. Климент Охридски".',
  },
  {
    title: 'Православно-християнската вяра и Българската народна църква като фактори за запазването на българския народ',
    authors: ['Радко Поптодоров'],
    price: 8.19,
    publisher: 'Синодално издателство',
    year: 1970,
    pages: 99,
    categorySlug: 'history',
    description: 'Изследва ролята на православно-християнската вяра и Българската народна църква в запазването на националната идентичност и културното развитие на България по време на петвековното османско владичество.',
  },
  {
    title: 'Как да отгледаме децата си като зрели личности',
    authors: ['Джули Литкот-Хеймс'],
    price: 24.00,
    isbn: '978-619-7690-16-3',
    publisher: 'Librum',
    year: 2024,
    pages: 447,
    categorySlug: 'other',
    description: 'Практическо родителско ръководство, разглеждащо ефектите от свръхпротективното родителство, значението на свободната игра и устойчивостта, и стратегии за отглеждане на независими, уверени деца. Авторката е бивш декан на Станфордския университет.',
  },
  {
    title: 'Христовата светлина просвещава всички',
    authors: ['Соня Тотева-Зафирова'],
    price: 56.72,
    isbn: '978-619-7690-50-7',
    publisher: 'Librum',
    year: 2026,
    pages: 552,
    categorySlug: 'bible',
    description: 'Всеобхватно православно издание, представящо пълния библейски разказ от сътворението до Христовия живот, страст, възкресение и възнесение. Включва обяснителни статии, бележки, снимки и карти на Светите земи. Предназначено за лично четене, катехизация и енорийска употреба.',
  },
  {
    title: 'Псалтикиен минейник',
    authors: ['Манасий Поптеодоров'],
    price: 35.20,
    publisher: 'Librum',
    year: 2026,
    pages: 560,
    categorySlug: 'liturgical',
    description: 'Специализирано музикално-литургично издание, съдържащо химни за богослужения през целия литургичен год. Мостът между ръкописната традиция и съвременната литургична практика – предназначено за певци, богословски студенти и църковни музиканти.',
  },
  {
    title: 'Литература и антропология',
    authors: ['Цветана Георгиева'],
    price: 20.01,
    isbn: '978-619-92246-1-8',
    publisher: 'Formatum',
    year: 2022,
    pages: 205,
    categorySlug: 'philosophy',
    description: 'Учебник, предлагащ задълбочено изследване на теоретични и приложни въпроси, свързани с филологическите методи при изучаването на историческата и културна антропология. За студенти и изследователи в хуманитарните науки.',
  },
  {
    title: 'Митове и архетипи в българската литература',
    authors: ['Цветана Георгиева'],
    price: 20.01,
    isbn: '978-619-92246-0-1',
    publisher: 'Formatum',
    year: 2022,
    pages: 285,
    categorySlug: 'philosophy',
    description: '16 есета около ключови теми: социализъм, създаване на нови митове, историографски митове и архетипи. Разглежда как литературни текстове от 50-те–80-те години интерпретират българската митология в социалистически контекст.',
  },
  {
    title: 'Чеда на социализма',
    authors: ['Иван Денев'],
    price: 16.57,
    isbn: '978-954-92940-2-6',
    publisher: 'Librum',
    year: 2012,
    pages: 420,
    categorySlug: 'history',
    description: 'Документален труд, изследващ сложните и противоречиви отношения между Църквата и Държавата в България по времето на социализма (1944–1989). За пръв път разкрива архивни материали за вербуването на членове на БПЦ от Държавна сигурност.',
  },
  {
    title: 'Византийски икони. Практическо ръководство за начинаещи',
    authors: ['Златина Карчева'],
    price: 19.99,
    isbn: '954-607-723-2',
    publisher: 'Librum',
    year: 2006,
    pages: 156,
    categorySlug: 'iconography',
    description: 'Ресурс за всички интересуващи се от иконопис – от опитни иконографи до начинаещи. Обхваща историята, развитието и технологията на иконописта, с акцент върху връзката с православната доктрина и традиция.',
  },
  {
    title: 'Нашата вяра',
    authors: ['Архимандрит Серафим', 'Макариополски епископ Николай'],
    price: 15.00,
    isbn: '978-954-8398-63-3',
    publisher: 'Синодално издателство',
    year: 2011,
    pages: 300,
    categorySlug: 'theology',
    description: 'Класическо православно издание, повече от половин век въвеждащо поколения българи в основите на православната вяра. Включва свещена история от Стария и Новия завет, православен катехизис и богослужебни практики с илюстрации в стила на класическата православна иконография.',
  },
  {
    title: 'Православието и религията на бъдещето',
    authors: ['Серафим Роуз'],
    price: 16.60,
    isbn: '954-9667-01-4',
    publisher: 'ЕТ "Кирил Маринов"',
    year: 1997,
    pages: 292,
    categorySlug: 'theology',
    description: 'Сборник, разглеждащ православни перспективи за съвременни религиозни явления: индуизъм, йога, Дзен, трансцендентална медитация, НЛО и харизматичното християнство. Иеромонах Серафим Роуз анализира тези движения в светлината на православното предание.',
  },
  {
    title: 'Лествица',
    authors: ['Свети Иоан Лествичник'],
    price: 32.00,
    isbn: '978-954-770-109-6',
    publisher: 'Православно отечество',
    year: 2020,
    pages: 372,
    categorySlug: 'patristic',
    description: 'Прочуто православно духовно ръководство, представящо тридесет стъпки на добродетелите, водещи към христианско съвършенство и Божествена любов. Символизирани като стълба, свързваща земята с небето – безсмъртна класика на аскетичната литература.',
  },
  {
    title: 'Апокалипсис Йоанна',
    authors: ['Сергий Булгаков'],
    price: 18.99,
    publisher: 'Librum',
    year: 1991,
    pages: 352,
    categorySlug: 'theology',
    description: 'Догматично тълкуване на Апокалипсиса – последното завършено произведение на автора, основано на лекции, изнесени в православен богословски институт. Задълбочен богословски и духовен коментар на Откровението на св. апостол Йоан Богослов.',
  },
  {
    title: 'Обща история на екскурзоводството – том 1',
    authors: ['Захарий Дечев'],
    price: 39.12,
    isbn: '978-619-769-03-92',
    publisher: 'Librum',
    year: 2026,
    pages: 296,
    categorySlug: 'other',
    description: 'Основополагащо изследване на възникването, развитието и институционализирането на екскурзоводската дейност в различни исторически и културни контексти. Анализира ранните форми на пътуването, поклонничеството и организираното групово придружаване.',
  },
  {
    title: 'Основаване на Българската духовна академия',
    authors: ['Авторски колектив'],
    price: 12.00,
    publisher: 'Синодално издателство',
    year: 1970,
    pages: 120,
    categorySlug: 'history',
    description: 'Сборник, проследяващ историята на създаването и развитието на Духовната академия „Св. Климент Охридски" в София – основния богословски учебен институт на Българската православна църква.',
  },
  {
    title: 'Богословски размисли',
    authors: ['Авторски колектив'],
    price: 14.00,
    publisher: 'Синодално издателство',
    year: 2000,
    pages: 200,
    categorySlug: 'theology',
    description: 'Сборник богословски студии и размисли от преподаватели на Богословския факултет при Софийски университет „Св. Климент Охридски". Разглежда актуални въпроси на православното богословие.',
  },
  {
    title: '150 години Българска екзархия',
    authors: ['Авторски колектив'],
    price: 18.00,
    publisher: 'Синодално издателство',
    year: 2020,
    pages: 256,
    categorySlug: 'history',
    description: 'Юбилейно издание, посветено на 150-годишнината от учредяването на Българската екзархия (1870). Проследява историческото значение на Екзархията за националното освобождение и духовното развитие на България.',
  },
  {
    title: 'Чистият ум. Контрол над помислите',
    authors: ['Архимандрит Емилиан Симонопетрски'],
    price: 22.00,
    publisher: 'Православно отечество',
    year: 2015,
    pages: 280,
    categorySlug: 'spirituality',
    description: 'Духовни беседи на схиархимандрит Емилиан Симонопетрски за трезвението, контрола над помислите и очистването на ума. Безценно ръководство за духовен живот в православната аскетична традиция.',
  },
  {
    title: 'Новият Завет. Псалми',
    authors: [],
    price: 15.00,
    publisher: 'Синодално издателство',
    year: 2019,
    pages: 480,
    categorySlug: 'bible',
    description: 'Канонично издание на Новия Завет заедно с Псалмите на цар Давид. Издадено от Светия Синод на Българската православна църква, в съвременен превод на български език.',
  },
]

// ── 7. Run migrations ────────────────────────────────────────────────────────
console.log(`\nМигриране на ${books.length} книги...\n`)
let success = 0
let failed = 0
for (const book of books) {
  try {
    await insertBook(book)
    success++
  } catch (err) {
    console.error(`✗ ${book.title}: ${err.message}`)
    failed++
  }
}

console.log(`\n✅ ${success} книги добавени, ${failed} грешки`)
client.close()
