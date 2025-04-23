import EventList from '@/app/components/EventList';
import Navbar from '@/app/components/Navbar';
import Footer from '../components/Footer';

interface DBEvent {
    id: string;
    name: string;
    imageUrl?: string;
    location: string;
    date: string;
    time: string;
    category?: string;
}

interface Event {
    id: string;
    title: string;
    imageUrl: string;
    venue: string;
    date: string;
    time: string;
    category: string;
    sortDate: Date;
    alt: string;
}

interface EventsByMonth {
    [key: string]: Event[];
}

async function getUpcomingEvents() {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/events`, {
            cache: 'no-store'
        });
        const events = await response.json();
        
        console.log('Fetched events:', events);
        
        if (!Array.isArray(events) || events.length === 0) {
            return {};
        }

        // Group events by month
        const eventsByMonth: EventsByMonth = events.reduce((acc: EventsByMonth, event: any) => {
            try {
                const [year, month, day] = event.date.split('-').map(Number);
                const [hours, minutes] = event.time.split(':').map(Number);
                const date = new Date(year, month - 1, day, hours, minutes);
                
                const monthYear = new Intl.DateTimeFormat('es-ES', {
                    month: 'long',
                    year: 'numeric'
                }).format(date);
                
                const monthYearCap = monthYear.charAt(0).toUpperCase() + monthYear.slice(1);
                
                if (!acc[monthYearCap]) {
                    acc[monthYearCap] = [];
                }
                
                acc[monthYearCap].push({
                    id: event.id,
                    imageUrl: event.imageUrl?.startsWith('/') 
                        ? event.imageUrl 
                        : event.imageUrl 
                            ? `/images/event-banners/${event.imageUrl}` 
                            : '/images/default-event.jpg',
                    title: event.name,
                    venue: event.location,
                    date: `${event.date}, ${event.time}`,
                    time: event.time,
                    category: event.category || 'Sin categoría',
                    alt: `Imagen del evento: ${event.name}`,
                    sortDate: date
                });
                
                return acc;
            } catch (error) {
                console.error('Error processing event:', error, event);
                return acc;
            }
        }, {});

        console.log('Events by month:', eventsByMonth); // Debug log
        
        return eventsByMonth;
    } catch (error) {
        console.error('Error in getUpcomingEvents:', error);
        return {};
    }
}

export default async function UpcomingEventsPage() {
    const eventsByMonth = await getUpcomingEvents();
    
    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow mt-20 mb-20">
                {Object.entries(eventsByMonth).length > 0 ? (
                    Object.entries(eventsByMonth).map(([month, events]) => (
                        <div key={month}>
                            <div className="text-center mt-8 mb-4">
                                <h2 className="text-white text-4xl font-bold">{month}</h2>
                            </div>
                            <div className="px-4 md:px-12">
                                <EventList 
                                    data={events} 
                                    category={month}
                                    isMyEvents={false} 
                                />
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center text-white mt-10">
                        <h2 className="text-2xl">No hay eventos próximos</h2>
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
} 