import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prismadb from '../../../lib/prismadb';
import bcrypt from 'bcrypt';
import { authOptions } from '../../../pages/api/auth/[...nextauth]';

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        
        if (!session?.user?.email) {
            return NextResponse.json(
                { error: 'No autorizado' },
                { status: 401 }
            );
        }

        const { currentPassword, newPassword } = await request.json();

        const user = await prismadb.user.findUnique({
            where: { email: session.user.email }
        });

        if (!user?.hashedPassword) {
            return NextResponse.json(
                { error: 'Usuario no encontrado' },
                { status: 404 }
            );
        }

        const isCorrectPassword = await bcrypt.compare(
            currentPassword,
            user.hashedPassword
        );

        if (!isCorrectPassword) {
            return NextResponse.json(
                { error: 'Contraseña actual incorrecta' },
                { status: 400 }
            );
        }

        const hashedPassword = await bcrypt.hash(newPassword, 12);

        await prismadb.user.update({
            where: { email: session.user.email },
            data: { hashedPassword }
        });

        return NextResponse.json({ message: 'Contraseña actualizada' });
    } catch (error) {
        console.error('Error changing password:', error);
        return NextResponse.json(
            { error: 'Error al cambiar la contraseña' },
            { status: 500 }
        );
    }
}