import React, { useState, useEffect } from 'react';
import client from '../../api/client';
import { StatusBadge } from '../../components/Shared';
import { DetailScreen, DetailRow } from '../../components/ui';
import { useLanguage } from '../../i18n/LanguageContext';
import { getCurrencySymbol } from '../../hooks/useSomiti';

export default function FdrDetailScreen({ route, navigation }: any) {
    const { t } = useLanguage();
    const [item, setItem] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const load = async () => {
        setLoading(true); setError(false);
        try { const { data } = await client.get(`/fdrs/${route.params.id}`); setItem(data); }
        catch { setError(true); }
        finally { setLoading(false); }
    };
    useEffect(() => { load(); }, []);

    return (
        <DetailScreen
            title={`${t('fdrs')} #${item?.id || ''}`}
            onBack={() => navigation.goBack()}
            loading={loading}
            error={error}
            onRetry={load}
            right={item ? <StatusBadge status={item.status} /> : null}
            stat={{ label: t('maturityAmount'), value: item?.maturity_amount, color: '#8B5CF6', currency: getCurrencySymbol() }}
        >
            <DetailRow label={t('bankName')} value={item?.bank_name} />
            <DetailRow label={t('interestRate')} value={item ? `${item.interest_rate}%` : null} />
            <DetailRow label={t('tenure')} value={item ? `${item.tenure_months} ${t('months')}` : null} />
            <DetailRow label={t('somiti')} value={item?.somiti?.name} />
            <DetailRow label={t('invested')} value={item?.investment ? `#${item.investment.id}` : null} last />
        </DetailScreen>
    );
}
