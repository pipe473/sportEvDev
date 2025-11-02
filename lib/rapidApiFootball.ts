/**
 * RapidAPI api-football-v1 Integration
 * Free tier available with RapidAPI key
 * Documentation: https://www.rapidapi.com/api-sports/api/api-football
 */

interface RapidAPIMatch {
    fixture: {
        id: number;
        date: string;
        timezone: string;
        venue: {
            id: number;
            name: string;
            city: string;
        };
        status: {
            long: string;
            short: string;
            elapsed: number | null;
        };
    };
    league: {
        id: number;
        name: string;
        country: string;
        logo: string;
        flag: string;
        season: number;
        round: string;
    };
    teams: {
        home: {
            id: number;
            name: string;
            logo: string;
        };
        away: {
            id: number;
            name: string;
            logo: string;
        };
    };
    goals: {
        home: number | null;
        away: number | null;
    };
    score: {
        fulltime: {
            home: number | null;
            away: number | null;
        };
    };
}

interface RapidAPIResponse {
    get: string;
    parameters: any;
    errors: any[];
    results: number;
    paging: {
        current: number;
        total: number;
    };
    response: RapidAPIMatch[];
}

/**
 * Transform RapidAPI match to our Event format
 */
function transformRapidAPIMatch(match: RapidAPIMatch): {
    name: string;
    date: string;
    time: string;
    location: string;
    purchase_link: string;
    category: string;
    imageUrl: string;
    alt: string;
} | null {
    try {
        const fixture = match.fixture;
        const matchDate = new Date(fixture.date);
        
        // Skip if match is in the past or finished
        if (matchDate < new Date() || fixture.status.short === 'FT') {
            return null;
        }
        
        // Format date
        const date = matchDate.toISOString().split('T')[0]; // YYYY-MM-DD
        const hours = matchDate.getHours().toString().padStart(2, '0');
        const minutes = matchDate.getMinutes().toString().padStart(2, '0');
        const time = `${hours}:${minutes}`;
        
        // Create event name
        const homeTeam = match.teams.home.name;
        const awayTeam = match.teams.away.name;
        const eventName = `${homeTeam} vs ${awayTeam}`;
        
        // Location
        const venue = fixture.venue?.name || 'Estadio por determinar';
        const city = fixture.venue?.city || '';
        const location = city ? `${venue}, ${city}` : venue;
        
        // Category
        const category = 'Fútbol';
        
        // Image URL (could use team logos in the future)
        const imageUrl = '/images/event-banners/default-event.jpg';
        
        // Alt text
        const alt = `Partido ${eventName} en ${location}`;
        
        // Purchase link
        const purchaseLink = `https://www.google.com/search?q=${encodeURIComponent(`${homeTeam} vs ${awayTeam} tickets`)}`;
        
        return {
            name: eventName,
            date,
            time,
            location,
            purchase_link: purchaseLink,
            category,
            imageUrl,
            alt
        };
    } catch (error) {
        console.error('Error transforming RapidAPI match:', error, match);
        return null;
    }
}

/**
 * Fetch upcoming matches from RapidAPI api-football-v1
 */
export async function fetchRapidAPIFootballMatches(
    leagueId: number = 140, // La Liga Spain
    daysAhead: number = 30
): Promise<Array<ReturnType<typeof transformRapidAPIMatch>>> {
    try {
        const apiKey = process.env.RAPIDAPI_KEY || '';
        const apiHost = process.env.RAPIDAPI_HOST || 'api-football-v1.p.rapidapi.com';
        
        if (!apiKey) {
            console.log('⚠️  RAPIDAPI_KEY not found in .env');
            console.log('   To use RapidAPI api-football-v1:');
            console.log('   1. Get your key from https://rapidapi.com/');
            console.log('   2. Add to .env: RAPIDAPI_KEY=your_key_here');
            console.log('   3. Add to .env: RAPIDAPI_HOST=api-football-v1.p.rapidapi.com\n');
            return [];
        }
        
        // Calculate date range
        const today = new Date();
        const futureDate = new Date();
        futureDate.setDate(today.getDate() + daysAhead);
        
        const from = today.toISOString().split('T')[0];
        const to = futureDate.toISOString().split('T')[0];
        
        // RapidAPI api-football-v1 endpoint for fixtures
        const url = `https://${apiHost}/v3/fixtures?league=${leagueId}&season=2024&from=${from}&to=${to}&status=NS`;
        
        const headers: HeadersInit = {
            'X-RapidAPI-Key': apiKey,
            'X-RapidAPI-Host': apiHost,
        };
        
        console.log(`📡 Fetching fixtures from RapidAPI (League ID: ${leagueId}, ${from} to ${to})...`);
        
        const response = await fetch(url, {
            method: 'GET',
            headers,
        });
        
        if (!response.ok) {
            const errorText = await response.text().catch(() => '');
            console.error(`❌ RapidAPI error: ${response.status} ${response.statusText}`);
            
            if (errorText) {
                try {
                    const errorJson = JSON.parse(errorText);
                    console.error('Error details:', errorJson.message || errorJson.errorCode || errorText.substring(0, 200));
                } catch {
                    console.error('Response:', errorText.substring(0, 200));
                }
            }
            
            if (response.status === 401 || response.status === 403) {
                console.error('🔒 Authentication failed. Please check your RAPIDAPI_KEY is valid.');
            }
            if (response.status === 429) {
                console.error('⏱️  Rate limit exceeded. Please wait before retrying.');
            }
            return [];
        }
        
        const data: RapidAPIResponse = await response.json();
        
        if (data.errors && data.errors.length > 0) {
            console.error('⚠️  API returned errors:', data.errors);
            return [];
        }
        
        const matches: RapidAPIMatch[] = data.response || [];
        
        if (matches.length === 0) {
            console.log('⚠️  No matches found in API response.');
            console.log(`   League ID: ${leagueId}, Season: 2024, Date range: ${from} to ${to}`);
            return [];
        }
        
        console.log(`✅ Fetched ${matches.length} matches from RapidAPI`);
        
        // Transform matches to our format
        const transformedMatches = matches
            .map(transformRapidAPIMatch)
            .filter((match): match is NonNullable<typeof match> => match !== null);
        
        console.log(`✅ Transformed ${transformedMatches.length} upcoming matches (filtered past/finished matches)`);
        
        return transformedMatches;
    } catch (error) {
        console.error('❌ Error fetching matches from RapidAPI:', error);
        return [];
    }
}

/**
 * Common league IDs for RapidAPI api-football-v1
 */
export const LEAGUE_IDS = {
    LA_LIGA: 140, // Spain
    PREMIER_LEAGUE: 39, // England
    CHAMPIONS_LEAGUE: 2, // Europe
    BUNDESLIGA: 78, // Germany
    SERIE_A: 135, // Italy
    LIGUE_1: 61, // France
    PRIMERA_DIVISION_MEXICO: 262, // Mexico
};

