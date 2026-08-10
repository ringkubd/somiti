import React, { useState, useEffect } from 'react';
import client from '../../api/client';
import { StatusBadge } from '../../components/Shared';
import { DetailScreen, DetailRow, AppButton } from '../../components/ui';
import { useLanguage } from '../../i18n/LanguageContext';
import { getCurrencySymbol } from '../../hooks/useSomiti';

export default function DepositDetailScreen({ route, navigation }: any) {
    const { t } = useLanguage();
    const [deposit, setDeposit] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const load = async () => {
        setLoading(true); setError(false);
        try { const { data } = await client.get(`/deposits/${route.params.id}`); setDeposit(data); }
        catch { setError(true); }
        finally { setLoading(false); }
    };
    useEffect(() => { load(); }, []);

    return (
        <DetailScreen
            title={`${t('deposits')} #${deposit?.id || ''}`}
            onBack={() => navigation.goBack()}
            loading={loading}
            error={error}
            onRetry={load}
            right={deposit ? <StatusBadge status={deposit.status} /> : null}
            stat={{ label: t('amount'), value: deposit?.amount, currency: getCurrencySymbol() }}
            footer={
                deposit ? (
                    <AppButton
                        title={t('viewReceipt')}
                        variant="outline"
                        onPress={() => navigation.navigate('DepositReceipt', { somitiId: deposit.somiti_id, depositId: deposit.id })}
                    />
                ) : null
            }
        >
            <DetailRow label={t('somiti')} value={deposit?.somiti?.name} />
            <DetailRow label={t('member')} value={deposit?.user?.name} />
            <DetailRow label={t('type')} value={deposit?.type} />
            <DetailRow label={t('month')} value={deposit?.month} />
            <DetailRow label={t('date')} value={deposit && new Date(deposit.created_at).toLocaleDateString()} />
            {deposit?.approver ? <DetailRow label={t('approvedBy')} value={deposit.approver.name} last /> : null}
        </DetailScreen>
    );
}
