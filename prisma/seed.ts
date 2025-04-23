import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    // Clear existing data
    console.log('Clearing existing data...')
    await prisma.favorite.deleteMany()
    await prisma.event.deleteMany()

    console.log('Creating sports events...')
    const eventos = [
      {
        name: "Real Madrid vs Barcelona",
        date: "2024-04-21",
        time: "20:00",
        location: "Estadio Santiago Bernabéu, Madrid",
        purchase_link: "https://www.realmadrid.com/entradas",
        category: "Fútbol",
        imageUrl: "/images/event-banners/event01.jpg",
        alt: "Partido Real Madrid vs Barcelona en el Bernabéu"
      },
      {
        name: "Atlético Madrid vs Real Madrid",
        date: "2024-05-05",
        time: "21:00",
        location: "Estadio Metropolitano, Madrid",
        purchase_link: "https://www.atleticodemadrid.com/entradas",
        category: "Fútbol",
        imageUrl: "/images/event-banners/event02.jpg",
        alt: "Partido Atlético Madrid vs Real Madrid en el Metropolitano"
      },
      {
        name: "Barcelona vs Sevilla",
        date: "2024-04-28",
        time: "19:30",
        location: "Spotify Camp Nou, Barcelona",
        purchase_link: "https://www.fcbarcelona.es/entradas",
        category: "Fútbol",
        imageUrl: "/images/event-banners/event03.jpg",
        alt: "Partido Barcelona vs Sevilla en el Camp Nou"
      },
      {
        name: "Valencia vs Real Betis",
        date: "2024-05-12",
        time: "18:30",
        location: "Estadio Mestalla, Valencia",
        purchase_link: "https://www.valenciacf.com/entradas",
        category: "Fútbol",
        imageUrl: "/images/event-banners/event04.jpg",
        alt: "Partido Valencia vs Real Betis en el Mestalla"
      },
      {
        name: "Athletic Club vs Real Sociedad",
        date: "2024-05-19",
        time: "20:00",
        location: "San Mamés, Bilbao",
        purchase_link: "https://www.athletic-club.eus/entradas",
        category: "Fútbol",
        imageUrl: "/images/event-banners/event05.jpg",
        alt: "Partido Athletic Club vs Real Sociedad en el San Mamés"
      }
    ]

    for (const evento of eventos) {
      await prisma.event.create({
        data: evento
      })
    }

    console.log('Events created successfully!')
  } catch (error) {
    console.error('Error during seed:', error)
    throw error
  }
}

main()
  .catch((e) => {
    console.error('Error in main script:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 