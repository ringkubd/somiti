import React, { useState, useEffect } from 'react';
import client from '../../api/client';
import { DetailScreen, DetailRow, Badge } from '../../components/ui';
import { useLanguage } from '../../i18n/LanguageContext';
import { getCurrencySymbol } from '../../hooks/useSomiti';

export default function BankAccountDetailScreen({ route, navigation }: any) {
    const { t } = useLanguage();
    const [item, setItem] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const load = async () => {
        setLoading(true); setError(false);
        try { const { data } = await client.get(`/bank-accounts/${route.params.id}`); setItem(data); }
        catch { setError(true); }
        finally { setLoading(false); }
    };
    useEffect(() => { load(); }, []);

    return (
        <DetailScreen
            title={item?.account_name || item?.bank_name || t('bankAccounts')}
            onBack={() => navigation.goBack()}
            loading={loading}
            error={error}
            onRetry={load}
            right={item ? <Badge label={item.is_active ? t('active') : t('inactive')} tone={item.is_active ? 'success' : 'neutral'} /> : null}
            stat={{ label: t('currentBalance'), value: item?.current_balance, color: '#3B82F6', currency: getCurrencySymbol() }}
        >
            <DetailRow label={t('bankName')} value={item?.bank_name} />
            <DetailRow label={t('branch')} value={item?.branch_name} />
            <DetailRow label={t('accountNumber')} value={item?.account_number} />
            <DetailRow label={t('accountType')} value={item?.account_type} />
            <DetailRow label={t('openingBalance')} value={item ? `${getCurrencySymbol()}${Number(item.opening_balance || 0).toLocaleString()}` : null} />
            <DetailRow label={t('somiti')} value={item?.somiti?.name} last />
        </DetailScreen>
    );
}
