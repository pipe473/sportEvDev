import { NextResponse } from 'next/server';
import prismadb from '@/lib/prismadb';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../pages/api/auth/[...nextauth]';

export async function GET() {
    try {
        // Manejar errores de autenticación de manera más robusta
        let session;
        try {
            session = await getServerSession(authOptions);
        } catch (authError) {
            // Si hay un error de autenticación, simplemente retornar array vacío
            console.warn('Auth error in favorites GET (non-critical):', authError);
            return NextResponse.json([], { status: 200 });
        }

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
        console.error('Error in favorites GET:', error);
        // Retornar array vacío en lugar de error 500 para evitar romper la UI
        return NextResponse.json([], { status: 200 });
    }
}

export async function DELETE(request: Request) {
    try {
        let session;
        try {
            session = await getServerSession(authOptions);
        } catch (authError) {
            console.warn('Auth error in favorites DELETE:', authError);
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { eventId } = body;

        const user = await prismadb.user.findUnique({
            where: { email: session.user.email }
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        await prismadb.favorite.delete({
            where: {
                userId_eventId: {
                    userId: user.id,
                    eventId: eventId
                }
            }
        });

        return NextResponse.json({ message: 'Favorite removed' });
    } catch (error) {
        console.error('Error in favorites DELETE:', error);
        return NextResponse.json({ 
            error: 'Internal error',
            message: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        let session;
        try {
            session = await getServerSession(authOptions);
        } catch (authError) {
            console.warn('Auth error in favorites POST:', authError);
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await prismadb.user.findUnique({
            where: { email: session.user.email }
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const { eventId } = await request.json();

        if (!eventId) {
            return NextResponse.json({ error: 'Event ID is required' }, { status: 400 });
        }

        const favorite = await prismadb.favorite.create({
            data: {
                userId: user.id,
                eventId
            }
        });

        return NextResponse.json(favorite);
    } catch (error) {
        console.error('Error in favorites POST:', error);
        return NextResponse.json({ 
            error: 'Error creating favorite',
            message: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
} 