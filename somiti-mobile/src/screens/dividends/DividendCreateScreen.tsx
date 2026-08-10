import React, { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import client from '../../api/client';
import { useSomiti } from '../../hooks/useSomiti';
import { SelectField } from '../../components/SelectField';
import { FormScreen, AppInput } from '../../components/ui';
import { useLanguage } from '../../i18n/LanguageContext';

export default function DividendCreateScreen({ navigation }: any) {
    const { t } = useLanguage();
    const { somitiId } = useSomiti();
    const [totalAmount, setTotalAmount] = useState('');
    const [distributionType, setDistributionType] = useState('share_based');
    const [financialYearId, setFinancialYearId] = useState<string | null>(null);
    const [years, setYears] = useState<any[]>([]);
    const [profitPeriod, setProfitPeriod] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!somitiId) return;
        client.get(`/somitis/${somitiId}/financial-years`).then(({ data }) => {
            setYears((data || []).map((y: any) => ({ label: y.title || y.name || `${y.start_date} – ${y.end_date}`, value: y.id })));
            const active = (data || []).find((y: any) => y.is_active);
            if (active) setFinancialYearId(String(active.id));
        }).catch(() => {});
    }, [somitiId]);

    const submit = async () => {
        if (!totalAmount || !financialYearId) { Alert.alert(t('error'), t('amountAndFyRequired')); return; }
        setSubmitting(true);
        try {
            await client.post(`/somitis/${somitiId}/dividends`, { total_amount: parseFloat(totalAmount), distribution_type: distributionType, financial_year_id: parseInt(financialYearId), profit_period: profitPeriod || undefined });
            Alert.alert(t('done'), t('dividendDeclared')); navigation.goBack();
        } catch (err: any) { Alert.alert(t('error'), err.response?.data?.errors?.distribution_type?.[0] || err.response?.data?.errors?.total_amount?.[0] || err.response?.data?.message || 'Failed'); }
        finally { setSubmitting(false); }
    };

    return (
        <FormScreen title={t('declareDividend')} subtitle={t('distributeProfits')} onBack={() => navigation.goBack()} submitLabel={t('declareDividend')} onSubmit={submit} submitting={submitting}>
            <AppInput label={t('totalAmount')} placeholder="0.00" value={totalAmount} onChangeText={setTotalAmount} keyboardType="decimal-pad" />
            <SelectField label={t('distributionType')} value={distributionType} options={[{ label: t('shareBased'), value: 'share_based' }]} onSelect={setDistributionType} />
            <SelectField label={t('financialYear')} value={financialYearId} options={years} onSelect={setFinancialYearId} placeholder={t('selectFy')} />
            <AppInput label={t('profitPeriod')} placeholder="e.g. FY 2026" value={profitPeriod} onChangeText={setProfitPeriod} />
        </FormScreen>
    );
}
