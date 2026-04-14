import { createClient } from '@libsql/client'

const url = 'https://librum-market-yoanna.aws-eu-west-1.turso.io'
const authToken = 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NzYxNDI4NzcsImlkIjoiMDE5ZDhhMmItYjUwMS03YWExLWIyYTItY2FjMmJkNWQyMGQ3IiwicmlkIjoiMWZkMGI2ZTMtMWViMy00YmViLTljNzEtNGJmZDliMzk4ZTE5In0.-ck8qwV9hkrzRLWBJfkIvdI_6jV3zj32KgEEikTqlfLEzxuy7Y7VOM6UdbLGlCPASs-_t2lZgEi_8ar12xTkBw'

const client = createClient({ url, authToken })

// EUR → BGN fixed rate: 1 EUR = 1.95583 BGN
// We want to show EUR price alongside BGN on the site.
// originalPrice field will store the EUR equivalent (BGN / 1.95583).
// But since originalPrice is used for "old price", we'll just rely on
// the UI to calculate EUR. This script only updates images.

const BASE = 'https://www.librum.bg/wp-content/uploads'

const updates = [
  {
    title: 'Взаимните отношения между светите апостоли Петър и Павел, отразени в техните послания',
    image: `${BASE}/2021/08/vzaimnite-otnosheniya-apostoli.jpg`,
  },
  {
    title: 'Проповедта и дейността на Господния предтеча св. Йоан Кръстител – ч.1',
    image: `${BASE}/2021/08/jzadjiev_joan_deinost_1962.jpg`,
  },
  {
    title: 'Ръководство за изучаване пророческите книги на Стария Завет',
    image: `${BASE}/2021/08/rakovodstvo-prorocheskie-knigi.jpg`,
  },
  {
    title: 'Дванадесетте пророци – Пророк Михей',
    image: `${BASE}/2021/08/dvanadesette-proroczi-mihej.jpg`,
  },
  {
    title: 'Основаване на Българската църква – 870 г.',
    image: `${BASE}/2021/08/osnovaneto-balgarskata-czarkva.jpg`,
  },
  {
    title: 'Православно-християнската вяра и Българската народна църква като фактори за запазването на българския народ',
    image: `${BASE}/2021/08/pravoslavno-hristiyanska-vyara-czarkva.jpg`,
  },
  {
    title: 'Как да отгледаме децата си като зрели личности',
    image: `${BASE}/2024/01/kak-da-otgledame-deczata.jpg`,
  },
  {
    title: 'Христовата светлина просвещава всички',
    image: `${BASE}/2024/05/hristovata-svetlina.jpg`,
  },
  {
    title: 'Псалтикиен минейник',
    image: `${BASE}/2022/01/psaltikien-minejnik.jpg`,
  },
  {
    title: 'Литература и антропология',
    image: `${BASE}/2022/04/literatura-antropologiya.jpg`,
  },
  {
    title: 'Митове и архетипи в българската литература',
    image: `${BASE}/2022/04/mitove-arhetipii-balgarska-literatura.jpg`,
  },
  {
    title: 'Чеда на социализма',
    image: `${BASE}/2022/07/cheda-na-sozializma.jpg`,
  },
  {
    title: 'Византийски икони. Практическо ръководство за начинаещи',
    image: `${BASE}/2023/08/vizantijski-ikoni-karcheva.jpg`,
  },
  {
    title: 'Нашата вяра',
    image: `${BASE}/2021/08/nashata-vyara-1.jpg`,
  },
  {
    title: 'Православието и религията на бъдещето',
    image: `${BASE}/2021/09/serafim-rouz-pravoslavieto.jpg`,
  },
  {
    title: 'Лествица',
    image: `${BASE}/2023/04/lestvicza-1.jpg`,
  },
  {
    title: 'Апокалипсис Йоанна',
    image: `${BASE}/2023/09/apokalipsis-joanna.jpg`,
  },
  {
    title: 'Обща история на екскурзоводството – том 1',
    image: `${BASE}/2025/01/obshta-istoriya-ekskurzovadstvo.jpg`,
  },
  {
    title: '150 години Българска екзархия',
    image: `${BASE}/2021/09/150-godini-balgarska-ekzarhiya.jpg`,
  },
  {
    title: 'Новият Завет. Псалми',
    image: `${BASE}/2022/01/noviyat-zavet-psalmi.jpg`,
  },
  {
    title: 'Чистият ум. Контрол над помислите',
    image: `${BASE}/2023/05/chistiyat-um.jpg`,
  },
]

let ok = 0, skip = 0
for (const { title, image } of updates) {
  const res = await client.execute({
    sql: `UPDATE "Book" SET images = ? WHERE title = ?`,
    args: [JSON.stringify([image]), title],
  })
  if (res.rowsAffected > 0) {
    console.log(`✓ ${title.slice(0, 60)}`)
    ok++
  } else {
    console.log(`⚠ not found: ${title.slice(0, 60)}`)
    skip++
  }
}

console.log(`\n✅ ${ok} снимки добавени, ${skip} не намерени`)
client.close()
