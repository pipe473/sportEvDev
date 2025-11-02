import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import prismadb from '@/lib/prismadb';
import { createPaymentIntent } from '@/lib/stripe';

/**
 * POST /api/payments/create
 * Create a Stripe payment intent for ticket purchase
 */
export async function POST(request: Request) {
    try {
        // Authenticate user
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { eventId, ticketTypeId, quantity } = body;

        // Validate input
        if (!eventId || !ticketTypeId || !quantity || quantity < 1) {
            return NextResponse.json(
                { error: 'Missing required fields: eventId, ticketTypeId, quantity' },
                { status: 400 }
            );
        }

        // Get user
        const user = await prismadb.user.findUnique({
            where: { email: session.user.email }
        });

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        // Get event and ticket type
        const event = await prismadb.event.findUnique({
            where: { id: eventId }
        });

        if (!event) {
            return NextResponse.json(
                { error: 'Event not found' },
                { status: 404 }
            );
        }

        const ticketType = await prismadb.ticketType.findUnique({
            where: { id: ticketTypeId }
        });

        if (!ticketType) {
            return NextResponse.json(
                { error: 'Ticket type not found' },
                { status: 404 }
            );
        }

        // Check availability
        const available = ticketType.quantity - ticketType.sold;
        if (quantity > available) {
            return NextResponse.json(
                { error: `Only ${available} tickets available` },
                { status: 400 }
            );
        }

        // Calculate total amount
        const totalAmount = ticketType.price * quantity;

        // Create payment intent
        const paymentIntent = await createPaymentIntent(
            totalAmount,
            'eur', // You can make this configurable
            {
                userId: user.id,
                eventId: event.id,
                ticketTypeId: ticketType.id,
                quantity
            }
        );

        return NextResponse.json({
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id,
            amount: totalAmount,
            currency: 'eur'
        });

    } catch (error) {
        console.error('Error creating payment intent:', error);
        return NextResponse.json(
            { error: 'Error creating payment intent' },
            { status: 500 }
        );
    }
}

