import React, { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import client from '../../api/client';
import { useSomiti } from '../../hooks/useSomiti';
import { SelectField } from '../../components/SelectField';
import { FormScreen, AppInput, ChipGroup } from '../../components/ui';
import { useLanguage } from '../../i18n/LanguageContext';

export default function InvestmentCreateScreen({ navigation }: any) {
    const { t } = useLanguage();
    const { somitiId } = useSomiti();
    const [fyId, setFyId] = useState(''); const [type, setType] = useState('business');
    const [amount, setAmount] = useState(''); const [startDate, setStartDate] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [fys, setFys] = useState<{ label: string; value: string }[]>([]);

    useEffect(() => {
        if (!somitiId) return;
        client.get(`/somitis/${somitiId}/financial-years`).then(({ data }) => {
            setFys((data || []).map((fy: any) => ({ label: fy.title, value: fy.id.toString() })));
        }).catch(() => {});
    }, [somitiId]);

    const submit = async () => {
        if (!amount) { Alert.alert(t('error'), t('amount') + ' ' + t('required')); return; }
        setSubmitting(true);
        try {
            await client.post('/investments', { somiti_id: somitiId, financial_year_id: parseInt(fyId) || undefined, type, amount: parseFloat(amount), start_date: startDate || undefined });
            Alert.alert(t('done'), t('investmentSubmitted')); navigation.goBack();
        } catch (err: any) { Alert.alert(t('error'), err.response?.data?.message || 'Failed'); }
        finally { setSubmitting(false); }
    };

    return (
        <FormScreen title={t('newInvestment')} subtitle={t('recordInvestment')} onBack={() => navigation.goBack()} submitLabel={t('submit')} onSubmit={submit} submitting={submitting}>
            <SelectField label={t('financialYear')} value={fyId} options={fys} onSelect={setFyId} placeholder={t('selectFy')} />
            <ChipGroup label={t('type')} options={['business', 'fdr', 'stock', 'other']} value={type} onChange={setType} />
            <AppInput label={t('amount')} placeholder="0.00" value={amount} onChangeText={setAmount} keyboardType="decimal-pad" />
            <AppInput label={t('startDate')} placeholder="YYYY-MM-DD" value={startDate} onChangeText={setStartDate} autoCapitalize="none" />
        </FormScreen>
    );
}
