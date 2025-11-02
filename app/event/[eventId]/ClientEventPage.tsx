"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import axios from 'axios';
import Navbar from '@/app/components/Navbar';
import Footer from '@/app/components/Footer';
import { FaHeart, FaRegHeart } from 'react-icons/fa';

interface Event {
    id: string;
    imageUrl: string;
    title: string;
    venue: string;
    date: string;
    category: string;
}

interface ClientEventPageProps {
    eventId: string;
    category: string;
}

export default function ClientEventPage({ eventId, category }: ClientEventPageProps) {
    const router = useRouter();
    const [event, setEvent] = useState<Event | null>(null);
    const [favorites, setFavorites] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Validar que eventId existe antes de hacer la petición
        if (!eventId || eventId === 'undefined') {
            setIsLoading(false);
            return;
        }

        const fetchEvent = async () => {
            try {
                const response = await fetch(`/api/events?id=${eventId}`);
                if (!response.ok) {
                    throw new Error(`Failed to fetch event: ${response.status}`);
                }
                const data = await response.json();
                if (!data) {
                    throw new Error('No event data');
                }
                
                setEvent({
                    id: data.id,
                    imageUrl: data.imageUrl || '/images/default-event.jpg',
                    title: data.name || 'Event Title',
                    venue: data.location || 'Venue',
                    date: new Date(data.date + ' ' + data.time).toLocaleDateString('es-ES', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    }),
                    category: data.category || category
                });
            } catch (error) {
                console.error('Error fetching event:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchEvent();
    }, [eventId, category]);

    useEffect(() => {
        const fetchFavorites = async () => {
            try {
                const response = await axios.get('/api/favorites');
                const favoriteIds = response.data.map((fav: any) => fav.eventId);
                setFavorites(favoriteIds);
            } catch (error) {
                console.error('Error fetching favorites:', error);
            }
        };

        fetchFavorites();
    }, []);

    const toggleFavorite = async () => {
        if (!event) return;

        try {
            if (favorites.includes(event.id)) {
                await axios.delete('/api/favorites', { data: { eventId: event.id } });
                setFavorites(prev => prev.filter(id => id !== event.id));
            } else {
                await axios.post('/api/favorites', { eventId: event.id });
                setFavorites(prev => [...prev, event.id]);
            }
        } catch (error) {
            console.error(error)
        }
    };

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (!event) {
        return <div>Event not found</div>;
    }

    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow mt-40 mb-20">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Left side - Image */}
                        <div className="relative w-[220px] h-[320px] md:w-[320px] md:h-[540px] mx-auto 
                                      shadow-[0_0_60px_rgba(255,0,0,0.5)] rounded-lg">
                            <Image
                                src={event.imageUrl}
                                alt={event.title}
                                fill
                                className="object-cover rounded-lg"
                            />
                            {/* Favorite Button */}
                            <button 
                                onClick={toggleFavorite}
                                className="absolute top-4 right-4 z-10 p-2 
                                         text-white hover:scale-110 transition-transform
                                         bg-black bg-opacity-50 rounded-full"
                            >
                                {favorites.includes(event.id) 
                                    ? <FaHeart className="text-red-500" size={24} />
                                    : <FaRegHeart size={24} />
                                }
                            </button>
                        </div>

                        {/* Right side - Event Details */}
                        <div className="flex flex-col justify-center text-white space-y-6 text-center md:text-left">
                            {category && (
                                <p className="text-red-500 text-xl font-medium">
                                    {decodeURIComponent(category)}
                                </p>
                            )}
                            <h1 className="text-4xl font-bold">{event.title}</h1>
                            <p className="text-2xl">{event.venue}</p>
                            <p className="text-xl">{event.date}</p>
                            
                            <button 
                                className="mt-8 w-full max-w-md mx-auto md:mx-0 bg-black text-white px-8 py-3 
                                         rounded-[10px] border-2 border-red-500 hover:bg-red-500 
                                         hover:shadow-neon transition-all duration-300"
                            >
                                Comprar entradas
                            </button>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
} 