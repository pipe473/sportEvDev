'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Input from '../components/input/page';

export default function ChangePassword() {
    const router = useRouter();
    const { data: session } = useSession();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (newPassword !== confirmPassword) {
            setError('Las contraseñas nuevas no coinciden');
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch('/api/change-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    currentPassword,
                    newPassword,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess('Contraseña actualizada exitosamente');
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
                setTimeout(() => router.push('/profile'), 2000);
            } else {
                setError(data.error || 'Algo salió mal');
            }
        } catch (error) {
            setError('Error al cambiar la contraseña');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow mt-40 mb-20">
                <div className="max-w-md mx-auto px-4">
                    <div className="bg-zinc-800 p-8 rounded-lg shadow-lg border border-red-500 lg:neon-effect">
                        <h1 className="text-3xl text-red-500 text-center mb-8 font-bold">
                            Cambiar Contraseña
                        </h1>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <Input
                                type="password"
                                value={currentPassword}
                                onChange={(e: any) => setCurrentPassword(e.target.value)}
                                label="Contraseña Actual"
                                id="currentPassword"
                            />
                            <Input
                                type="password"
                                value={newPassword}
                                onChange={(e: any) => setNewPassword(e.target.value)}
                                label="Nueva Contraseña"
                                id="newPassword"
                            />
                            <Input
                                type="password"
                                value={confirmPassword}
                                onChange={(e: any) => setConfirmPassword(e.target.value)}
                                label="Confirmar Nueva Contraseña"
                                id="confirmPassword"
                            />
                            
                            {error && (
                                <p className="text-red-500 text-sm text-center">{error}</p>
                            )}
                            {success && (
                                <p className="text-green-500 text-sm text-center">{success}</p>
                            )}

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-red-500 text-white px-4 py-2 rounded 
                                         hover:bg-red-600 hover:shadow-neon transition"
                            >
                                {isLoading ? 'Cambiando...' : 'Cambiar Contraseña'}
                            </button>
                        </form>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}