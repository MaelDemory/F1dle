import { useEffect, useRef, useState } from 'react';
import { HistoricalDriver } from '../types';
import { fetchHistoricalDrivers } from '../api/f1dleApi';

export const useHistoricalDrivers = (enabled: boolean) => {
    const [drivers, setDrivers] = useState<HistoricalDriver[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const fetchedRef = useRef(false);

    useEffect(() => {
        if (!enabled || fetchedRef.current) return;

        fetchedRef.current = true;
        setLoading(true);
        setError('');

        fetchHistoricalDrivers()
            .then((data) => {
                setDrivers(data);
                setLoading(false);
            })
            .catch((err: Error) => {
                setError(err.message);
                setLoading(false);
                fetchedRef.current = false;
            });
    }, [enabled]);

    return { drivers, loading, progress: { loaded: 0, total: 0 }, error };
};
