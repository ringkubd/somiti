import React, { useState, useEffect } from 'react';
import client from '../../api/client';
import { StatusBadge } from '../../components/Shared';
import { DetailScreen, DetailRow } from '../../components/ui';
import { useLanguage } from '../../i18n/LanguageContext';

export default function UserShareDetailScreen({ route, navigation }: any) {
    const { t } = useLanguage();
    const [item, setItem] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const load = async () => {
        setLoading(true); setError(false);
        try { const { data } = await client.get(`/shares/${route.params.id}`); setItem(data); }
        catch { setError(true); }
        finally { setLoading(false); }
    };
    useEffect(() => { load(); }, []);

    return (
        <DetailScreen
            title={`${t('shares')} #${item?.id || ''}`}
            onBack={() => navigation.goBack()}
            loading={loading}
            error={error}
            onRetry={load}
            right={item ? <StatusBadge status={item.status} /> : null}
            stat={{ label: t('shareCount'), value: item?.share_count, color: '#16A34A', currency: '' }}
        >
            <DetailRow label={t('somiti')} value={item?.somiti?.name} />
            <DetailRow label={t('financialYear')} value={item?.financial_year?.title || item?.financial_year?.name} />
            <DetailRow label={t('allocated')} value={item && new Date(item.created_at).toLocaleDateString()} last />
        </DetailScreen>
    );
}
