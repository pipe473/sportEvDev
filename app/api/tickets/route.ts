import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import prismadb from '@/lib/prismadb';

/**
 * GET /api/tickets
 * Get all tickets for the authenticated user
 */
export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const user = await prismadb.user.findUnique({
            where: { email: session.user.email }
        });

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        // Get user's tickets with event and ticket type info
        const tickets = await prismadb.ticket.findMany({
            where: {
                userId: user.id,
                paymentStatus: 'paid' // Only show paid tickets
            },
            include: {
                event: true,
                ticketType: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return NextResponse.json(tickets);

    } catch (error) {
        console.error('Error fetching tickets:', error);
        return NextResponse.json(
            { error: 'Error fetching tickets' },
            { status: 500 }
        );
    }
}

