import EventList from '@/app/components/EventList';
import { getServerSession } from 'next-auth';
import authOptions from '@/pages/api/auth/[...nextauth]';
import prismadb from '@/lib/prismadb';
import Navbar from '@/app/components/Navbar';
import Footer from '@/app/components/Footer';
import { Session } from 'next-auth';
import { formatEvent } from '@/app/utils/formatEvent';

export default async function MyEventsPage() {
    const session = await getServerSession(authOptions) as Session;
    
    if (!session?.user?.email) {
        return null;
    }

    const user = await prismadb.user.findUnique({
        where: { email: session.user.email },
        include: {
            favorites: true
        }
    });

    // Fetch details for each favorited event
    const favoriteEvents = await Promise.all(
        user?.favorites.map(async (fav: { eventId: string }) => {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/events?id=${fav.eventId}`);
            const eventData = await response.json();
            return eventData;
        }) || []
    );

    const rawEvents = await favoriteEvents;
    const events = rawEvents.map(formatEvent);

    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow mt-20 mb-20">
                <EventList 
                    data={events} 
                    category="Mis Eventos" 
                    isMyEvents={true} 
                />
            </main>
            <Footer />
        </div>
    );
} 