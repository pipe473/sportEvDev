import { NextResponse } from 'next/server';
import { requireOrganizer } from '@/lib/auth';
import prismadb from '@/lib/prismadb';

/**
 * PUT /api/admin/users/[userId]/role
 * Update user role (Organizer only)
 * 
 * This allows organizers to promote other users to organizer role
 * or demote organizers to user role
 */
export async function PUT(
    request: Request,
    { params }: { params: Promise<{ userId: string }> }
) {
    try {
        // Only organizers can change roles
        await requireOrganizer();

        const resolvedParams = params instanceof Promise ? await params : params;
        const { userId } = resolvedParams;

        const body = await request.json();
        const { role } = body;

        // Validate role
        if (!role || !['user', 'organizer'].includes(role)) {
            return NextResponse.json(
                { error: 'Invalid role. Must be "user" or "organizer"' },
                { status: 400 }
            );
        }

        // Check if user exists
        const user = await prismadb.user.findUnique({
            where: { id: userId }
        });

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        // Update role
        const updatedUser = await prismadb.user.update({
            where: { id: userId },
            data: {
                role
            },
            select: {
                id: true,
                email: true,
                name: true,
                role: true
            }
        });

        return NextResponse.json({
            success: true,
            user: updatedUser
        });

    } catch (error: any) {
        console.error('Error updating user role:', error);
        
        if (error.message === 'Unauthorized' || error.message.includes('Forbidden')) {
            return NextResponse.json(
                { error: error.message },
                { status: error.message === 'Unauthorized' ? 401 : 403 }
            );
        }

        return NextResponse.json(
            { error: 'Error updating user role' },
            { status: 500 }
        );
    }
}

