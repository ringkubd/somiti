import React, { useState, useEffect } from 'react';
import client from '../../api/client';
import { StatusBadge } from '../../components/Shared';
import { DetailScreen, DetailRow } from '../../components/ui';
import { useLanguage } from '../../i18n/LanguageContext';
import { getCurrencySymbol } from '../../hooks/useSomiti';

export default function ShareTransferDetailScreen({ route, navigation }: any) {
    const { t } = useLanguage();
    const [item, setItem] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const load = async () => {
        setLoading(true); setError(false);
        try { const { data } = await client.get(`/share-transfers/${route.params.id}`); setItem(data); }
        catch { setError(true); }
        finally { setLoading(false); }
    };
    useEffect(() => { load(); }, []);

    const total = Number(item?.quantity || 0) * Number(item?.price_per_share || 0);

    return (
        <DetailScreen
            title={`${t('transfers')} #${item?.id || ''}`}
            onBack={() => navigation.goBack()}
            loading={loading}
            error={error}
            onRetry={load}
            right={item ? <StatusBadge status={item.status} /> : null}
            stat={{ label: t('totalValue'), value: total, color: '#8B5CF6', currency: getCurrencySymbol() }}
        >
            <DetailRow label={t('from')} value={item?.from_user?.name || 'Treasury'} />
            <DetailRow label={t('to')} value={item?.to_user?.name} />
            <DetailRow label={t('quantity')} value={item ? `${item.quantity} ${t('shares')}` : null} />
            <DetailRow label={t('pricePerShare')} value={item ? `${getCurrencySymbol()}${Number(item.price_per_share).toLocaleString()}` : null} />
            <DetailRow label={t('transferDate')} value={item?.transfer_date} />
            <DetailRow label={t('somiti')} value={item?.somiti?.name} />
            {item?.notes ? <DetailRow label={t('notes')} value={item.notes} last /> : null}
        </DetailScreen>
    );
}
