'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Navbar from '@/app/components/Navbar';
import Footer from '@/app/components/Footer';

interface Ticket {
    id: string;
    ticketNumber: string;
    qrCode: string;
    qrCodeImage: string | null;
    paymentStatus: string;
    isUsed: boolean;
    usedAt: string | null;
    price: number;
    createdAt: string;
    event: {
        id: string;
        name: string;
        date: string;
        time: string;
        location: string;
        imageUrl: string;
    };
    ticketType: {
        name: string;
        price: number;
    };
}

export default function MyTicketsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
            return;
        }

        if (status === 'authenticated') {
            fetchTickets();
        }
    }, [status, router]);

    const fetchTickets = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/tickets');
            
            if (!response.ok) {
                throw new Error('Error al cargar las entradas');
            }

            const data = await response.json();
            setTickets(data);
        } catch (err) {
            console.error('Error fetching tickets:', err);
            setError('Error al cargar las entradas');
        } finally {
            setLoading(false);
        }
    };

    const downloadQR = (ticket: Ticket) => {
        if (!ticket.qrCodeImage) {
            alert('QR code no disponible');
            return;
        }

        const link = document.createElement('a');
        link.href = ticket.qrCodeImage;
        link.download = `ticket-${ticket.ticketNumber}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (status === 'loading' || loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-black">
                <div className="text-white text-xl">Cargando...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col min-h-screen bg-black">
                <Navbar />
                <div className="flex-grow flex items-center justify-center">
                    <div className="text-red-500 text-xl">{error}</div>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen bg-black">
            <Navbar />
            <main className="flex-grow mt-20 mb-20 px-4 md:px-16">
                <h1 className="text-4xl text-red-500 font-bold mb-8">Mis Entradas</h1>

                {tickets.length === 0 ? (
                    <div className="text-center text-white py-20">
                        <i className="fa-regular fa-ticket text-6xl text-gray-600 mb-4"></i>
                        <p className="text-xl text-gray-400">No tienes entradas todavía</p>
                        <button
                            onClick={() => router.push('/')}
                            className="mt-6 bg-red-500 text-white px-6 py-3 rounded hover:bg-red-600 transition"
                        >
                            Ver Eventos
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {tickets.map((ticket) => (
                            <div
                                key={ticket.id}
                                className="bg-zinc-800 rounded-lg p-6 border border-red-500 hover:border-red-600 transition cursor-pointer"
                                onClick={() => setSelectedTicket(ticket)}
                            >
                                {/* Event Image */}
                                <div className="relative w-full h-48 mb-4 rounded overflow-hidden">
                                    <Image
                                        src={ticket.event.imageUrl || '/images/default-event.jpg'}
                                        alt={ticket.event.name}
                                        fill
                                        className="object-cover"
                                    />
                                    {ticket.isUsed && (
                                        <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center">
                                            <span className="text-red-500 text-2xl font-bold">USADA</span>
                                        </div>
                                    )}
                                </div>

                                {/* Event Info */}
                                <h3 className="text-white text-xl font-bold mb-2 line-clamp-2">
                                    {ticket.event.name}
                                </h3>
                                <div className="text-gray-400 space-y-1 mb-4">
                                    <p className="flex items-center gap-2">
                                        <i className="fa-regular fa-calendar"></i>
                                        {ticket.event.date} - {ticket.event.time}
                                    </p>
                                    <p className="flex items-center gap-2">
                                        <i className="fa-regular fa-map-marker-alt"></i>
                                        {ticket.event.location}
                                    </p>
                                    <p className="text-red-500 font-semibold">
                                        {ticket.ticketType.name} - €{ticket.ticketType.price.toFixed(2)}
                                    </p>
                                </div>

                                {/* Ticket Number */}
                                <div className="border-t border-gray-700 pt-4 mt-4">
                                    <p className="text-gray-500 text-sm">Nº de Entrada</p>
                                    <p className="text-white font-mono text-sm">{ticket.ticketNumber}</p>
                                </div>

                                {/* Status Badge */}
                                <div className="mt-4">
                                    {ticket.isUsed ? (
                                        <span className="bg-red-900 text-red-300 px-3 py-1 rounded text-sm">
                                            Usada
                                        </span>
                                    ) : (
                                        <span className="bg-green-900 text-green-300 px-3 py-1 rounded text-sm">
                                            Activa
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* QR Code Modal */}
                {selectedTicket && (
                    <div
                        className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
                        onClick={() => setSelectedTicket(null)}
                    >
                        <div
                            className="bg-zinc-800 rounded-lg p-8 max-w-md w-full border border-red-500"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl text-white font-bold">Entrada Digital</h2>
                                <button
                                    onClick={() => setSelectedTicket(null)}
                                    className="text-gray-400 hover:text-white"
                                >
                                    <i className="fa-solid fa-times text-xl"></i>
                                </button>
                            </div>

                            {/* Event Info */}
                            <div className="mb-6">
                                <h3 className="text-white text-xl font-bold mb-2">
                                    {selectedTicket.event.name}
                                </h3>
                                <p className="text-gray-400">
                                    {selectedTicket.event.date} - {selectedTicket.event.time}
                                </p>
                                <p className="text-gray-400">{selectedTicket.event.location}</p>
                                <p className="text-red-500 mt-2">
                                    {selectedTicket.ticketType.name} - €{selectedTicket.ticketType.price.toFixed(2)}
                                </p>
                            </div>

                            {/* QR Code */}
                            {selectedTicket.qrCodeImage && (
                                <div className="bg-white p-4 rounded mb-6 flex justify-center">
                                    <Image
                                        src={selectedTicket.qrCodeImage}
                                        alt="QR Code"
                                        width={250}
                                        height={250}
                                        className="object-contain"
                                    />
                                </div>
                            )}

                            {/* Ticket Number */}
                            <div className="text-center mb-6">
                                <p className="text-gray-500 text-sm mb-1">Nº de Entrada</p>
                                <p className="text-white font-mono">{selectedTicket.ticketNumber}</p>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-4">
                                {selectedTicket.qrCodeImage && (
                                    <button
                                        onClick={() => downloadQR(selectedTicket)}
                                        className="flex-1 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
                                    >
                                        <i className="fa-solid fa-download mr-2"></i>
                                        Descargar QR
                                    </button>
                                )}
                                <button
                                    onClick={() => setSelectedTicket(null)}
                                    className="flex-1 bg-zinc-700 text-white px-4 py-2 rounded hover:bg-zinc-600 transition"
                                >
                                    Cerrar
                                </button>
                            </div>

                            {selectedTicket.isUsed && (
                                <div className="mt-4 bg-red-900 bg-opacity-50 text-red-300 p-3 rounded text-center text-sm">
                                    Esta entrada ya ha sido usada
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
}

