'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

const events = [
    {
        image: '/images/slide-banners/slide1.jpg',
        title: 'REAL MADRID vs BARCELONA',
        venue: 'Estadio Santiago Bernabéu',
        date: '15 de Diciembre 2025 - 20:45',
    },
    {
        image: '/images/slide-banners/slide2.jpg',
        title: 'LIVERPOOL vs MANCHESTER UNITED',
        venue: 'Estadio Anfield',
        date: '20 de Diciembre 2025 - 18:30',
    },
    {
        image: '/images/slide-banners/slide3.jpg',
        title: 'PSG vs MARSEILLE',
        venue: 'Parque de los Príncipes',
        date: '23 de Diciembre 2025 - 21:00',
    },
    {
        image: '/images/slide-banners/slide4.jpg',
        title: 'MILAN vs INTER',
        venue: 'Estadio San Siro',
        date: '26 de Diciembre 2025 - 20:45',
    },
    {
        image: '/images/slide-banners/slide5.jpg',
        title: 'BAYERN vs DORTMUND',
        venue: 'Arena Allianz',
        date: '30 de Diciembre 2025 - 19:30',
    },
];

const Slideshow = () => {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentIndex((prevIndex) => 
                prevIndex === events.length - 1 ? 0 : prevIndex + 1
            );
        }, 5000);

        return () => clearInterval(timer);
    }, []);

    const goToSlide = (index: number) => {
        setCurrentIndex(index);
    };

    const goToPrevious = () => {
        setCurrentIndex((prevIndex) => 
            prevIndex === 0 ? events.length - 1 : prevIndex - 1
        );
    };

    const goToNext = () => {
        setCurrentIndex((prevIndex) => 
            prevIndex === events.length - 1 ? 0 : prevIndex + 1
        );
    };

    return (
        <div className="relative w-full h-[600px] overflow-hidden">
            {/* Main Image Container */}
            <div className="relative w-full h-full flex items-center justify-center">
                <div className="absolute inset-0">
                    <Image
                        src={events[currentIndex].image}
                        alt={events[currentIndex].title}
                        fill
                        sizes="100vw"
                        priority
                        className="object-contain md:object-cover transition-opacity duration-500"
                        style={{ objectPosition: 'center center' }}
                    />
                </div>
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-zinc-900/90 via-zinc-900/30 to-zinc-900/90 md:via-transparent" />

                {/* Event Information */}
                <div className="absolute inset-0 flex flex-col items-center justify-end pb-16 z-20">
                    <div className="bg-zinc-900/60 backdrop-blur-sm p-6 rounded-lg max-w-2xl w-11/12 md:w-auto">
                        <h2 className="text-3xl md:text-4xl font-bold text-white text-shadow-neon text-center">
                            {events[currentIndex].title}
                        </h2>
                        <div className="text-center mt-4">
                            <h3 className="text-2xl md:text-3xl font-semibold text-white mb-2 text-shadow-neon">
                                {events[currentIndex].venue}
                            </h3>
                            <p className="text-lg md:text-xl text-white mb-6 text-shadow-neon">
                                {events[currentIndex].date}
                            </p>
                            <button className="bg-black text-white px-8 py-3 rounded-[10px] border-2 border-red-500 hover:bg-red-500 hover:shadow-neon transition-all duration-300">
                                Comprar Entradas
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation Arrows */}
            <button 
                onClick={goToPrevious}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 w-10 h-10 
                           flex items-center justify-center rounded-full hover:bg-red-500 
                           transition z-30 cursor-pointer"
            >
                <i className="fa-solid fa-chevron-left text-white text-xl" />
            </button>
            <button 
                onClick={goToNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 w-10 h-10 
                           flex items-center justify-center rounded-full hover:bg-red-500 
                           transition z-30 cursor-pointer"
            >
                <i className="fa-solid fa-chevron-right text-white text-xl" />
            </button>

            {/* Dots Navigation */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                {events.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => goToSlide(index)}
                        className={`w-3 h-3 rounded-full transition-all ${
                            currentIndex === index 
                                ? 'bg-red-500 w-6' 
                                : 'bg-white/50 hover:bg-white'
                        }`}
                    />
                ))}
            </div>
        </div>
    );
};

export default Slideshow; 