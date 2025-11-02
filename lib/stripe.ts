/**
 * Stripe Configuration and Utilities
 */

import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
    console.warn('⚠️  STRIPE_SECRET_KEY not found in .env');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2025-10-29.clover',
    typescript: true,
    maxNetworkRetries: 3,
});

/**
 * Create a payment intent for ticket purchase
 */
export async function createPaymentIntent(
    amount: number, // Amount in cents
    currency: string = 'eur',
    metadata: {
        userId: string;
        eventId: string;
        ticketTypeId: string;
        quantity: number;
    }
): Promise<Stripe.PaymentIntent> {
    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100), // Convert to cents
            currency,
            automatic_payment_methods: {
                enabled: true,
            },
            metadata: {
                userId: metadata.userId,
                eventId: metadata.eventId,
                ticketTypeId: metadata.ticketTypeId,
                quantity: metadata.quantity.toString(),
            },
        });

        return paymentIntent;
    } catch (error) {
        console.error('Error creating payment intent:', error);
        throw error;
    }
}

/**
 * Verify webhook signature
 */
export function verifyWebhookSignature(
    body: string | Buffer,
    signature: string,
    secret: string
): Stripe.Event {
    try {
        const event = stripe.webhooks.constructEvent(
            body,
            signature,
            secret
        );
        return event;
    } catch (error) {
        console.error('Error verifying webhook signature:', error);
        throw new Error('Invalid webhook signature');
    }
}

/**
 * Get payment intent by ID
 */
export async function getPaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
    try {
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
        return paymentIntent;
    } catch (error) {
        console.error('Error retrieving payment intent:', error);
        throw error;
    }
}

