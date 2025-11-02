/**
 * Mock Football API - Generates realistic upcoming football matches
 * Use this when external APIs are not available
 * This generates matches for popular Spanish teams
 */

interface MockMatch {
    name: string;
    date: string;
    time: string;
    location: string;
    purchase_link: string;
    category: string;
    imageUrl: string;
    alt: string;
}

const SPANISH_TEAMS = [
    'Real Madrid', 'Barcelona', 'Atlético Madrid', 'Sevilla', 
    'Valencia', 'Real Betis', 'Villarreal', 'Athletic Club',
    'Real Sociedad', 'Osasuna', 'Getafe', 'Celta de Vigo',
    'Rayo Vallecano', 'Espanyol', 'Mallorca', 'Granada',
    'Cádiz', 'Elche', 'Alavés', 'Levante'
];

const STADIUMS: { [key: string]: string } = {
    'Real Madrid': 'Estadio Santiago Bernabéu, Madrid',
    'Barcelona': 'Spotify Camp Nou, Barcelona',
    'Atlético Madrid': 'Estadio Metropolitano, Madrid',
    'Sevilla': 'Ramón Sánchez-Pizjuán, Sevilla',
    'Valencia': 'Estadio Mestalla, Valencia',
    'Real Betis': 'Benito Villamarín, Sevilla',
    'Villarreal': 'Estadio de la Cerámica, Villarreal',
    'Athletic Club': 'San Mamés, Bilbao',
    'Real Sociedad': 'Reale Arena, San Sebastián',
    'Osasuna': 'El Sadar, Pamplona',
    'Getafe': 'Coliseum Alfonso Pérez, Getafe',
    'Celta de Vigo': 'Balaídos, Vigo',
    'Rayo Vallecano': 'Vallecas, Madrid',
    'Espanyol': 'RCDE Stadium, Barcelona',
    'Mallorca': 'Iberostar Estadi, Palma',
    'Granada': 'Nuevo Los Cármenes, Granada',
    'Cádiz': 'Nueva Mirandilla, Cádiz',
    'Elche': 'Martínez Valero, Elche',
    'Alavés': 'Mendizorrotza, Vitoria',
    'Levante': 'Ciutat de València, Valencia'
};

/**
 * Generate realistic upcoming matches
 */
export async function generateMockMatches(count: number = 15): Promise<MockMatch[]> {
    const matches: MockMatch[] = [];
    const today = new Date();
    
    // Generate matches for the next 30 days
    for (let i = 0; i < count; i++) {
        // Random date within next 30 days
        const daysOffset = Math.floor(Math.random() * 30) + i;
        const matchDate = new Date(today);
        matchDate.setDate(today.getDate() + daysOffset);
        
        // Random time (evening matches mostly)
        const hours = [18, 19, 20, 21][Math.floor(Math.random() * 4)];
        const minutes = [0, 30][Math.floor(Math.random() * 2)];
        
        // Select random teams
        const homeTeamIndex = Math.floor(Math.random() * SPANISH_TEAMS.length);
        let awayTeamIndex = Math.floor(Math.random() * SPANISH_TEAMS.length);
        // Ensure different teams
        while (awayTeamIndex === homeTeamIndex) {
            awayTeamIndex = Math.floor(Math.random() * SPANISH_TEAMS.length);
        }
        
        const homeTeam = SPANISH_TEAMS[homeTeamIndex];
        const awayTeam = SPANISH_TEAMS[awayTeamIndex];
        const matchName = `${homeTeam} vs ${awayTeam}`;
        const stadium = STADIUMS[homeTeam] || `${homeTeam} Stadium`;
        
        // Format date
        const dateStr = matchDate.toISOString().split('T')[0]; // YYYY-MM-DD
        const timeStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        
        // Purchase link (Google search)
        const purchaseLink = `https://www.google.com/search?q=${encodeURIComponent(`${matchName} tickets`)}`;
        
        matches.push({
            name: matchName,
            date: dateStr,
            time: timeStr,
            location: stadium,
            purchase_link: purchaseLink,
            category: 'Fútbol',
            imageUrl: '/images/event-banners/default-event.jpg',
            alt: `Partido ${matchName} en ${stadium}`
        });
    }
    
    // Sort by date
    matches.sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.time}`);
        const dateB = new Date(`${b.date}T${b.time}`);
        return dateA.getTime() - dateB.getTime();
    });
    
    return matches;
}

