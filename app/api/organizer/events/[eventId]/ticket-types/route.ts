import { NextResponse } from 'next/server';
import { requireOrganizer } from '@/lib/auth';
import prismadb from '@/lib/prismadb';

/**
 * POST /api/organizer/events/[eventId]/ticket-types
 * Create ticket types for an event (Organizer only)
 */
export async function POST(
    request: Request,
    { params }: { params: Promise<{ eventId: string }> }
) {
    try {
        // Verify organizer role
        await requireOrganizer();

        const resolvedParams = params instanceof Promise ? await params : params;
        const { eventId } = resolvedParams;

        const body = await request.json();
        const { name, price, quantity, description } = body;

        // Validate required fields
        if (!name || price === undefined || !quantity) {
            return NextResponse.json(
                { error: 'Missing required fields: name, price, quantity' },
                { status: 400 }
            );
        }

        // Validate price and quantity
        if (price < 0 || quantity < 1) {
            return NextResponse.json(
                { error: 'Price must be >= 0 and quantity must be >= 1' },
                { status: 400 }
            );
        }

        // Check if event exists
        const event = await prismadb.event.findUnique({
            where: { id: eventId }
        });

        if (!event) {
            return NextResponse.json(
                { error: 'Event not found' },
                { status: 404 }
            );
        }

        // Create ticket type
        const ticketType = await prismadb.ticketType.create({
            data: {
                eventId,
                name,
                price: parseFloat(price),
                quantity: parseInt(quantity),
                description: description || null,
                sold: 0
            }
        });

        return NextResponse.json({
            success: true,
            ticketType
        }, { status: 201 });

    } catch (error: any) {
        console.error('Error creating ticket type:', error);
        
        if (error.message === 'Unauthorized' || error.message.includes('Forbidden')) {
            return NextResponse.json(
                { error: error.message },
                { status: error.message === 'Unauthorized' ? 401 : 403 }
            );
        }

        return NextResponse.json(
            { error: 'Error creating ticket type' },
            { status: 500 }
        );
    }
}

/**
 * GET /api/organizer/events/[eventId]/ticket-types
 * Get all ticket types for an event (Organizer view - includes sold count)
 */
export async function GET(
    request: Request,
    { params }: { params: Promise<{ eventId: string }> }
) {
    try {
        // Verify organizer role
        await requireOrganizer();

        const resolvedParams = params instanceof Promise ? await params : params;
        const { eventId } = resolvedParams;

        const ticketTypes = await prismadb.ticketType.findMany({
            where: { eventId },
            include: {
                _count: {
                    select: {
                        tickets: true
                    }
                }
            },
            orderBy: {
                createdAt: 'asc'
            }
        });

        return NextResponse.json(ticketTypes);

    } catch (error: any) {
        console.error('Error fetching ticket types:', error);
        
        if (error.message === 'Unauthorized' || error.message.includes('Forbidden')) {
            return NextResponse.json(
                { error: error.message },
                { status: error.message === 'Unauthorized' ? 401 : 403 }
            );
        }

        return NextResponse.json(
            { error: 'Error fetching ticket types' },
            { status: 500 }
        );
    }
}

