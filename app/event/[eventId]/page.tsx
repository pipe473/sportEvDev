import { use } from 'react';
import ClientEventPage from './ClientEventPage';

async function getEventId(params: { eventId: string }) {
    return params.eventId;
}

export default async function EventPage({ 
    params,
    searchParams 
}: { 
    params: { eventId: string },
    searchParams: { [key: string]: string | undefined }
}) {
    const eventId = params.eventId;
    const category = searchParams.category || '';
    
    return <ClientEventPage eventId={eventId} category={category} />;
} 