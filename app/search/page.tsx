'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/app/components/Navbar';
import EventList from '@/app/components/EventList';
import Footer from '@/app/components/Footer';

export default function SearchPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (searchTerm.length >= 2) {
                setIsSearching(true);
                try {
                    const response = await fetch(`/api/search?q=${encodeURIComponent(searchTerm)}`);
                    const data = await response.json();
                    console.log('Search results:', data); // Debug log
                    setSearchResults(data);
                } catch (error) {
                    console.error('Error searching:', error);
                    setSearchResults([]);
                } finally {
                    setIsSearching(false);
                }
            } else {
                setSearchResults([]);
            }
        }, 300); // Debounce delay

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow mt-20 mb-20">
                <div className="px-4 md:px-12 mt-4">
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Buscar eventos..."
                        className="w-full p-4 rounded-md bg-neutral-700 text-white focus:outline-none"
                    />
                </div>
                {isSearching ? (
                    <div className="text-center mt-8 text-white">Buscando...</div>
                ) : (
                    searchResults.length > 0 && (
                        <div className="mt-8">
                            <EventList 
                                data={searchResults} 
                                category="Resultados" 
                                isMyEvents={false} 
                            />
                        </div>
                    )
                )}
            </main>
            <Footer />
        </div>
    );
}