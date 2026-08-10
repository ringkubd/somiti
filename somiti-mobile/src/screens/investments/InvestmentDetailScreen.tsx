import React, { useState, useEffect } from 'react';
import client from '../../api/client';
import { StatusBadge } from '../../components/Shared';
import { DetailScreen, DetailRow } from '../../components/ui';
import { useLanguage } from '../../i18n/LanguageContext';
import { getCurrencySymbol } from '../../hooks/useSomiti';

export default function InvestmentDetailScreen({ route, navigation }: any) {
    const { t } = useLanguage();
    const [item, setItem] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const load = async () => {
        setLoading(true); setError(false);
        try { const { data } = await client.get(`/investments/${route.params.id}`); setItem(data); }
        catch { setError(true); }
        finally { setLoading(false); }
    };
    useEffect(() => { load(); }, []);

    return (
        <DetailScreen
            title={`${t('investments')} #${item?.id || ''}`}
            onBack={() => navigation.goBack()}
            loading={loading}
            error={error}
            onRetry={load}
            right={item ? <StatusBadge status={item.status} /> : null}
            stat={{ label: t('amount'), value: item?.amount, color: '#3B82F6', currency: getCurrencySymbol() }}
        >
            <DetailRow label={t('type')} value={item?.type} />
            <DetailRow label={t('somiti')} value={item?.somiti?.name} />
            <DetailRow label={t('financialYear')} value={item?.financial_year?.title || item?.financial_year?.name} />
            <DetailRow label={t('date') + ' (' + t('from') + ')'} value={item?.start_date} />
            <DetailRow label={t('maturityAmount')} value={item?.maturity_date} />
            <DetailRow label={t('expected')} value={item?.expected_return ? `${getCurrencySymbol()}${Number(item.expected_return).toLocaleString()}` : null} />
            {item?.approved_at ? <DetailRow label={t('approvedBy')} value={new Date(item.approved_at).toLocaleDateString()} last /> : null}
        </DetailScreen>
    );
}
