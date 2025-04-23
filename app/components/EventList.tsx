"use client";

import Image from 'next/image';
import { useRef, useState, useCallback, useEffect } from 'react';
import { FaHeart, FaRegHeart, FaTrash } from 'react-icons/fa';
import axios from 'axios';
import { useRouter } from 'next/navigation';

interface Event {
    id: string;
    title: string;
    imageUrl: string;
    venue: string;
    date: string;
    time: string;
    category: string;
    alt: string;  // Make sure alt is required
}

interface EventListProps {
    data: Event[];
    category: string;
    isMyEvents?: boolean;
}

const EventList: React.FC<EventListProps> = ({ data, category, isMyEvents = false }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);
    const sliderRef = useRef<HTMLDivElement>(null);
    const [favorites, setFavorites] = useState<string[]>([]);
    const router = useRouter();

    // Fetch favorite status when component mounts
    useEffect(() => {
        const fetchFavorites = async () => {
            try {
                const response = await axios.get('/api/favorites');
                const favoriteIds = response.data.map((fav: any) => fav.eventId);
                setFavorites(favoriteIds);
            } catch (error) {
                console.log(error);
            }
        };

        fetchFavorites();
    }, []);

    const startDragging = (e: React.MouseEvent<HTMLDivElement>) => {
        setIsDragging(true);
        setStartX(e.pageX - (sliderRef.current?.offsetLeft || 0));
        setScrollLeft(sliderRef.current?.scrollLeft || 0);
    };

    const stopDragging = () => {
        setIsDragging(false);
    };

    const move = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!isDragging) return;
        e.preventDefault();
        const x = e.pageX - (sliderRef.current?.offsetLeft || 0);
        const walk = (x - startX) * 2;
        if (sliderRef.current) {
            sliderRef.current.scrollLeft = scrollLeft - walk;
        }
    };

    const removeFavorite = async (eventId: string) => {
        try {
            await axios.delete('/api/favorites', { data: { eventId } });
            setFavorites(prev => prev.filter(id => id !== eventId));
            
            if (isMyEvents) {
                // Refresh the my-events page
                router.refresh();
            }
        } catch (error) {
            console.log(error);
        }
    };

    const toggleFavorite = useCallback(async (eventId: string) => {
        try {
            if (favorites.includes(eventId)) {
                await removeFavorite(eventId);
            } else {
                await axios.post('/api/favorites', { eventId });
                setFavorites(prev => [...prev, eventId]);
            }
        } catch (error) {
            console.log(error);
        }
    }, [favorites, isMyEvents]);

    useEffect(() => {
        if (isMyEvents) {
            setFavorites([]);
        }
    }, [isMyEvents]);

    const handleEventClick = (eventId: string, e: React.MouseEvent) => {
        if ((e.target as HTMLElement).closest('button')) {
            return;
        }
        router.push(`/event/${eventId}?category=${encodeURIComponent(category)}`);
    };

    return (
        <div className="px-4 md:px-12 mt-4 md:mt-8 space-y-8">
            <h2 className="text-white text-2xl font-semibold">{category}</h2>
            <div 
                ref={sliderRef}
                className="flex space-x-12 overflow-x-auto p-4 md:p-8 scrollbar-hide 
                          cursor-pointer no-scrollbar select-none"
                onMouseDown={startDragging}
                onMouseUp={stopDragging}
                onMouseLeave={stopDragging}
                onMouseMove={move}
            >
                {data.map((event) => (
                    <div 
                        key={event.id} 
                        className="flex-none w-[220px] group relative aspect-[2/3] 
                                 cursor-pointer transition-all duration-300 transform hover:scale-110
                                 hover:shadow-[0_0_30px_rgba(255,0,0,0.6)] hover:z-10"
                        onClick={(e) => handleEventClick(event.id, e)}
                    >
                        <div className="absolute inset-0 rounded-md overflow-hidden">
                            <Image
                                fill
                                src={event.imageUrl}
                                alt={event.alt || `${event.title} event image`}
                                className="object-cover rounded-[4px]"
                                sizes="220px"
                            />
                            {!isMyEvents ? (
                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        toggleFavorite(event.id);
                                    }}
                                    className="absolute top-2 right-2 z-10 p-2 
                                             text-white hover:scale-110 transition-transform
                                             bg-black bg-opacity-50 rounded-full"
                                >
                                    {favorites.includes(event.id) 
                                        ? <FaHeart className="text-red-500" size={20} />
                                        : <FaRegHeart size={20} />
                                    }
                                </button>
                            ) : (
                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        removeFavorite(event.id);
                                    }}
                                    className="absolute top-2 right-2 z-10 p-2 
                                             text-white hover:scale-110 transition-transform
                                             bg-black bg-opacity-50 rounded-full"
                                >
                                    <FaTrash className="text-red-500" size={20} />
                                </button>
                            )}
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <h3 className="text-white font-bold text-lg mb-1">{event.title}</h3>
                                <p className="text-gray-300 text-sm mb-1">{event.venue}</p>
                                <p className="text-gray-400 text-xs">{event.date}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default EventList; 