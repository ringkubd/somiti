import React, { useState, useEffect } from 'react';
import client from '../../api/client';
import { StatusBadge } from '../../components/Shared';
import { DetailScreen, DetailRow, AppButton } from '../../components/ui';
import { useLanguage } from '../../i18n/LanguageContext';
import { getCurrencySymbol } from '../../hooks/useSomiti';

export default function LoanDetailScreen({ route, navigation }: any) {
    const { t } = useLanguage();
    const [loan, setLoan] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const load = async () => {
        setLoading(true); setError(false);
        try { const { data } = await client.get(`/loans/${route.params.id}`); setLoan(data); }
        catch { setError(true); }
        finally { setLoading(false); }
    };
    useEffect(() => { load(); }, []);

    return (
        <DetailScreen
            title={`${t('loans')} #${loan?.id || ''}`}
            onBack={() => navigation.goBack()}
            loading={loading}
            error={error}
            onRetry={load}
            right={loan ? <StatusBadge status={loan.status} /> : null}
            stat={{ label: t('amount'), value: loan?.amount, color: '#EF4444', currency: getCurrencySymbol() }}
            footer={
                loan ? (
                    <AppButton title={t('viewRepayments')} onPress={() => navigation.navigate('RepaymentsList', { loanId: loan.id })} />
                ) : null
            }
        >
            <DetailRow label={t('somiti')} value={loan?.somiti?.name} />
            <DetailRow label={t('member')} value={loan?.user?.name} />
            <DetailRow label={t('interestRate')} value={loan ? `${loan.interest_rate}%` : null} />
            <DetailRow label={t('outstanding')} value={loan ? `${getCurrencySymbol()}${parseFloat(loan.outstanding_balance || '0').toLocaleString()}` : null} />
            <DetailRow label={t('tenureMonths')} value={loan ? `${loan.term_months || '-'} ${t('months')}` : null} />
            <DetailRow label={t('created')} value={loan && new Date(loan.created_at).toLocaleDateString()} last />
        </DetailScreen>
    );
}
