import { NextResponse } from 'next/server';
import prismadb from '@/lib/prismadb';
import { decodeQRCodeString } from '@/lib/qrGenerator';
import { requireAnyRole, requireOrganizer } from '@/lib/auth';

/**
 * POST /api/tickets/validate
 * Validate a QR code ticket
 * Accessible by organizers and users (users can validate their own tickets)
 * 
 * Body: { qrCode: string }
 */
export async function POST(request: Request) {
    try {
        // Verify user is authenticated (organizer or user)
        const user = await requireAnyRole(['user', 'organizer']);
        
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
            return NextResponse.json(
                { 
                    valid: false,
                    error: 'Invalid QR code format'
                },
                { status: 400 }
            );
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
        const validations: string[] = [];

        // Check if ticket is paid
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

        // Check if ticket is already used
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

        // Check if event matches
        if (ticket.eventId !== decoded.eventId) {
            return NextResponse.json({
                valid: false,
                error: 'QR code does not match event'
            });
        }

        // All validations passed
        return NextResponse.json({
            valid: true,
            ticket: {
                id: ticket.id,
                ticketNumber: ticket.ticketNumber,
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
                createdAt: ticket.createdAt
            }
        });

    } catch (error) {
        console.error('Error validating ticket:', error);
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
 * PUT /api/tickets/validate/:ticketId
 * Mark a ticket as used after validation (Organizer only)
 */
export async function PUT(request: Request) {
    try {
        // Only organizers can mark tickets as used
        const organizer = await requireOrganizer();
        
        const body = await request.json();
        const { ticketId, validatedBy } = body;

        if (!ticketId) {
            return NextResponse.json(
                { error: 'Ticket ID is required' },
                { status: 400 }
            );
        }

        // Find ticket
        const ticket = await prismadb.ticket.findUnique({
            where: { id: ticketId }
        });

        if (!ticket) {
            return NextResponse.json(
                { error: 'Ticket not found' },
                { status: 404 }
            );
        }

        if (ticket.isUsed) {
            return NextResponse.json(
                { error: 'Ticket already used' },
                { status: 400 }
            );
        }

        // Mark as used
        const updatedTicket = await prismadb.ticket.update({
            where: { id: ticketId },
            data: {
                isUsed: true,
                usedAt: new Date(),
                validatedBy: validatedBy || organizer.id
            }
        });

        return NextResponse.json({
            success: true,
            ticket: {
                id: updatedTicket.id,
                ticketNumber: updatedTicket.ticketNumber,
                isUsed: updatedTicket.isUsed,
                usedAt: updatedTicket.usedAt
            }
        });

    } catch (error) {
        console.error('Error marking ticket as used:', error);
        return NextResponse.json(
            { error: 'Error updating ticket' },
            { status: 500 }
        );
    }
}

