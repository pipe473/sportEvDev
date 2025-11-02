'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Navbar from '@/app/components/Navbar';
import Footer from '@/app/components/Footer';
import Image from 'next/image';

interface Event {
    id: string;
    name: string;
    date: string;
    time: string;
    location: string;
    category: string;
    imageUrl: string;
    ticketTypes: Array<{
        id: string;
        name: string;
        price: number;
        quantity: number;
        sold: number;
    }>;
    _count: {
        tickets: number;
    };
}

export default function OrganizerEventsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [isOrganizer, setIsOrganizer] = useState(false);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [showTicketTypeForm, setShowTicketTypeForm] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<string | null>(null);

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
            const response = await fetch('/api/organizer/events');
            
            if (response.status === 403 || response.status === 401) {
                setIsOrganizer(false);
                setLoading(false);
                return;
            }

            setIsOrganizer(true);
            fetchEvents();
        } catch (error) {
            setIsOrganizer(false);
            setLoading(false);
        }
    };

    const fetchEvents = async () => {
        try {
            const response = await fetch('/api/organizer/events');
            
            if (!response.ok) {
                throw new Error('Error al cargar eventos');
            }

            const data = await response.json();
            setEvents(data);
        } catch (err) {
            console.error('Error fetching events:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateEvent = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        try {
            const response = await fetch('/api/organizer/events', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: formData.get('name'),
                    date: formData.get('date'),
                    time: formData.get('time'),
                    location: formData.get('location'),
                    category: formData.get('category'),
                    imageUrl: formData.get('imageUrl') || '/images/default-event.jpg',
                    alt: formData.get('name'),
                    purchase_link: '#'
                }),
            });

            if (!response.ok) {
                throw new Error('Error al crear evento');
            }

            alert('Evento creado exitosamente');
            setShowCreateForm(false);
            fetchEvents();
        } catch (error) {
            console.error('Error creating event:', error);
            alert('Error al crear evento');
        }
    };

    const handleCreateTicketType = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!selectedEvent) return;

        const formData = new FormData(e.currentTarget);

        try {
            const response = await fetch(`/api/organizer/events/${selectedEvent}/ticket-types`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: formData.get('name'),
                    price: parseFloat(formData.get('price') as string),
                    quantity: parseInt(formData.get('quantity') as string),
                    description: formData.get('description') || null
                }),
            });

            if (!response.ok) {
                throw new Error('Error al crear tipo de entrada');
            }

            alert('Tipo de entrada creado exitosamente');
            setShowTicketTypeForm(false);
            setSelectedEvent(null);
            fetchEvents();
        } catch (error) {
            console.error('Error creating ticket type:', error);
            alert('Error al crear tipo de entrada');
        }
    };

    if (status === 'loading' || loading) {
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
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-4xl text-red-500 font-bold">Gestión de Eventos</h1>
                    <button
                        onClick={() => setShowCreateForm(true)}
                        className="bg-red-500 text-white px-6 py-3 rounded hover:bg-red-600 transition"
                    >
                        <i className="fa-solid fa-plus mr-2"></i>
                        Crear Evento
                    </button>
                </div>

                {/* Create Event Form Modal */}
                {showCreateForm && (
                    <div
                        className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
                        onClick={() => setShowCreateForm(false)}
                    >
                        <div
                            className="bg-zinc-800 rounded-lg p-8 max-w-md w-full border border-red-500"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h2 className="text-2xl text-white font-bold mb-6">Crear Nuevo Evento</h2>
                            <form onSubmit={handleCreateEvent} className="space-y-4">
                                <div>
                                    <label className="block text-white mb-2">Nombre del Evento</label>
                                    <input
                                        type="text"
                                        name="name"
                                        required
                                        className="w-full bg-zinc-700 text-white p-2 rounded border border-gray-600"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-white mb-2">Fecha</label>
                                        <input
                                            type="date"
                                            name="date"
                                            required
                                            className="w-full bg-zinc-700 text-white p-2 rounded border border-gray-600"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-white mb-2">Hora</label>
                                        <input
                                            type="time"
                                            name="time"
                                            required
                                            className="w-full bg-zinc-700 text-white p-2 rounded border border-gray-600"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-white mb-2">Ubicación</label>
                                    <input
                                        type="text"
                                        name="location"
                                        required
                                        className="w-full bg-zinc-700 text-white p-2 rounded border border-gray-600"
                                    />
                                </div>
                                <div>
                                    <label className="block text-white mb-2">Categoría</label>
                                    <select
                                        name="category"
                                        required
                                        className="w-full bg-zinc-700 text-white p-2 rounded border border-gray-600"
                                    >
                                        <option value="Fútbol">Fútbol</option>
                                        <option value="Baloncesto">Baloncesto</option>
                                        <option value="MMA">MMA</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-white mb-2">URL de Imagen</label>
                                    <input
                                        type="url"
                                        name="imageUrl"
                                        placeholder="/images/default-event.jpg"
                                        className="w-full bg-zinc-700 text-white p-2 rounded border border-gray-600"
                                    />
                                </div>
                                <div className="flex gap-4">
                                    <button
                                        type="submit"
                                        className="flex-1 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                                    >
                                        Crear
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowCreateForm(false)}
                                        className="flex-1 bg-zinc-700 text-white px-4 py-2 rounded hover:bg-zinc-600"
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Create Ticket Type Form Modal */}
                {showTicketTypeForm && selectedEvent && (
                    <div
                        className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
                        onClick={() => {
                            setShowTicketTypeForm(false);
                            setSelectedEvent(null);
                        }}
                    >
                        <div
                            className="bg-zinc-800 rounded-lg p-8 max-w-md w-full border border-red-500"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h2 className="text-2xl text-white font-bold mb-6">Añadir Tipo de Entrada</h2>
                            <form onSubmit={handleCreateTicketType} className="space-y-4">
                                <div>
                                    <label className="block text-white mb-2">Nombre</label>
                                    <input
                                        type="text"
                                        name="name"
                                        required
                                        placeholder="General, VIP, Palco..."
                                        className="w-full bg-zinc-700 text-white p-2 rounded border border-gray-600"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-white mb-2">Precio (€)</label>
                                        <input
                                            type="number"
                                            name="price"
                                            step="0.01"
                                            min="0"
                                            required
                                            className="w-full bg-zinc-700 text-white p-2 rounded border border-gray-600"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-white mb-2">Cantidad</label>
                                        <input
                                            type="number"
                                            name="quantity"
                                            min="1"
                                            required
                                            className="w-full bg-zinc-700 text-white p-2 rounded border border-gray-600"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-white mb-2">Descripción (opcional)</label>
                                    <textarea
                                        name="description"
                                        rows={3}
                                        className="w-full bg-zinc-700 text-white p-2 rounded border border-gray-600 resize-none"
                                    />
                                </div>
                                <div className="flex gap-4">
                                    <button
                                        type="submit"
                                        className="flex-1 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                                    >
                                        Crear
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowTicketTypeForm(false);
                                            setSelectedEvent(null);
                                        }}
                                        className="flex-1 bg-zinc-700 text-white px-4 py-2 rounded hover:bg-zinc-600"
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Events List */}
                {events.length === 0 ? (
                    <div className="text-center text-white py-20">
                        <i className="fa-regular fa-calendar text-6xl text-gray-600 mb-4"></i>
                        <p className="text-xl text-gray-400">No tienes eventos creados</p>
                        <button
                            onClick={() => setShowCreateForm(true)}
                            className="mt-6 bg-red-500 text-white px-6 py-3 rounded hover:bg-red-600 transition"
                        >
                            Crear Primer Evento
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {events.map((event) => (
                            <div
                                key={event.id}
                                className="bg-zinc-800 rounded-lg p-6 border border-red-500"
                            >
                                <div className="relative w-full h-48 mb-4 rounded overflow-hidden">
                                    <Image
                                        src={event.imageUrl || '/images/default-event.jpg'}
                                        alt={event.name}
                                        fill
                                        className="object-cover"
                                    />
                                </div>

                                <h3 className="text-white text-xl font-bold mb-2">{event.name}</h3>
                                <div className="text-gray-400 space-y-1 mb-4">
                                    <p>{event.date} - {event.time}</p>
                                    <p>{event.location}</p>
                                    <p className="text-red-500">{event.category}</p>
                                </div>

                                {/* Ticket Types */}
                                <div className="border-t border-gray-700 pt-4 mb-4">
                                    <div className="flex justify-between items-center mb-2">
                                        <p className="text-white font-semibold">Tipos de Entrada</p>
                                        <button
                                            onClick={() => {
                                                setSelectedEvent(event.id);
                                                setShowTicketTypeForm(true);
                                            }}
                                            className="text-red-500 hover:text-red-400 text-sm"
                                        >
                                            <i className="fa-solid fa-plus mr-1"></i>
                                            Añadir
                                        </button>
                                    </div>
                                    {event.ticketTypes.length === 0 ? (
                                        <p className="text-gray-500 text-sm">Sin tipos de entrada</p>
                                    ) : (
                                        <div className="space-y-2">
                                            {event.ticketTypes.map((type) => (
                                                <div
                                                    key={type.id}
                                                    className="bg-zinc-700 p-2 rounded text-sm"
                                                >
                                                    <div className="flex justify-between text-white">
                                                        <span>{type.name}</span>
                                                        <span>€{type.price.toFixed(2)}</span>
                                                    </div>
                                                    <div className="text-gray-400 text-xs mt-1">
                                                        {type.sold} / {type.quantity} vendidas
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Stats */}
                                <div className="border-t border-gray-700 pt-4">
                                    <p className="text-gray-400 text-sm">
                                        {event._count.tickets} entradas vendidas
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
}

