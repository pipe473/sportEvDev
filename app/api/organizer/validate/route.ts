import { NextResponse } from 'next/server';
import { requireOrganizer } from '@/lib/auth';
import prismadb from '@/lib/prismadb';
import { decodeQRCodeString } from '@/lib/qrGenerator';

/**
 * POST /api/organizer/validate
 * Validate and mark a ticket as used (Organizer only)
 */
export async function POST(request: Request) {
    try {
        // Verify organizer role
        const organizer = await requireOrganizer();

        const body = await request.json();
        const { qrCode } = body;

        if (!qrCode) {
            return NextResponse.json(
                { error: 'QR code is required' },
                { status: 400 }
            );
        }

        // Decode QR code
        const decoded = decodeQRCodeString(qrCode);
        if (!decoded) {
            return NextResponse.json({
                valid: false,
                error: 'Invalid QR code format'
            }, { status: 400 });
        }

        // Find ticket by QR code
        const ticket = await prismadb.ticket.findUnique({
            where: { qrCode },
            include: {
                event: true,
                user: true,
                ticketType: true
            }
        });

        if (!ticket) {
            return NextResponse.json({
                valid: false,
                error: 'Ticket not found'
            });
        }

        // Validate ticket
        if (ticket.paymentStatus !== 'paid') {
            return NextResponse.json({
                valid: false,
                error: 'Ticket payment not confirmed',
                ticket: {
                    id: ticket.id,
                    ticketNumber: ticket.ticketNumber,
                    paymentStatus: ticket.paymentStatus
                }
            });
        }

        if (ticket.isUsed) {
            return NextResponse.json({
                valid: false,
                error: 'Ticket already used',
                ticket: {
                    id: ticket.id,
                    ticketNumber: ticket.ticketNumber,
                    usedAt: ticket.usedAt,
                    validatedBy: ticket.validatedBy
                }
            });
        }

        // Mark as used
        const updatedTicket = await prismadb.ticket.update({
            where: { id: ticket.id },
            data: {
                isUsed: true,
                usedAt: new Date(),
                validatedBy: organizer.id
            }
        });

        return NextResponse.json({
            valid: true,
            message: 'Ticket validated successfully',
            ticket: {
                id: updatedTicket.id,
                ticketNumber: updatedTicket.ticketNumber,
                event: {
                    id: ticket.event.id,
                    name: ticket.event.name,
                    date: ticket.event.date,
                    time: ticket.event.time,
                    location: ticket.event.location
                },
                user: {
                    id: ticket.user.id,
                    name: ticket.user.name,
                    email: ticket.user.email
                },
                ticketType: {
                    name: ticket.ticketType.name,
                    price: ticket.ticketType.price
                },
                validatedAt: updatedTicket.usedAt,
                validatedBy: organizer.id
            }
        });

    } catch (error: any) {
        console.error('Error validating ticket:', error);
        
        if (error.message === 'Unauthorized' || error.message.includes('Forbidden')) {
            return NextResponse.json(
                { error: error.message },
                { status: error.message === 'Unauthorized' ? 401 : 403 }
            );
        }

        return NextResponse.json(
            { 
                valid: false,
                error: 'Error validating ticket' 
            },
            { status: 500 }
        );
    }
}

/**
 * GET /api/organizer/validate/stats
 * Get validation statistics for organizer's events
 */
export async function GET(request: Request) {
    try {
        // Verify organizer role
        await requireOrganizer();

        const { searchParams } = new URL(request.url);
        const eventId = searchParams.get('eventId');

        // Get validation stats
        const where: any = {
            paymentStatus: 'paid'
        };

        if (eventId) {
            where.eventId = eventId;
        }

        const stats = await prismadb.ticket.groupBy({
            by: ['isUsed', 'eventId'],
            where,
            _count: {
                id: true
            }
        });

        // Get event details
        const events = await prismadb.event.findMany({
            where: eventId ? { id: eventId } : {},
            include: {
                ticketTypes: {
                    include: {
                        _count: {
                            select: {
                                tickets: true
                            }
                        }
                    }
                }
            }
        });

        return NextResponse.json({
            stats,
            events
        });

    } catch (error: any) {
        console.error('Error fetching validation stats:', error);
        
        if (error.message === 'Unauthorized' || error.message.includes('Forbidden')) {
            return NextResponse.json(
                { error: error.message },
                { status: error.message === 'Unauthorized' ? 401 : 403 }
            );
        }

        return NextResponse.json(
            { error: 'Error fetching validation stats' },
            { status: 500 }
        );
    }
}

