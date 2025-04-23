import { NextResponse } from 'next/server';
import prismadb from '@/lib/prismadb';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const query = searchParams.get('q');

        if (!query || query.length < 2) {
            return NextResponse.json([]);
        }

        // Convert query to lowercase for case-insensitive comparison
        const lowercaseQuery = query.toLowerCase();

        const events = await prismadb.event.findMany();

        // Filter events where name includes the search query
        const filteredEvents = events.filter(event => 
            event.name.toLowerCase().includes(lowercaseQuery)
        );

        const transformedEvents = filteredEvents.map(event => ({
            id: event.id,
            imageUrl: event.imageUrl,
            title: event.name,
            venue: event.location,
            date: new Date(event.date + ' ' + event.time).toLocaleDateString('es-ES', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }),
            category: event.category
        }));

        return NextResponse.json(transformedEvents);
    } catch (error) {
        console.error('Search error:', error);
        return NextResponse.json({ error: 'Error searching events' }, { status: 500 });
    }
} 