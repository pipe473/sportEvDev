interface DBEvent {
    id: string;
    name: string;
    imageUrl?: string;
    location: string;
    date: string;
    time: string;
    category?: string;
}

export interface Event {
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

export function formatEvent(event: DBEvent): Event {
    try {
        const [year, month, day] = event.date.split('-').map(Number);
        const [hours, minutes] = event.time.split(':').map(Number);
        const sortDate = new Date(year, month - 1, day, hours, minutes);

        return {
            id: event.id,
            title: event.name,
            imageUrl: event.imageUrl?.startsWith('/')
                ? event.imageUrl
                : event.imageUrl
                    ? `/images/event-banners/${event.imageUrl}`
                    : '/images/default-event.jpg',
            venue: event.location,
            date: `${event.date}, ${event.time}`,
            time: event.time,
            category: event.category || 'Sin categoría',
            sortDate,
            alt: `Imagen del evento: ${event.name}`
        };
    } catch (error) {
        console.error('Error formatting event:', error, event);
        // Return a fallback or throw the error, depending on what you prefer
        throw error;
    }
}