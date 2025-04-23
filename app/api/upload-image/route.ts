import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;
        
        if (!file) {
            return NextResponse.json(
                { error: 'No file uploaded' },
                { status: 400 }
            );
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
            return NextResponse.json(
                { error: 'File must be an image' },
                { status: 400 }
            );
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Ensure uploads directory exists
        const publicPath = path.join(process.cwd(), 'public', 'uploads');
        try {
            await mkdir(publicPath, { recursive: true });
        } catch (error) {
            console.error('Error creating directory:', error);
        }

        // Create unique filename
        const uniqueFilename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '')}`;
        const filePath = path.join(publicPath, uniqueFilename);

        // Write file
        await writeFile(filePath, buffer);

        // Return the URL path
        return NextResponse.json({ 
            imageUrl: `/uploads/${uniqueFilename}` 
        });
    } catch (error) {
        console.error('Error in upload route:', error);
        return NextResponse.json(
            { error: 'Failed to upload file' },
            { status: 500 }
        );
    }
} 