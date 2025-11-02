import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { verifyWebhookSignature, getPaymentIntent } from '@/lib/stripe';
import prismadb from '@/lib/prismadb';
import { generateTicketNumber, generateTicketQR } from '@/lib/qrGenerator';

/**
 * POST /api/payments/webhook
 * Handle Stripe webhook events
 * 
 * Configure this URL in Stripe Dashboard:
 * https://yourdomain.com/api/payments/webhook
 */
export async function POST(request: Request) {
    try {
        const body = await request.text();
        const headersList = await headers();
        const signature = headersList.get('stripe-signature');

        if (!signature) {
            return NextResponse.json(
                { error: 'Missing stripe-signature header' },
                { status: 400 }
            );
        }

        const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
        if (!webhookSecret) {
            console.error('STRIPE_WEBHOOK_SECRET not configured');
            return NextResponse.json(
                { error: 'Webhook secret not configured' },
                { status: 500 }
            );
        }

        // Verify webhook signature
        let event;
        try {
            event = verifyWebhookSignature(body, signature, webhookSecret);
        } catch (error) {
            console.error('Webhook signature verification failed:', error);
            return NextResponse.json(
                { error: 'Invalid signature' },
                { status: 400 }
            );
        }

        // Handle different event types
        switch (event.type) {
            case 'payment_intent.succeeded':
                await handlePaymentSuccess(event.data.object);
                break;

            case 'payment_intent.payment_failed':
                await handlePaymentFailure(event.data.object);
                break;

            default:
                console.log(`Unhandled event type: ${event.type}`);
        }

        return NextResponse.json({ received: true });

    } catch (error) {
        console.error('Webhook error:', error);
        return NextResponse.json(
            { error: 'Webhook handler failed' },
            { status: 500 }
        );
    }
}

/**
 * Handle successful payment
 */
async function handlePaymentSuccess(paymentIntent: any) {
    try {
        const { metadata } = paymentIntent;
        const userId = metadata.userId;
        const eventId = metadata.eventId;
        const ticketTypeId = metadata.ticketTypeId;
        const quantity = parseInt(metadata.quantity, 10);

        // Get ticket type
        const ticketType = await prismadb.ticketType.findUnique({
            where: { id: ticketTypeId }
        });

        if (!ticketType) {
            console.error('Ticket type not found:', ticketTypeId);
            return;
        }

        // Create tickets
        const tickets = [];
        for (let i = 0; i < quantity; i++) {
            const ticketNumber = generateTicketNumber();
            const qrData = await generateTicketQR(
                ticketNumber,
                eventId,
                userId
            );

            const ticket = await prismadb.ticket.create({
                data: {
                    ticketNumber,
                    eventId,
                    userId,
                    ticketTypeId,
                    qrCode: qrData.qrCode,
                    qrCodeImage: qrData.qrCodeImage,
                    paymentStatus: 'paid',
                    paymentIntentId: paymentIntent.id,
                    price: ticketType.price
                }
            });

            tickets.push(ticket);
        }

        // Update ticket type sold count
        await prismadb.ticketType.update({
            where: { id: ticketTypeId },
            data: {
                sold: ticketType.sold + quantity
            }
        });

        console.log(`✅ Created ${quantity} tickets for user ${userId}, event ${eventId}`);
    } catch (error) {
        console.error('Error handling payment success:', error);
        throw error;
    }
}

/**
 * Handle failed payment
 */
async function handlePaymentFailure(paymentIntent: any) {
    try {
        const { metadata } = paymentIntent;
        console.log(`❌ Payment failed for user ${metadata.userId}, event ${metadata.eventId}`);
        // You could update tickets with payment_status = 'failed' if they were pre-created
    } catch (error) {
        console.error('Error handling payment failure:', error);
    }
}

