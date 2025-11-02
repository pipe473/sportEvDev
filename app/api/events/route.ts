import { NextResponse } from 'next/server';
import prismadb from '@/lib/prismadb';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        const category = searchParams.get('category');

        if (id) {
            // Validar que id no sea 'undefined' o vacío
            if (id === 'undefined' || id.trim() === '') {
                return NextResponse.json({ error: 'Invalid event ID' }, { status: 400 });
            }

            const event = await prismadb.event.findUnique({
                where: { id }
            });

            if (!event) {
                return NextResponse.json({ error: 'Event not found' }, { status: 404 });
            }

            return NextResponse.json(event);
        }

        // Build query options
        const queryOptions: any = {
            orderBy: {
                createdAt: 'desc'
            }
        };

        // Filter by category if provided
        if (category) {
            queryOptions.where = {
                category: decodeURIComponent(category)
            };
        }

        // Get events (filtered by category if provided)
        console.log('Query options:', JSON.stringify(queryOptions));
        const events = await prismadb.event.findMany(queryOptions);

        console.log(`Found ${events.length} events in database`); // Debug log
        if (events.length > 0) {
            console.log('First event sample:', JSON.stringify(events[0], null, 2));
        }
        
        if (!events || events.length === 0) {
            console.log('⚠️ No events found in database. Run: npx prisma db seed');
            return NextResponse.json([]);
        }

        return NextResponse.json(events);

    } catch (error) {
        // Try to log error safely
        try {
            const errorMessage = error instanceof Error ? error.message : String(error);
            const errorName = error instanceof Error ? error.name : 'UnknownError';
            console.log('Error fetching events:', errorName, errorMessage);
        } catch (logError) {
            // If logging fails, just continue
        }
        
        // If it's a Prisma/MongoDB connection error, return empty array instead of error
        if (error instanceof Error) {
            const errorMsg = error.message.toLowerCase();
            if (errorMsg.includes('connect') || errorMsg.includes('timeout') || errorMsg.includes('network') || errorMsg.includes('prisma')) {
                console.log('Database connection issue, returning empty array');
                return NextResponse.json([]);
            }
        }
        
        // Always return valid JSON, even on error
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ 
            error: 'Error fetching events',
            message: errorMessage
        }, { status: 500 });
    }
}