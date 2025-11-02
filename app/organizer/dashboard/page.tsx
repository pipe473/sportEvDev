'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Navbar from '@/app/components/Navbar';
import Footer from '@/app/components/Footer';

interface ValidationResult {
    valid: boolean;
    message?: string;
    error?: string;
    ticket?: {
        id: string;
        ticketNumber: string;
        event: {
            name: string;
            date: string;
            time: string;
            location: string;
        };
        user: {
            name: string;
            email: string;
        };
        ticketType: {
            name: string;
            price: number;
        };
        validatedAt?: string;
    };
}

export default function OrganizerDashboardPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [qrCode, setQrCode] = useState('');
    const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [isOrganizer, setIsOrganizer] = useState(false);
    const [checkingRole, setCheckingRole] = useState(true);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
            return;
        }

        if (status === 'authenticated') {
            checkUserRole();
        }
    }, [status, router]);

    const checkUserRole = async () => {
        try {
            // Try to access organizer endpoint to check role
            const response = await fetch('/api/organizer/events');
            
            if (response.status === 403 || response.status === 401) {
                setIsOrganizer(false);
                setCheckingRole(false);
                return;
            }

            setIsOrganizer(true);
        } catch (error) {
            setIsOrganizer(false);
        } finally {
            setCheckingRole(false);
        }
    };

    const handleValidate = async () => {
        if (!qrCode.trim()) {
            alert('Por favor, introduce un código QR');
            return;
        }

        try {
            setLoading(true);
            setValidationResult(null);

            const response = await fetch('/api/organizer/validate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ qrCode }),
            });

            const data = await response.json();

            if (!response.ok && response.status === 403) {
                setValidationResult({
                    valid: false,
                    error: 'No tienes permisos de organizador'
                });
                return;
            }

            setValidationResult(data);
            
            // Clear QR code on success
            if (data.valid) {
                setQrCode('');
            }
        } catch (error) {
            console.error('Error validating ticket:', error);
            setValidationResult({
                valid: false,
                error: 'Error al validar la entrada'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleValidate();
        }
    };

    if (status === 'loading' || checkingRole) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-black">
                <div className="text-white text-xl">Cargando...</div>
            </div>
        );
    }

    if (!isOrganizer) {
        return (
            <div className="flex flex-col min-h-screen bg-black">
                <Navbar />
                <div className="flex-grow flex items-center justify-center">
                    <div className="text-center text-white">
                        <i className="fa-solid fa-lock text-6xl text-red-500 mb-4"></i>
                        <h2 className="text-2xl font-bold mb-2">Acceso Restringido</h2>
                        <p className="text-gray-400 mb-6">
                            Necesitas permisos de organizador para acceder a esta página
                        </p>
                        <button
                            onClick={() => router.push('/')}
                            className="bg-red-500 text-white px-6 py-3 rounded hover:bg-red-600 transition"
                        >
                            Volver al Inicio
                        </button>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen bg-black">
            <Navbar />
            <main className="flex-grow mt-20 mb-20 px-4 md:px-16">
                <h1 className="text-4xl text-red-500 font-bold mb-8">Dashboard de Validación</h1>

                {/* QR Scanner Section */}
                <div className="bg-zinc-800 rounded-lg p-8 mb-8 border border-red-500">
                    <h2 className="text-2xl text-white font-bold mb-6">Validar Entrada</h2>
                    
                    <div className="space-y-4">
                        <div>
                            <label className="block text-white mb-2">
                                Código QR
                            </label>
                            <textarea
                                value={qrCode}
                                onChange={(e) => setQrCode(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Pega el código QR aquí o escanéalo..."
                                className="w-full bg-zinc-700 text-white p-4 rounded border border-gray-600 focus:border-red-500 focus:outline-none resize-none"
                                rows={4}
                            />
                        </div>

                        <button
                            onClick={handleValidate}
                            disabled={loading || !qrCode.trim()}
                            className="w-full bg-red-500 text-white px-6 py-3 rounded hover:bg-red-600 transition disabled:bg-gray-600 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center">
                                    <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                                    Validando...
                                </span>
                            ) : (
                                <span className="flex items-center justify-center">
                                    <i className="fa-solid fa-qrcode mr-2"></i>
                                    Validar Entrada
                                </span>
                            )}
                        </button>
                    </div>
                </div>

                {/* Validation Result */}
                {validationResult && (
                    <div className={`rounded-lg p-6 mb-8 border-2 ${
                        validationResult.valid
                            ? 'bg-green-900 bg-opacity-30 border-green-500'
                            : 'bg-red-900 bg-opacity-30 border-red-500'
                    }`}>
                        {validationResult.valid ? (
                            <div>
                                <div className="flex items-center gap-3 mb-4">
                                    <i className="fa-solid fa-check-circle text-green-500 text-3xl"></i>
                                    <h3 className="text-2xl text-green-500 font-bold">
                                        Entrada Válida
                                    </h3>
                                </div>
                                
                                {validationResult.ticket && (
                                    <div className="space-y-3 text-white">
                                        <div>
                                            <p className="text-gray-400">Evento</p>
                                            <p className="font-bold">{validationResult.ticket.event.name}</p>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-gray-400">Fecha</p>
                                                <p>{validationResult.ticket.event.date} - {validationResult.ticket.event.time}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-400">Ubicación</p>
                                                <p>{validationResult.ticket.event.location}</p>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-gray-400">Usuario</p>
                                                <p>{validationResult.ticket.user.name}</p>
                                                <p className="text-sm text-gray-500">{validationResult.ticket.user.email}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-400">Tipo de Entrada</p>
                                                <p>{validationResult.ticket.ticketType.name}</p>
                                                <p className="text-sm">€{validationResult.ticket.ticketType.price.toFixed(2)}</p>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-gray-400">Nº de Entrada</p>
                                            <p className="font-mono">{validationResult.ticket.ticketNumber}</p>
                                        </div>
                                        {validationResult.ticket.validatedAt && (
                                            <div>
                                                <p className="text-gray-400">Validada el</p>
                                                <p>{new Date(validationResult.ticket.validatedAt).toLocaleString('es-ES')}</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div>
                                <div className="flex items-center gap-3 mb-4">
                                    <i className="fa-solid fa-times-circle text-red-500 text-3xl"></i>
                                    <h3 className="text-2xl text-red-500 font-bold">
                                        Entrada Inválida
                                    </h3>
                                </div>
                                <p className="text-red-300">
                                    {validationResult.error || validationResult.message || 'Error al validar la entrada'}
                                </p>
                                {validationResult.ticket && (
                                    <div className="mt-4 text-white">
                                        <p className="text-gray-400">Detalles:</p>
                                        <p className="font-mono text-sm">{validationResult.ticket.ticketNumber}</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Instructions */}
                <div className="bg-zinc-800 rounded-lg p-6 border border-gray-700">
                    <h3 className="text-white font-bold mb-4">Instrucciones</h3>
                    <ul className="text-gray-400 space-y-2 list-disc list-inside">
                        <li>Escanea el código QR de la entrada del usuario</li>
                        <li>O pega manualmente el código QR en el campo de texto</li>
                        <li>Presiona "Validar Entrada" o Enter</li>
                        <li>Si la entrada es válida, se marcará automáticamente como usada</li>
                        <li>Solo se pueden validar entradas con pago confirmado</li>
                    </ul>
                </div>
            </main>
            <Footer />
        </div>
    );
}

