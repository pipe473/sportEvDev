'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/app/components/Navbar';
import Footer from '@/app/components/Footer';

// Profile Menu Component
export const ProfileMenu = () => {
    const { data: session } = useSession();

    return (
        <Link href="/profile" className="flex flex-row items-center gap-2 cursor-pointer">
            <p className="text-white text-sm">Hola, {session?.user?.name || 'Usuario'}</p>
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-red-500 flex items-center justify-center bg-zinc-800">
                {session?.user?.image ? (
                    <Image
                        src={session.user.image}
                        alt="Perfil"
                        width={40}
                        height={40}
                        sizes="40px"
                        style={{ objectFit: 'cover' }}
                        priority
                    />
                ) : (
                    <i className="fa-regular fa-user text-red-500 text-xl"></i>
                )}
            </div>
        </Link>
    );
};

// Main Profile Page Component
const ProfilePage = () => {
    const { data: session, update } = useSession();
    const [name, setName] = useState(session?.user?.name || '');
    const email = session?.user?.email || 'No email found';
    const [isEditing, setIsEditing] = useState(false);
    const [selectedImage, setSelectedImage] = useState(session?.user?.image || '');

    // Update local state when session changes
    useEffect(() => {
        if (session?.user) {
            setName(session.user.name || '');
            setSelectedImage(session.user.image || '');
        }
    }, [session]);

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            try {
                // Create FormData
                const formData = new FormData();
                formData.append('file', file);

                // First upload the image
                const uploadResponse = await fetch('/api/upload-image', {
                    method: 'POST',
                    body: formData,
                });

                if (!uploadResponse.ok) {
                    throw new Error('Failed to upload image');
                }

                const { imageUrl } = await uploadResponse.json();
                setSelectedImage(imageUrl);
                handleSaveChanges(imageUrl);
            } catch (error) {
                console.error('Error uploading image:', error);
                alert('Failed to upload image. Please try again.');
            }
        }
    };

    const handleSaveChanges = async (newImage?: string) => {
        try {
            const response = await fetch('/api/update-profile', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name,
                    image: newImage || selectedImage
                })
            });

            if (!response.ok) {
                throw new Error('Failed to update profile');
            }

            // Update session with new data
            await update({
                ...session,
                user: {
                    ...session?.user,
                    name: name,
                    image: newImage || selectedImage
                }
            });

            if (!newImage) {
                setIsEditing(false);
            }
        } catch (error) {
            console.error('Error saving changes:', error);
            alert('Failed to save changes. Please try again.');
        }
    };

    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow mt-40 mb-20">
                <div className="flex items-center justify-center">
                    <div className="bg-zinc-800 p-8 rounded-lg shadow-lg w-full max-w-md border border-red-500 lg:neon-effect">
                        <h1 className="text-3xl text-red-500 text-center mb-8 font-bold">Perfil</h1>
                        
                        {/* Profile Picture */}
                        <div className="flex flex-col items-center mb-6">
                            <div className="relative w-32 h-32 mb-4">
                                {selectedImage ? (
                                    <Image
                                        src={selectedImage}
                                        alt="Perfil"
                                        fill
                                        sizes="(max-width: 768px) 100vw, 128px"
                                        className="rounded-full border-4 border-red-500 neon-effect"
                                        style={{ objectFit: 'cover' }}
                                    />
                                ) : (
                                    <i className="fa-regular fa-user text-red-500 text-xl"></i>
                                )}
                            </div>
                            <label className="cursor-pointer bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 hover:shadow-neon transition">
                                Subir Foto
                                <input
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                />
                            </label>
                        </div>

                        {/* Profile Information */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-red-500 mb-2">Nombre</label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full bg-zinc-700 text-white p-2 rounded border border-red-500 focus:outline-none focus:border-red-600"
                                    />
                                ) : (
                                    <p className="text-white">{name}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-red-500 mb-2 cursor-not-allowed">Correo</label>
                                <p className="text-white">{email}</p>
                            </div>

                            <div>
                                <label className="block text-red-500 mb-2">Contraseña</label>
                                <Link 
                                    href="/change-password" 
                                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 hover:shadow-neon transition inline-block"
                                >
                                    Cambiar Contraseña
                                </Link>
                            </div>
                        </div>

                        {/* Edit Button */}
                        <button
                            onClick={isEditing ? () => handleSaveChanges() : () => setIsEditing(true)}
                            className="mt-6 w-full bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 hover:shadow-neon transition"
                        >
                            {isEditing ? 'Guardar Cambios' : 'Editar Perfil'}
                        </button>

                        {/* Back Button */}
                        <Link 
                            href="/" 
                            className="mt-4 w-full bg-black text-white px-8 py-3 rounded-[10px] border-2 
                                     border-red-500 hover:bg-red-500 hover:shadow-neon transition-all duration-300 
                                     flex items-center justify-center"
                        >
                            Volver
                        </Link>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default ProfilePage;