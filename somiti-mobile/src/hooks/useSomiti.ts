import { useState, useEffect } from 'react';
import client from '../api/client';

let cachedSomiti: any = null;

export function getCachedSomiti() {
    return cachedSomiti;
}

export function getCurrencySymbol() {
    return cachedSomiti?.currency_symbol || '$';
}

export function useSomiti() {
    const [somiti, setSomiti] = useState<any>(cachedSomiti);
    const [loading, setLoading] = useState(!cachedSomiti);

    useEffect(() => {
        if (cachedSomiti) return;
        (async () => {
            try {
                const { data } = await client.get('/dashboard');
                if (data.selected_somiti) {
                    cachedSomiti = data.selected_somiti;
                    setSomiti(data.selected_somiti);
                }
            } catch {} finally {
                setLoading(false);
            }
        })();
    }, []);

    return { somiti, loading, somitiId: somiti?.id, currencySymbol: somiti?.currency_symbol || '$' };
}
