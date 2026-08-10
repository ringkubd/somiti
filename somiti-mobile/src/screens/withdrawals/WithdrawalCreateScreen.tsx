import React, { useState } from 'react';
import { Alert } from 'react-native';
import client from '../../api/client';
import { useSomiti } from '../../hooks/useSomiti';
import { FormScreen, AppInput } from '../../components/ui';
import { useLanguage } from '../../i18n/LanguageContext';

export default function WithdrawalCreateScreen({ navigation }: any) {
    const { t } = useLanguage();
    const { somitiId } = useSomiti();
    const [amount, setAmount] = useState('');
    const [reason, setReason] = useState('');
    const [method, setMethod] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const submit = async () => {
        if (!amount) { Alert.alert(t('error'), t('amount') + ' ' + t('required')); return; }
        setSubmitting(true);
        try {
            await client.post('/withdrawals', { somiti_id: somitiId, amount: parseFloat(amount), reason: reason || undefined, method: method || undefined });
            Alert.alert(t('done'), t('withdrawalSubmitted')); navigation.goBack();
        } catch (err: any) { Alert.alert(t('error'), err.response?.data?.errors?.amount?.[0] || err.response?.data?.message || 'Failed'); }
        finally { setSubmitting(false); }
    };

    return (
        <FormScreen title={t('withdrawSavings')} subtitle={t('withdrawalNeedsApproval')} onBack={() => navigation.goBack()} submitLabel={t('requestWithdrawal')} onSubmit={submit} submitting={submitting}>
            <AppInput label={t('amount')} placeholder="0.00" value={amount} onChangeText={setAmount} keyboardType="decimal-pad" />
            <AppInput label={t('method')} placeholder={t('method')} value={method} onChangeText={setMethod} />
            <AppInput label={t('reason') + ' ' + t('optional')} placeholder={t('reason')} value={reason} onChangeText={setReason} multiline />
        </FormScreen>
    );
}
