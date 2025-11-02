import ClientEventPage from './ClientEventPage';

export default async function EventPage({ 
    params,
    searchParams 
}: { 
    params: Promise<{ eventId: string }> | { eventId: string },
    searchParams: Promise<{ [key: string]: string | undefined }> | { [key: string]: string | undefined }
}) {
    // Handle both Promise and direct params (for compatibility)
    const resolvedParams = params instanceof Promise ? await params : params;
    const resolvedSearchParams = searchParams instanceof Promise ? await searchParams : searchParams;
    
    const eventId = resolvedParams.eventId;
    const category = resolvedSearchParams.category || '';
    
    if (!eventId || eventId === 'undefined') {
        return <div className="flex items-center justify-center min-h-screen text-white">Evento no encontrado</div>;
    }
    
    return <ClientEventPage eventId={eventId} category={category} />;
} 