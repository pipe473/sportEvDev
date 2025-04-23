import Navbar from '@/app/components/Navbar';
import Slideshow from '@/app/components/Slideshow';
import EventList from '@/app/components/EventList';
import PubliBanner from '@/app/components/PubliBanner';
import Footer from '@/app/components/Footer';
import { formatEvent } from '@/app/utils/formatEvent';

async function getEvents() {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/events`, {
            cache: 'no-store'  // This ensures fresh data
        });
        const data = await response.json();
        
        console.log('Raw API response:', data);
        
        // Make sure we return an array, even if empty
        const events = Array.isArray(data) ? data : [];
        console.log('Processed events:', events);
        
        return events;
        
    } catch (error) {
        console.error('Error fetching events:', error);
        return []; // Return empty array on error
    }
}

export default async function Home() {
    const rawEvents = await getEvents();
    const events = rawEvents.map(formatEvent);

    // Add a check before mapping
    if (!Array.isArray(events)) {
        console.error('Events is not an array:', events);
        return <div>Error loading events</div>;
    }

    const categories = [...new Set(events.map((event: { category: string }) => event.category))];
    console.log('Available categories:', categories);
    console.log('All events:', events);

    return (
        <main className="flex min-h-screen flex-col">
            <Navbar />
            <Slideshow />
            {events.length > 0 ? (
                <>
                    {categories.includes('Fútbol') && (
                        <div className="px-4 md:px-12">
                            <EventList 
                                data={events} 
                                category="Fútbol" 
                            />
                        </div>
                    )}
                    {categories.includes('MMA') && (
                        <div className="px-4 md:px-12">
                            <EventList 
                                data={events} 
                                category="MMA" 
                            />
                        </div>
                    )}
                    <PubliBanner bannerNumber={1} />
                    {categories.includes('Baloncesto') && (
                        <div className="px-4 md:px-12">
                            <EventList 
                                data={events} 
                                category="Baloncesto"
                            />
                        </div>
                    )}
                </>
            ) : (
                <div className="text-center text-white py-10">No events available</div>
            )}
            <PubliBanner bannerNumber={2} />
            <Footer />
        </main>
    );
}