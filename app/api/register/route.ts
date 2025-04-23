import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import prisma from '../../../lib/prismadb';

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const email = formData.get('email') as string;
        const name = formData.get('name') as string;
        const password = formData.get('password') as string;
        const profileImage = formData.get('profileImage') as File | null;

        if (!email || !name || !password) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const existingUser = await prisma.user.findUnique({
            where: {
                email
            }
        });

        if (existingUser) {
            return NextResponse.json({ error: 'Email already taken' }, { status: 422 });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        let imageUrl = null;
        if (profileImage) {
            // Handle image upload to your storage service
            // This is a placeholder - implement your image upload logic here
            // imageUrl = await uploadImage(profileImage);
        }

        const user = await prisma.user.create({
            data: {
                email,
                name,
                hashedPassword,
                image: imageUrl,
            }
        });

        return NextResponse.json(user);
    } catch (error) {
        console.log(error);
        return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
    }
} 