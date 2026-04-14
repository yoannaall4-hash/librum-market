import { createClient } from '@libsql/client'

const url = 'https://librum-market-yoanna.aws-eu-west-1.turso.io'
const authToken = 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NzYxNDI4NzcsImlkIjoiMDE5ZDhhMmItYjUwMS03YWExLWIyYTItY2FjMmJkNWQyMGQ3IiwicmlkIjoiMWZkMGI2ZTMtMWViMy00YmViLTljNzEtNGJmZDliMzk4ZTE5In0.-ck8qwV9hkrzRLWBJfkIvdI_6jV3zj32KgEEikTqlfLEzxuy7Y7VOM6UdbLGlCPASs-_t2lZgEi_8ar12xTkBw'

const client = createClient({ url, authToken })

function cuid() {
  return 'c' + Math.random().toString(36).slice(2, 9) + Date.now().toString(36)
}

const adminRes = await client.execute({ sql: `SELECT id FROM "User" WHERE email = ? LIMIT 1`, args: ['librum.bookstore@gmail.com'] })
const adminId = adminRes.rows[0].id

async function upsertPublisher(name) {
  const ex = await client.execute({ sql: `SELECT id FROM "Publisher" WHERE name = ? LIMIT 1`, args: [name] })
  if (ex.rows.length > 0) return ex.rows[0].id
  const id = cuid()
  await client.execute({ sql: `INSERT INTO "Publisher" (id, name) VALUES (?, ?)`, args: [id, name] })
  return id
}

async function upsertAuthor(name) {
  const ex = await client.execute({ sql: `SELECT id FROM "Author" WHERE name = ? LIMIT 1`, args: [name] })
  if (ex.rows.length > 0) return ex.rows[0].id
  const id = cuid()
  await client.execute({ sql: `INSERT INTO "Author" (id, name) VALUES (?, ?)`, args: [id, name] })
  return id
}

async function insertBook(book) {
  const pubId = book.publisher ? await upsertPublisher(book.publisher) : null
  const catRes = await client.execute({ sql: `SELECT id FROM "Category" WHERE slug = ? LIMIT 1`, args: [book.categorySlug] })
  const catId = catRes.rows.length > 0 ? catRes.rows[0].id : null
  const bookId = cuid()
  const images = book.image ? JSON.stringify([book.image]) : '[]'
  await client.execute({
    sql: `INSERT INTO "Book"
      (id, title, description, isbn, language, condition, price, originalPrice,
       stock, images, year, pages, status, sellerId, publisherId, categoryId, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, 'bg', 'new', ?, NULL, 1, ?, ?, ?, 'active', ?, ?, ?, datetime('now'), datetime('now'))`,
    args: [bookId, book.title, book.description, book.isbn ?? null, book.price, images, book.year ?? null, book.pages ?? null, adminId, pubId, catId],
  })
  for (const authorName of (book.authors ?? [])) {
    const authorId = await upsertAuthor(authorName)
    await client.execute({ sql: `INSERT OR IGNORE INTO "BookAuthor" (bookId, authorId) VALUES (?, ?)`, args: [bookId, authorId] })
  }
  console.log(`✓ [${book.categorySlug}] ${book.title.slice(0, 65)}`)
}

const BASE = 'https://www.librum.bg/wp-content/uploads'

const books = [
  // ── Психология ────────────────────────────────────────────────────────────
  {
    title: 'Православна психотерапия (Светоотечески терапевтичен курс)',
    authors: ['Йеротей Влахос'],
    price: 24.60,
    isbn: '978-954-493-014-1',
    publisher: 'Праксис',
    year: 2009,
    pages: 376,
    categorySlug: 'psychology',
    image: `${BASE}/2022/01/pravoslavna-psihoterapiya-1.jpg`,
    description: 'Изследва терапевтичното изцеление на човешката личност чрез учението на св. Отци. Православието като терапевтична наука, православна патология и исихазъмът като терапевтичен метод. Фундаментален труд за православна духовна психология.',
  },
  {
    title: 'Православният възглед за душевните болести',
    authors: ['Дмитрий Авдеев'],
    price: 15.61,
    isbn: '978-954-2972-14-3',
    publisher: 'Омофор',
    year: 2013,
    pages: 176,
    categorySlug: 'psychology',
    description: 'Психиатърът и психотерапевт Авдеев изследва ролята на морално-духовните фактори в появата на психичните болести. Православен подход към психотерапията – за смисъла на страданието и преодоляването на душевните разстройства.',
  },
  {
    title: 'Помисли пак',
    authors: ['Адам Грант'],
    price: 28.01,
    isbn: '978-954-771-449-6',
    publisher: 'Кръгозор',
    year: 2021,
    pages: 344,
    categorySlug: 'psychology',
    description: 'Как да преосмисляме възгледите си в свят, променящ се с невероятна скорост. Грант разкрива защо интелигентността сама по себе си не е достатъчна и въвежда концепцията за преосмислянето като ключ за адаптиране към съвременните предизвикателства.',
  },

  // ── Философия ─────────────────────────────────────────────────────────────
  {
    title: 'Аналитики, Том 1',
    authors: ['Аристотел'],
    price: 25.00,
    isbn: '954-445-456-Х',
    publisher: 'Христо Ботев',
    year: 1997,
    pages: 471,
    categorySlug: 'philosophy',
    description: 'Класическа философска творба, упражнявала дълбоко влияние върху европейската мисъл повече от два хилядолетия. Съдържа „За тълкуването" и „Първа аналитика" с коментари. Поставя основите на класическата логика и научната методология.',
  },
  {
    title: 'Максими и размисли. Басни. Характери',
    authors: ['Лабрюйер', 'Ларошфуко', 'Лафонтен'],
    price: 9.99,
    publisher: 'Народна култура',
    year: 1983,
    pages: 744,
    categorySlug: 'philosophy',
    description: 'Събрани произведения на три велики французки моралисти от XVII век. Острите и точни максими на Ларошфуко, проницателните характери на Лабрюйер и баснословното изкуство на Лафонтен – безсмъртна класика на моралистичната литература.',
  },

  // ── Археология ────────────────────────────────────────────────────────────
  {
    title: 'Археология на морското дъно',
    authors: ['Джордж Бас'],
    price: 10.56,
    publisher: 'Георги Бакалов',
    year: 1982,
    pages: 205,
    categorySlug: 'archaeology',
    image: `${BASE}/2023/11/arheologiya-na-morskoto-dano.jpg`,
    description: 'Първа книга от библиотека „Нептун". Изследване на подводната археология – открития на потънали кораби, антични пристанища и артефакти от дъното на моретата. Богато илюстрирано с снимки и рисунки.',
  },
  {
    title: 'Антарктическа карта – 95 български имена',
    authors: ['Аспарух Камбуров', 'Любомир Иванов'],
    price: 13.57,
    isbn: '978-619-90008-6-1',
    publisher: 'Фондация Манфред Вьорнер',
    year: 2023,
    pages: 1,
    categorySlug: 'exact-sciences',
    image: `${BASE}/2023/04/antarkticheska-karta-95-balgarski-imena.jpeg`,
    description: 'Картографско издание на о-в Ливингстън, Антарктида, с 95 международно признати български географски имена. Включва данни от суперкомпютърни технологии на американски университети и резултати от българските полярни изследвания.',
  },

  // ── Здраве и хранене ──────────────────────────────────────────────────────
  {
    title: 'Здраве, болести и страдания. Какво казват медицината, религиите и Библията',
    authors: ['Дечко Свиленов'],
    price: 10.56,
    isbn: '978-619-7015-12-6',
    publisher: 'Фондация "Приятели за България"',
    year: 2014,
    pages: 416,
    categorySlug: 'health',
    image: `${BASE}/2023/10/zdrave-bolesti-i-stradaniya.jpg`,
    description: 'Изследва духовния смисъл на страданието от гледна точка на медицинската наука, религиозните традиции и библейските послания. Авторът – profesор с православно богословско и медицинско образование – разглежда страданието като Божествено послание.',
  },

  // ── Право ─────────────────────────────────────────────────────────────────
  {
    title: 'Правни отношения и правни връзки',
    authors: ['Тенчо Колев'],
    price: 30.00,
    isbn: '954-680-086-4',
    publisher: 'Юриспрес',
    year: 1997,
    pages: 159,
    categorySlug: 'law',
    description: 'Основополагащо изследване на ключови аспекти на правото, свързани с правните отношения и техните взаимовръзки. Теоретичен анализ на правните категории – незаменим ресурс за юристи, изследователи и студенти по право.',
  },
  {
    title: 'Православно църковно право',
    authors: ['Никодим Милаш'],
    price: 30.00,
    publisher: 'Синодално издателство',
    year: 1904,
    categorySlug: 'law',
    description: 'Класически труд по православно църковно право от известния сръбски канонист Никодим Милаш. Систематично изложение на каноническото право на Православната църква – незаменим наръчник за богослови, свещеници и юристи.',
  },

  // ── Детски книги ──────────────────────────────────────────────────────────
  {
    title: 'Детски писма до Бога',
    authors: ['Ерик Маршал', 'Стюарт Хампъл'],
    price: 16.00,
    isbn: '978-954-2972-67-9',
    publisher: 'Омофор',
    year: 2018,
    pages: 88,
    categorySlug: 'children',
    description: 'Трогателна сбирка от истински мисли и въпроси на деца, адресирани към Бога. Книгата съдържа трогателни и забавни писма, отразяващи детска невинност и любопитство относно вярата, любовта и надеждата.',
  },

  // ── Художествена литература ───────────────────────────────────────────────
  {
    title: 'Златното магаре',
    authors: ['Апулей'],
    price: 7.00,
    publisher: 'Народна култура',
    year: 1984,
    pages: 294,
    categorySlug: 'fiction',
    image: `${BASE}/2023/04/zlatnoto-magare-koricza.jpg`,
    description: 'Митологичното произведение на Апулей с предговор от Богдан Богданов. Включва мита за Психея и Купидон. Единственият напълно оцелял латински роман – класика на античната литература.',
  },

  // ── Педагогика ────────────────────────────────────────────────────────────
  {
    title: 'Педагогика на езика',
    authors: ['Тодор Шопов'],
    price: 48.56,
    isbn: '978-954-07-3538-2',
    publisher: 'Университетско издателство "Св. Климент Охридски"',
    year: 2013,
    pages: 435,
    categorySlug: 'pedagogy',
    description: 'Академичен текст, представящ комуникативния подход в съвременното езиково обучение. Систематизира школи, направления и методологии в областта на обучението по английски като втори език. За студенти и преподаватели по педагогика.',
  },
]

console.log(`\nМигриране на ${books.length} нови книги...\n`)
let ok = 0, fail = 0
for (const book of books) {
  try {
    await insertBook(book)
    ok++
  } catch (err) {
    console.error(`✗ ${book.title.slice(0, 60)}: ${err.message}`)
    fail++
  }
}
console.log(`\n✅ ${ok} добавени, ${fail} грешки`)
client.close()
