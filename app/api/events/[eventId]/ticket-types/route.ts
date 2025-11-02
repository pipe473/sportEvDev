import { NextResponse } from 'next/server';
import prismadb from '@/lib/prismadb';

/**
 * GET /api/events/[eventId]/ticket-types
 * Get available ticket types for an event (Public - users can see this to purchase tickets)
 */
export async function GET(
    request: Request,
    { params }: { params: Promise<{ eventId: string }> }
) {
    try {
        const resolvedParams = params instanceof Promise ? await params : params;
        const { eventId } = resolvedParams;

        // Get ticket types with availability
        const ticketTypes = await prismadb.ticketType.findMany({
            where: { 
                eventId,
                // Only show ticket types with available tickets
            },
            select: {
                id: true,
                name: true,
                price: true,
                quantity: true,
                sold: true,
                description: true,
                // Calculate available
            },
            orderBy: {
                price: 'asc'
            }
        });

        // Add available count and filter out sold out types
        const availableTypes = ticketTypes
            .map(type => ({
                ...type,
                available: type.quantity - type.sold
            }))
            .filter(type => type.available > 0);

        return NextResponse.json(availableTypes);

    } catch (error) {
        console.error('Error fetching ticket types:', error);
        return NextResponse.json(
            { error: 'Error fetching ticket types' },
            { status: 500 }
        );
    }
}

