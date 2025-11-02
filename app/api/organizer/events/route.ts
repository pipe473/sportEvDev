import { NextResponse } from 'next/server';
import { requireOrganizer } from '@/lib/auth';
import prismadb from '@/lib/prismadb';

/**
 * POST /api/organizer/events
 * Create a new event (Organizer only)
 */
export async function POST(request: Request) {
    try {
        // Verify organizer role
        await requireOrganizer();

        const body = await request.json();
        const { name, date, time, location, category, imageUrl, alt, purchase_link } = body;

        // Validate required fields
        if (!name || !date || !time || !location || !category) {
            return NextResponse.json(
                { error: 'Missing required fields: name, date, time, location, category' },
                { status: 400 }
            );
        }

        // Create event
        const event = await prismadb.event.create({
            data: {
                name,
                date,
                time,
                location,
                category,
                imageUrl: imageUrl || '/images/default-event.jpg',
                alt: alt || `Event: ${name}`,
                purchase_link: purchase_link || '#'
            }
        });

        return NextResponse.json({
            success: true,
            event
        }, { status: 201 });

    } catch (error: any) {
        console.error('Error creating event:', error);
        
        if (error.message === 'Unauthorized' || error.message.includes('Forbidden')) {
            return NextResponse.json(
                { error: error.message },
                { status: error.message === 'Unauthorized' ? 401 : 403 }
            );
        }

        return NextResponse.json(
            { error: 'Error creating event' },
            { status: 500 }
        );
    }
}

/**
 * GET /api/organizer/events
 * Get all events (Organizer view - might include unpublished events)
 */
export async function GET() {
    try {
        // Verify organizer role
        await requireOrganizer();

        const events = await prismadb.event.findMany({
            include: {
                ticketTypes: true,
                _count: {
                    select: {
                        tickets: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return NextResponse.json(events);

    } catch (error: any) {
        console.error('Error fetching events:', error);
        
        if (error.message === 'Unauthorized' || error.message.includes('Forbidden')) {
            return NextResponse.json(
                { error: error.message },
                { status: error.message === 'Unauthorized' ? 401 : 403 }
            );
        }

        return NextResponse.json(
            { error: 'Error fetching events' },
            { status: 500 }
        );
    }
}

