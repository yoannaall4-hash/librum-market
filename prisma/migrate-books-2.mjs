import { createClient } from '@libsql/client'

const url = 'https://librum-market-yoanna.aws-eu-west-1.turso.io'
const authToken = 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NzYxNDI4NzcsImlkIjoiMDE5ZDhhMmItYjUwMS03YWExLWIyYTItY2FjMmJkNWQyMGQ3IiwicmlkIjoiMWZkMGI2ZTMtMWViMy00YmViLTljNzEtNGJmZDliMzk4ZTE5In0.-ck8qwV9hkrzRLWBJfkIvdI_6jV3zj32KgEEikTqlfLEzxuy7Y7VOM6UdbLGlCPASs-_t2lZgEi_8ar12xTkBw'

const client = createClient({ url, authToken })

function cuid() {
  return 'c' + Math.random().toString(36).slice(2, 9) + Date.now().toString(36)
}

const adminRes = await client.execute({
  sql: `SELECT id FROM "User" WHERE email = ? LIMIT 1`,
  args: ['librum.bookstore@gmail.com'],
})
const adminId = adminRes.rows[0].id

async function upsertPublisher(name) {
  const existing = await client.execute({ sql: `SELECT id FROM "Publisher" WHERE name = ? LIMIT 1`, args: [name] })
  if (existing.rows.length > 0) return existing.rows[0].id
  const id = cuid()
  await client.execute({ sql: `INSERT INTO "Publisher" (id, name) VALUES (?, ?)`, args: [id, name] })
  return id
}

async function upsertAuthor(name) {
  const existing = await client.execute({ sql: `SELECT id FROM "Author" WHERE name = ? LIMIT 1`, args: [name] })
  if (existing.rows.length > 0) return existing.rows[0].id
  const id = cuid()
  await client.execute({ sql: `INSERT INTO "Author" (id, name) VALUES (?, ?)`, args: [id, name] })
  return id
}

async function findCategory(slug) {
  const res = await client.execute({ sql: `SELECT id FROM "Category" WHERE slug = ? LIMIT 1`, args: [slug] })
  return res.rows.length > 0 ? res.rows[0].id : null
}

async function insertBook(book) {
  const pubId = book.publisher ? await upsertPublisher(book.publisher) : null
  const catId = book.categorySlug ? await findCategory(book.categorySlug) : null
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
  console.log(`✓ ${book.title.slice(0, 70)}`)
}

const BASE = 'https://www.librum.bg/wp-content/uploads'

const books = [
  {
    title: '… И на вси словене книга да четат',
    authors: ['Боян Смилов', 'Цветана Павлова'],
    price: 12.01,
    publisher: 'Синодално издателство',
    year: 1985,
    pages: 190,
    categorySlug: 'history',
    image: `${BASE}/2021/02/slovene.jpg`,
    description: 'Сборник, посветен на светите братя Кирил и Методий и тяхното историческо дело. Издаден по случай 1100-годишнината от блажената кончина на свети Методий.',
  },
  {
    title: '"Бърз помощник…" – чудесата на свети Лука днес',
    authors: ['Арголидски митрополит Нектарий'],
    price: 29.34,
    isbn: '978-619-90736-0-5',
    publisher: 'Храм "Св. св. Кирил и Методий" - Ловеч',
    year: 2016,
    pages: 205,
    categorySlug: 'hagiography',
    image: `${BASE}/2023/08/barz-pomoshtnik-chudesata-na-sveti-luka-dnes-1.jpg`,
    description: 'Документирани съвременни чудеса на свети Лука Кримски. Съдържа многобройни свидетелства от Гърция за чудотворни изцеления и Божествена намеса в критични жизнени ситуации.',
  },
  {
    title: '"Страшният съд" в монументалната живопис на Българското възраждане – ХVІІІ-ХІХ век',
    authors: ['Татяна Иванова'],
    price: 49.99,
    isbn: '978-954-07-5886-2',
    publisher: 'Университетско издателство "Св. Климент Охридски"',
    year: 2023,
    pages: 474,
    categorySlug: 'iconography',
    image: `${BASE}/2023/07/strashniyat-sad.jpg`,
    description: 'Първото всеобхватно изследване на иконографията на Страшния съд в паметниците на Българското възраждане. Представя уникален корпус от композиции от XVIII-XIX век, анализирайки богословските и художествени измерения.',
  },
  {
    title: '1000 мисли за Бога',
    authors: ['Кирил Палешутски'],
    price: 10.60,
    isbn: '954-8083-06-Х',
    publisher: 'Форчън',
    year: 1993,
    pages: 124,
    categorySlug: 'spirituality',
    image: `${BASE}/2021/10/1000-misli-za-boga.jpg`,
    description: 'Сборник от 1000 мисли за Бога, обхващащ значителна част от световното духовно богатство, изразено в индивидуални размисли за вечните, екзистенциалните проблеми на човешкото съществуване.',
  },
  {
    title: '120 въпроса и отговора от християнската психотерапевтична практика',
    authors: ['Владета Йеротич'],
    price: 17.99,
    isbn: '978-954-2972-40-2',
    publisher: 'Омофор',
    year: 2015,
    pages: 335,
    categorySlug: 'spirituality',
    image: `${BASE}/2022/08/120-vaprosa-i-otgovora-1.jpg`,
    description: 'Сборник от опита на сръбския психотерапевт и православен мислител Владета Йеротич. Отговаря на въпроси за лични кризи, семейни проблеми, болест и смърт, съчетавайки психологическото познание с христово перспективата.',
  },
  {
    title: '33 проповеди при Кръщение, Венчание и др.',
    authors: ['Иван Николов'],
    price: 9.99,
    publisher: 'Витезда',
    pages: 188,
    categorySlug: 'theology',
    image: `${BASE}/2023/04/33-propovedi-pri-krashtenie-venchanie-i-dr.jpg`,
    description: 'Сборник от 33 проповеди за Кръщение, Венчание и други тържествени случаи. Практическо помагало за свещеници и миряни.',
  },
  {
    title: '33 проповеди при погребение',
    authors: ['Иван Николов'],
    price: 9.99,
    publisher: 'Витезда',
    pages: 214,
    categorySlug: 'theology',
    image: `${BASE}/2023/04/33-propovedi-pri-pogrebenie.jpg`,
    description: 'Сборник от 33 проповеди за погребални служби. Практическо помагало за духовенство и миряни при изпращането на починали.',
  },
  {
    title: '50 Нобелови лауреати и други велики учени за вярата си в Бога',
    authors: ['Тихомир Димитров'],
    price: 10.56,
    isbn: '978-954-90892-5-7',
    publisher: 'Спектра',
    year: 2006,
    pages: 161,
    categorySlug: 'theology',
    image: `${BASE}/2021/02/korica-10.jpg`,
    description: 'Антология с документирани цитати, избрани от книги, статии и писма на едни от най-авторитетните учени и творци в света. Свидетелства на нобелови лауреати за вярата им в Бога.',
  },
  {
    title: 'A Slavonic-Bulgarian History',
    authors: ['Свети Паисий Хилендарски'],
    price: 35.01,
    isbn: '978-954-770-442-8',
    publisher: 'Зографски манастир',
    year: 2018,
    pages: 166,
    categorySlug: 'history',
    image: `${BASE}/2024/11/a-slavonic-bulgarian-history.jpg`,
    description: 'Анотиран превод на английски език на основополагащия текст на българското национално съзнание, издаден от Светата Зографска обител на Атон. Включва факсимиле на оригиналния ръкопис от 1762 г.',
  },
  {
    title: 'Библия, Църква, Предание (Православно гледище)',
    authors: ['Георги Флоровски'],
    price: 15.00,
    publisher: 'Валдекс ООД',
    year: 2003,
    pages: 160,
    categorySlug: 'theology',
    image: `${BASE}/2021/08/bibliya-czrkva-predanie.jpg`,
    description: 'Първи том от събраните съчинения на о. Георги Флоровски на български. Съдържа седем есета по богословски въпроси: несторианство, монофизитство, свобода и власт в Църквата, значението на Халкидон и Вселенските събори.',
  },
  {
    title: 'Венчават се Божиите раби…',
    authors: ['Иван Иванов'],
    price: 12.58,
    isbn: '978-954-9401-30-1',
    publisher: 'АртГраф',
    year: 2009,
    pages: 112,
    categorySlug: 'liturgical',
    image: `${BASE}/2023/10/venchavat-se-bozhiite-rabi.jpg`,
    description: 'Изследване на богословските и литургичните аспекти на христианското тайнство Брак. Анализира текстовите свидетелства за богослужебния чин на тайнството, запазен в православната практика от византийски и славянски писмени източници.',
  },
  {
    title: 'Вяра и живот: Сборник материали по Патрология, Догматика и Етика',
    authors: ['Димитър Киров', 'Иван Петев', 'Тотю Коев'],
    price: 20.01,
    isbn: '954-524-069-2',
    publisher: 'Университетско издателство "Св. св. Кирил и Методий"',
    year: 1994,
    pages: 552,
    categorySlug: 'theology',
    image: `${BASE}/2022/05/vyara-i-zhivot.jpg`,
    description: 'Учебен сборник за богословски студенти, обхващащ патристични текстове, православни догматични принципи и христианско етическо учение.',
  },
  {
    title: 'Девет слова за покаянието',
    authors: ['Св. Йоан Златоуст'],
    price: 10.56,
    isbn: '954-8337-05-3',
    publisher: 'ЕТ "София-С. А."',
    year: 1994,
    pages: 142,
    categorySlug: 'patristic',
    image: `${BASE}/2021/10/sv.-joan-zlatoust.jpg`,
    description: 'Сборник от проповеди на Свети Йоан Златоуст – сред най-хубавите в неговото наследство. Преведени за пръв път от старогръцки на български. Безценно духовно четиво за покаяние и вътрешно очистване.',
  },
  {
    title: 'Две послания до коринтяните',
    authors: ['Климент Римски'],
    price: 15.00,
    isbn: '978-954-8398-71-8',
    publisher: 'Синодално издателство',
    year: 2011,
    pages: 118,
    categorySlug: 'patristic',
    image: `${BASE}/2022/01/dve-poslaniya-korintyani.jpg`,
    description: 'Двуезично издание с паралелен текст на старогръцки и новобългарски. Включва научно изследване за живота и делото на Свети Климент Римски, с индекси на личните имена, географските места и библейските препратки.',
  },
  {
    title: 'Дева Мария. Благословена между жените',
    authors: ['Димитър Киров'],
    price: 8.00,
    isbn: '978-954-423-738-7',
    publisher: 'Университетско издателство "Паисий Хилендарски"',
    year: 2011,
    pages: 236,
    categorySlug: 'theology',
    image: `${BASE}/2022/06/deva-mariya-blagoslovena.jpg`,
    description: 'Изследва изключителните духовни и телесни качества на Пресвета Богородица, нейното място в Божия замисъл за сътворението. Разглежда ролята на жената в творението и призванието й.',
  },
  {
    title: 'Догматика на Православната църква. Пневматология. Част 1',
    authors: ['Иустин Попович'],
    price: 17.99,
    isbn: '978-619-7174-23-6',
    publisher: 'Видинска света митрополия',
    year: 2014,
    pages: 310,
    categorySlug: 'theology',
    image: `${BASE}/2023/04/dogmatika-na-pravoslavnata-czarkva-pnevmatologiya.jpg`,
    description: 'Православно учение за Църквата и действието на Светия Дух в нея, свещените тайнства, йерархията, богослужебните действия и религиозните празници. Основен догматически труд на преподобни Иустин Попович.',
  },
  {
    title: 'In memoriam – сборник в памет на протойерей Георги Флоровски (1893–1979)',
    authors: ['Авторски колектив'],
    price: 15.57,
    isbn: '978-954-94016-7-7',
    publisher: 'ICTSC',
    year: 2012,
    pages: 250,
    categorySlug: 'theology',
    description: 'Юбилеен сборник, отбелязващ 30 години от кончината на протоиерей Георги Флоровски. Представя изследвания за различните аспекти на живота и богословското дело на този виден православен богослов на XX век.',
  },
  {
    title: 'Ab Oriente lux – музика на православния Изток + CD',
    authors: ['Авторски колектив'],
    price: 35.01,
    isbn: '978-619-91108-0-5',
    publisher: 'Българско музикално сдружение',
    year: 2018,
    pages: 224,
    categorySlug: 'liturgical',
    description: 'Проект, представящ православните църковни песнопения от славяно-византийския културен свят като европейско музикално наследство. Включва композиции от X-XX век, транскрибирани от ръкописи от монастири, архиви и библиотеки. Двуезично (български и английски).',
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
