import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'
import bcrypt from 'bcryptjs'

const adapter = new PrismaLibSql({ url: 'file:dev.db' })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('Зареждане на начални данни...')

  // Theological categories
  const catDefs = [
    { slug: 'scripture', name: 'Свещено Писание' },
    { slug: 'patristic', name: 'Патристика' },
    { slug: 'dogmatics', name: 'Догматика' },
    { slug: 'liturgics', name: 'Литургика' },
    { slug: 'homiletics', name: 'Омилетика' },
    { slug: 'ascetics', name: 'Аскетика' },
    { slug: 'history', name: 'Църковна история' },
    { slug: 'contemporary', name: 'Съвременно богословие' },
    { slug: 'hagiography', name: 'Жития на светци' },
    { slug: 'spirituality', name: 'Духовност и молитва' },
    { slug: 'canonical', name: 'Канонично право' },
    { slug: 'iconography', name: 'Иконография' },
  ]

  const cats: Record<string, { id: string }> = {}
  for (const def of catDefs) {
    const cat = await prisma.category.upsert({
      where: { slug: def.slug },
      update: { name: def.name },
      create: { name: def.name, slug: def.slug },
    })
    cats[def.slug] = cat
  }
  console.log(`✓ ${catDefs.length} категории`)

  // Publishers
  const pubDefs = [
    { name: 'Синодално издателство', country: 'БГ' },
    { name: 'Омофор', country: 'БГ' },
    { name: 'Паломник', country: 'РУ' },
    { name: 'Изток–Запад', country: 'БГ' },
    { name: 'Свети Климент Охридски', country: 'БГ' },
  ]
  const pubs: Record<string, { id: string }> = {}
  for (const def of pubDefs) {
    const pub = await prisma.publisher.upsert({
      where: { name: def.name },
      update: {},
      create: def,
    })
    pubs[def.name] = pub
  }
  console.log(`✓ ${pubDefs.length} издателства`)

  // Authors
  const authorDefs = [
    { name: 'Свети Йоан Лествичник', period: 'patristic' },
    { name: 'Свети Григорий Паламас', period: 'medieval' },
    { name: 'Свети Симеон Нови Богослов', period: 'medieval' },
    { name: 'Архим. Захария Захару', period: 'contemporary' },
    { name: 'Блажени Августин', period: 'patristic' },
    { name: 'Свети Йоан Златоуст', period: 'patristic' },
    { name: 'Свети Атанасий Велики', period: 'patristic' },
    { name: 'Преп. Силуан Атонски', period: 'contemporary' },
  ]
  const authors: Record<string, { id: string }> = {}
  for (const def of authorDefs) {
    const author = await prisma.author.upsert({
      where: { name: def.name },
      update: {},
      create: def,
    })
    authors[def.name] = author
  }
  console.log(`✓ ${authorDefs.length} автора`)

  // Admin
  await prisma.user.upsert({
    where: { email: 'admin@orthodox.bg' },
    update: {},
    create: {
      name: 'Администратор',
      email: 'admin@orthodox.bg',
      password: await bcrypt.hash('admin1234', 12),
      role: 'admin',
    },
  })

  // Demo seller
  const seller = await prisma.user.upsert({
    where: { email: 'seller@orthodox.bg' },
    update: {},
    create: {
      name: 'Православна Библиотека',
      email: 'seller@orthodox.bg',
      password: await bcrypt.hash('seller1234', 12),
      role: 'seller',
      sellerType: 'monastery',
      bio: 'Монастирска библиотека с богата колекция от православна богословска литература. Продаваме нови и употребявани книги.',
      phone: '+359888000001',
      address: '{"city":"Рилски манастир","street":"Рилски Монастир","postCode":"2643"}',
      bankAccount: 'BG80BNBG96611020345678',
    },
  })

  // Demo buyer
  await prisma.user.upsert({
    where: { email: 'buyer@orthodox.bg' },
    update: {},
    create: {
      name: 'Иван Петров',
      email: 'buyer@orthodox.bg',
      password: await bcrypt.hash('buyer1234', 12),
      role: 'user',
      address: '{"city":"София","street":"бул. Витоша 15","postCode":"1000"}',
    },
  })
  console.log(`✓ Потребители: admin, seller, buyer`)

  // Books
  const bookDefs = [
    {
      title: 'Лествица',
      description: 'Класическо аскетично произведение на Свети Йоан Лествичник — ръководство за духовен живот и монашески подвиг в 30 стъпала. Едно от най-четените и авторитетни произведения на православната аскетична литература, изучавано в православните семинарии по цял свят.',
      price: 18.00,
      condition: 'new',
      period: 'patristic',
      categorySlug: 'ascetics',
      publisherName: 'Синодално издателство',
      authorName: 'Свети Йоан Лествичник',
      isFeatured: true,
      year: 2019,
      pages: 280,
      isbn: '978-954-9-2305-1',
    },
    {
      title: 'Триади в защита на светата исихастика',
      description: 'Фундаментален богословски труд на Свети Григорий Паламас, защитаващ исихасткото учение за нетварната Божия светлина и за обожението на човека. Основополагащо произведение на православното паламитско богословие.',
      price: 25.00,
      condition: 'new',
      period: 'medieval',
      categorySlug: 'dogmatics',
      publisherName: 'Омофор',
      authorName: 'Свети Григорий Паламас',
      isFeatured: true,
      year: 2020,
      pages: 420,
      isbn: '978-954-0-0001-2',
    },
    {
      title: 'Химни на Божествената любов',
      description: 'Мистични химни на великия богослов и мистик Свети Симеон Нови Богослов — поетически изрази на личния опит за Божията светлина и присъствие. Задължително четиво за всеки, търсещ православен духовен живот.',
      price: 20.00,
      originalPrice: 25.00,
      condition: 'like_new',
      period: 'medieval',
      categorySlug: 'spirituality',
      publisherName: 'Паломник',
      authorName: 'Свети Симеон Нови Богослов',
      year: 2018,
      pages: 310,
    },
    {
      title: 'Остани в любовта Ми',
      description: 'Съвременна духовна книга на архимандрит Захария Захару — монах от Света гора Атон, ученик на известния православен старец Архим. Софроний Сахаров. Книгата разкрива пътя на православната молитва и единението с Бога.',
      price: 22.00,
      condition: 'new',
      period: 'contemporary',
      categorySlug: 'spirituality',
      publisherName: 'Омофор',
      authorName: 'Архим. Захария Захару',
      isFeatured: true,
      year: 2021,
      pages: 250,
      isbn: '978-954-9-0200-5',
    },
    {
      title: 'Добротолюбие — том I',
      description: 'Антология на светоотеческата аскетична литература. Том първи включва съчинения на преподобни Антоний Велики, Евагрий Понтийски, Иоан Касиан Римлянин и Нил Синайски. Незаменима сбирка за всеки православен читател.',
      price: 30.00,
      condition: 'good',
      period: 'patristic',
      categorySlug: 'patristic',
      publisherName: 'Синодално издателство',
      authorName: null,
      year: 2015,
      pages: 480,
    },
    {
      title: 'Православно догматическо богословие',
      description: 'Систематичен курс по православно догматическо богословие. Незаменимо учебно помагало за студенти в православни богословски факултети и семинарии. Обхваща всички основни теми на православното вероучение.',
      price: 45.00,
      condition: 'new',
      period: 'modern',
      categorySlug: 'dogmatics',
      publisherName: 'Синодално издателство',
      authorName: null,
      year: 2022,
      pages: 650,
    },
    {
      title: 'Беседи върху Евангелието от Йоан',
      description: 'Блестящите омилии на Свети Йоан Златоуст върху Евангелието от Йоан — образец на православната проповед и тълкуване на Свещеното Писание. Незаменим за свещеници, семинаристи и вярващи.',
      price: 28.00,
      condition: 'new',
      period: 'patristic',
      categorySlug: 'homiletics',
      publisherName: 'Синодално издателство',
      authorName: 'Свети Йоан Златоуст',
      year: 2017,
      pages: 520,
    },
    {
      title: 'Животът на Силуан Атонски',
      description: 'Биографията и духовните писания на преподобни Силуан Атонски, написани от неговия ученик архим. Софроний. Книгата разкрива дълбочините на православния аскетичен опит и молитвата за целия свят.',
      price: 19.50,
      originalPrice: 24.00,
      condition: 'like_new',
      period: 'contemporary',
      categorySlug: 'hagiography',
      publisherName: 'Омофор',
      authorName: 'Преп. Силуан Атонски',
      isFeatured: true,
      year: 2016,
      pages: 385,
    },
  ]

  // Clear existing books
  await prisma.bookAuthor.deleteMany({})
  await prisma.book.deleteMany({})

  for (const def of bookDefs) {
    const { authorName, categorySlug, publisherName, ...bookFields } = def
    const book = await prisma.book.create({
      data: {
        ...bookFields,
        originalPrice: bookFields.originalPrice ?? null,
        isFeatured: bookFields.isFeatured ?? false,
        images: '[]',
        sellerId: seller.id,
        stock: 3,
        status: 'active',
        categoryId: cats[categorySlug]?.id ?? null,
        publisherId: publisherName ? pubs[publisherName]?.id ?? null : null,
      },
    })
    if (authorName && authors[authorName]) {
      await prisma.bookAuthor.create({
        data: { bookId: book.id, authorId: authors[authorName].id },
      })
    }
  }
  console.log(`✓ ${bookDefs.length} книги`)

  console.log('\n✝ Зареждането приключи успешно!')
  console.log('\nАкредитиви:')
  console.log('  Администратор: admin@orthodox.bg / admin1234')
  console.log('  Продавач:      seller@orthodox.bg / seller1234')
  console.log('  Купувач:       buyer@orthodox.bg / buyer1234')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
