import React, { useState } from 'react';
import { Alert } from 'react-native';
import client from '../../api/client';
import { FormScreen, AppInput } from '../../components/ui';
import { useLanguage } from '../../i18n/LanguageContext';

export default function RepaymentCreateScreen({ route, navigation }: any) {
    const { t } = useLanguage();
    const loanId = route.params?.loanId;
    const [amount, setAmount] = useState('');
    const [paymentDate, setPaymentDate] = useState(new Date().toISOString().slice(0, 10));
    const [method, setMethod] = useState('');
    const [notes, setNotes] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const submit = async () => {
        if (!amount) { Alert.alert(t('error'), t('amount') + ' ' + t('required')); return; }
        setSubmitting(true);
        try {
            await client.post(`/loans/${loanId}/repayments`, { amount: parseFloat(amount), payment_date: paymentDate, method: method || undefined, notes: notes || undefined });
            Alert.alert(t('done'), t('repaymentSubmitted')); navigation.goBack();
        } catch (err: any) { Alert.alert(t('error'), err.response?.data?.message || 'Failed'); }
        finally { setSubmitting(false); }
    };

    return (
        <FormScreen title={t('loanRepayment')} subtitle={t('repayAgainst') + ` #${loanId}`} onBack={() => navigation.goBack()} submitLabel={t('submitRepayment')} onSubmit={submit} submitting={submitting}>
            <AppInput label={t('amount')} placeholder="0.00" value={amount} onChangeText={setAmount} keyboardType="decimal-pad" />
            <AppInput label={t('paymentDate')} placeholder="YYYY-MM-DD" value={paymentDate} onChangeText={setPaymentDate} autoCapitalize="none" />
            <AppInput label={t('method')} placeholder={t('method')} value={method} onChangeText={setMethod} />
            <AppInput label={t('notes') + ' ' + t('optional')} placeholder={t('notes')} value={notes} onChangeText={setNotes} multiline />
        </FormScreen>
    );
}
