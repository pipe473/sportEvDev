import { NextResponse } from 'next/server';
import prismadb from '@/lib/prismadb';
import { fetchUpcomingFootballMatches } from '@/lib/footballApi';

/**
 * API endpoint to sync football events from external API
 * POST /api/sync-events
 * 
 * This endpoint fetches upcoming matches from Football-Data.org
 * and adds them to the database if they don't already exist
 */
export async function POST() {
    try {
        console.log('Starting event sync...');
        
        // Fetch upcoming matches from external API
        const matches = await fetchUpcomingFootballMatches();
        
        if (matches.length === 0) {
            return NextResponse.json({
                success: false,
                message: 'No matches found from external API',
                synced: 0
            }, { status: 200 });
        }
        
        let syncedCount = 0;
        let skippedCount = 0;
        
        // Add each match to database if it doesn't exist
        for (const match of matches) {
            try {
                // Check if event already exists (by name and date)
                const existingEvent = await prismadb.event.findFirst({
                    where: {
                        name: match.name,
                        date: match.date,
                        time: match.time
                    }
                });
                
                if (existingEvent) {
                    skippedCount++;
                    continue;
                }
                
                // Create new event
                await prismadb.event.create({
                    data: match
                });
                
                syncedCount++;
                console.log(`Added event: ${match.name} on ${match.date} at ${match.time}`);
            } catch (error) {
                console.error(`Error adding event ${match.name}:`, error);
                // Continue with next match even if one fails
            }
        }
        
        return NextResponse.json({
            success: true,
            message: `Synced ${syncedCount} new events, skipped ${skippedCount} existing events`,
            synced: syncedCount,
            skipped: skippedCount,
            total: matches.length
        });
        
    } catch (error) {
        console.error('Error syncing events:', error);
        return NextResponse.json({
            success: false,
            message: 'Error syncing events',
            error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}

/**
 * GET endpoint to preview what would be synced
 */
export async function GET() {
    try {
        const matches = await fetchUpcomingFootballMatches();
        
        return NextResponse.json({
            success: true,
            preview: true,
            matchesFound: matches.length,
            matches: matches.slice(0, 10) // Return first 10 as preview
        });
        
    } catch (error) {
        console.error('Error fetching match preview:', error);
        return NextResponse.json({
            success: false,
            message: 'Error fetching match preview',
            error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}

