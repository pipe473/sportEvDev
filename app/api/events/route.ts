import { NextResponse } from 'next/server';
import prismadb from '@/lib/prismadb';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (id) {
            const event = await prismadb.event.findUnique({
                where: { id }
            });
            return NextResponse.json(event);
        }

        // Get all events
        const events = await prismadb.event.findMany({
            orderBy: {
                createdAt: 'desc'
            }
        });

        console.log('Events from database:', events); // Debug log
        
        if (!events || events.length === 0) {
            console.log('No events found in database');
            return NextResponse.json([]);
        }

        return NextResponse.json(events);

    } catch (error) {
        console.error('Error fetching events:', error);
        return NextResponse.json({ error: 'Error fetching events' }, { status: 500 });
    }
}