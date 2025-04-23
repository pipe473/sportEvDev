import { NextResponse } from 'next/server';
import prismadb from '@/lib/prismadb';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../pages/api/auth/[...nextauth]';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json([], { status: 200 });
        }

        const user = await prismadb.user.findUnique({
            where: { email: session.user.email }
        });

        if (!user) {
            return NextResponse.json([], { status: 200 });
        }

        const favorites = await prismadb.favorite.findMany({
            where: { userId: user.id }
        });

        return NextResponse.json(favorites);
    } catch (error) {
        console.error('Error in favorites:', error);
        return NextResponse.json([], { status: 200 });
    }
}

export async function DELETE(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { eventId } = body;

        const user = await prismadb.user.findUnique({
            where: { email: session.user.email }
        });

        await prismadb.favorite.delete({
            where: {
                userId_eventId: {
                    userId: user!.id,
                    eventId: eventId
                }
            }
        });

        return NextResponse.json({ message: 'Favorite removed' });
    } catch (error) {
        return NextResponse.json({ error: 'Internal error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json([], { status: 200 });
        }

        const user = await prismadb.user.findUnique({
            where: { email: session.user.email }
        });

        if (!user) {
            return NextResponse.json([], { status: 200 });
        }

        const { eventId } = await request.json();

        const favorite = await prismadb.favorite.create({
            data: {
                userId: user.id,
                eventId
            }
        });

        return NextResponse.json(favorite);
    } catch (error) {
        console.error('Error in favorites:', error);
        return NextResponse.json([], { status: 200 });
    }
} 