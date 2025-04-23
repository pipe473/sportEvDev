import { NextResponse } from 'next/server';
import prismadb from '@/lib/prismadb';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        console.log('Reset password request body:', body);
        
        const { token, password } = body;

        if (!token || !password) {
            console.log('Missing token or password:', { token, password });
            return NextResponse.json(
                { error: 'Token and password are required' },
                { status: 400 }
            );
        }

        // First, let's check if any user has this token
        const userWithToken = await prismadb.user.findFirst({
            where: {
                resetToken: token
            }
        });

        console.log('User with token:', userWithToken);

        if (!userWithToken) {
            console.log('No user found with token:', token);
            return NextResponse.json(
                { error: 'Invalid reset token' },
                { status: 400 }
            );
        }

        // Then check if the token is expired
        if (userWithToken.resetTokenExpiry && userWithToken.resetTokenExpiry < new Date()) {
            console.log('Token expired:', userWithToken.resetTokenExpiry);
            return NextResponse.json(
                { error: 'Reset token has expired' },
                { status: 400 }
            );
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const updatedUser = await prismadb.user.update({
            where: { id: userWithToken.id },
            data: {
                hashedPassword: hashedPassword,
                resetToken: null,
                resetTokenExpiry: null
            }
        });

        console.log('Updated user:', updatedUser);

        return NextResponse.json({ message: 'Password reset successfully' });
    } catch (error) {
        console.error('Password reset error:', error);
        return NextResponse.json(
            { error: 'Something went wrong' },
            { status: 500 }
        );
    }
} 