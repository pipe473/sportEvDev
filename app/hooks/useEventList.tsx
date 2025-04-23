import useSWR from 'swr';
import fetcher from '@/lib/fetcher';

const useEventList = () => {
    const { data, error, isLoading } = useSWR('/api/events', fetcher, {
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
        revalidateOnMount: false,
    });



    return { data, error, isLoading };
}

export default useEventList;