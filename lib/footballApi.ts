/**
 * Football API Integration
 * Supports multiple free football APIs
 */

interface FootballMatch {
    id: string | number;
    homeTeam: {
        name: string;
        shortName?: string;
    };
    awayTeam: {
        name: string;
        shortName?: string;
    };
    utcDate: string;
    status: string;
    competition?: {
        name: string;
    };
    venue?: string;
    score?: {
        winner: string | null;
    };
}

interface FootballApiResponse {
    matches?: FootballMatch[];
    fixtures?: FootballMatch[];
    data?: FootballMatch[];
}

/**
 * Transform Football-Data.org match to our Event format
 */
function transformFootballDataMatch(match: FootballMatch): {
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
        const matchDate = new Date(match.utcDate);
        const date = matchDate.toISOString().split('T')[0]; // YYYY-MM-DD
        const time = matchDate.toTimeString().split(' ')[0].substring(0, 5); // HH:mm
        
        // Create event name
        const homeTeam = match.homeTeam.name || match.homeTeam.shortName || 'Equipo Local';
        const awayTeam = match.awayTeam.name || match.awayTeam.shortName || 'Equipo Visitante';
        const eventName = `${homeTeam} vs ${awayTeam}`;
        
        // Determine venue/location
        const location = match.venue || 'Estadio por determinar';
        
        // Category (assuming football)
        const category = 'Fútbol';
        
        // Generate image URL based on team names
        const imageUrl = '/images/event-banners/default-event.jpg';
        
        // Alt text
        const alt = `Partido ${eventName} en ${location}`;
        
        // Purchase link (placeholder - could be customized)
        const purchaseLink = `https://www.google.com/search?q=${encodeURIComponent(`${homeTeam} vs ${awayTeam} tickets`)}`;
        
        // Only include future matches
        if (matchDate < new Date()) {
            return null;
        }
        
        // Skip completed matches
        if (match.status === 'FINISHED' || match.score?.winner !== null) {
            return null;
        }
        
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
        console.error('Error transforming match:', error, match);
        return null;
    }
}

/**
 * Fetch upcoming matches from Football-Data.org API
 * Free tier: 10 requests per minute
 * NOTE: Football-Data.org now requires API key for most endpoints
 * Get your free API key at: https://www.football-data.org/
 */
export async function fetchFootballDataOrgMatches(
    competitionCode: string = 'PD', // La Liga
    daysAhead: number = 30
): Promise<Array<ReturnType<typeof transformFootballDataMatch>>> {
    try {
        const apiKey = process.env.FOOTBALL_DATA_API_KEY || '';
        
        if (!apiKey) {
            console.log('⚠️  FOOTBALL_DATA_API_KEY not found in .env');
            console.log('   To use Football-Data.org API:');
            console.log('   1. Register at https://www.football-data.org/');
            console.log('   2. Get your free API key');
            console.log('   3. Add to .env: FOOTBALL_DATA_API_KEY=your_key_here');
            console.log('   Continuing with alternative approach...\n');
            return [];
        }
        
        // Football-Data.org free tier - PD = La Liga, CL = Champions League, etc.
        const url = `https://api.football-data.org/v4/competitions/${competitionCode}/matches?status=SCHEDULED`;
        
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
            'X-Auth-Token': apiKey, // Required for most endpoints
            'X-Response-Control': 'minified', // Get minified response
        };
        
        const response = await fetch(url, {
            method: 'GET',
            headers,
        });
        
        if (!response.ok) {
            const errorText = await response.text().catch(() => '');
            console.error(`Football-Data API error: ${response.status} ${response.statusText}`);
            if (errorText) {
                try {
                    const errorJson = JSON.parse(errorText);
                    console.error('Error details:', errorJson.message || errorJson.errorCode);
                } catch {
                    console.error('Response:', errorText.substring(0, 200));
                }
            }
            if (response.status === 429) {
                console.error('⏱️  Rate limit exceeded. Please wait before retrying.');
            }
            if (response.status === 403) {
                console.error('🔒 Access forbidden. Please check your API key is valid.');
            }
            return [];
        }
        
        const data = await response.json();
        console.log('Football-Data API response:', JSON.stringify(data, null, 2).substring(0, 500));
        
        const matches: FootballMatch[] = data.matches || data.fixtures || [];
        
        if (matches.length === 0) {
            console.log('⚠️  No matches found in API response. This might be:');
            console.log('   - End of season (no upcoming matches)');
            console.log('   - API requires authentication');
            console.log('   - Competition code might be incorrect');
            return [];
        }
        
        // Filter matches within the next N days
        const now = new Date();
        const futureDate = new Date();
        futureDate.setDate(now.getDate() + daysAhead);
        
        const upcomingMatches = matches
            .filter(match => {
                if (!match.utcDate) return false;
                const matchDate = new Date(match.utcDate);
                return matchDate >= now && matchDate <= futureDate;
            })
            .sort((a, b) => {
                return new Date(a.utcDate).getTime() - new Date(b.utcDate).getTime();
            });
        
        // Transform matches to our format
        const transformedMatches = upcomingMatches
            .map(transformFootballDataMatch)
            .filter((match): match is NonNullable<typeof match> => match !== null);
        
        console.log(`✅ Fetched ${transformedMatches.length} upcoming matches from Football-Data.org (out of ${matches.length} total matches)`);
        return transformedMatches;
    } catch (error) {
        console.error('Error fetching matches from Football-Data.org:', error);
        return [];
    }
}

/**
 * Alternative: Use mock matches when external API is not available
 */
export async function fetchMatchesFromAlternativeAPI(): Promise<Array<ReturnType<typeof transformFootballDataMatch>>> {
    // Import mock generator
    const { generateMockMatches } = await import('./mockFootballApi');
    
    console.log('📝 Generating mock matches (use Football-Data.org API key for real matches)');
    const mockMatches = await generateMockMatches(15);
    
    // Transform to our format (they're already in the right format)
    // Convert to expected return type
    return mockMatches as Array<ReturnType<typeof transformFootballDataMatch>>;
}

/**
 * Main function to fetch matches from available APIs
 * Priority: RapidAPI > Football-Data.org > Mock matches
 */
export async function fetchUpcomingFootballMatches(): Promise<Array<ReturnType<typeof transformFootballDataMatch>>> {
    const rapidApiKey = process.env.RAPIDAPI_KEY;
    const footballDataKey = process.env.FOOTBALL_DATA_API_KEY;
    
    // Priority 1: Try RapidAPI api-football-v1 (most reliable and updated)
    if (rapidApiKey) {
        try {
            const { fetchRapidAPIFootballMatches, LEAGUE_IDS } = await import('./rapidApiFootball');
            const matches = await fetchRapidAPIFootballMatches(LEAGUE_IDS.LA_LIGA, 30); // La Liga, next 30 days
            
            if (matches.length > 0) {
                console.log('✅ Using RapidAPI api-football-v1 (real-time data)\n');
                return matches;
            }
            
            console.log('⚠️  No matches from RapidAPI, trying alternative sources...\n');
        } catch (error) {
            console.error('Error using RapidAPI:', error);
            console.log('⚠️  Falling back to alternative sources...\n');
        }
    }
    
    // Priority 2: Try Football-Data.org if API key is available
    if (footballDataKey) {
        const matches = await fetchFootballDataOrgMatches('PD', 30); // La Liga, next 30 days
        
        if (matches.length > 0) {
            console.log('✅ Using Football-Data.org API\n');
            return matches;
        }
        
        console.log('⚠️  No matches from Football-Data.org, falling back to mock matches...\n');
    }
    
    // Priority 3: Fallback to mock matches when no API keys are available
    if (rapidApiKey) {
        console.log('📝 RapidAPI key found but subscription required. Using mock matches.');
        console.log('   To get real matches, subscribe at: https://rapidapi.com/api-sports/api/api-football\n');
    } else {
        console.log('📝 No API keys found, using mock matches');
        console.log('   To get real matches, add RAPIDAPI_KEY or FOOTBALL_DATA_API_KEY to .env\n');
    }
    return await fetchMatchesFromAlternativeAPI();
}

