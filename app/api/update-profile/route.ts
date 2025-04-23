import { NextResponse } from 'next/server';
import prismadb from '@/lib/prismadb';
import { getServerSession } from 'next-auth';
import authOptions from '@/pages/api/auth/[...nextauth]';
import { Session } from 'next-auth';

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions) as Session | null;
        if (!session?.user?.email) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await req.json();
        const { name, image } = body;

        const updatedUser = await prismadb.user.update({
            where: {
                email: session.user.email
            },
            data: {
                name,
                image
            }
        });

        return NextResponse.json(updatedUser);
    } catch (error) {
        console.log('[UPDATE_PROFILE]', error);
        return new NextResponse("Internal Error", { status: 500 });
    }
} 