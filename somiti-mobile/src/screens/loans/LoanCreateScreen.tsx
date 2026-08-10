import React, { useState } from 'react';
import { StyleSheet, Alert, View } from 'react-native';
import client from '../../api/client';
import { useSomiti } from '../../hooks/useSomiti';
import { FormScreen, AppInput } from '../../components/ui';
import { useLanguage } from '../../i18n/LanguageContext';
import { maybeShowInterstitial } from '../../ads/useInterstitial';
import { spacing } from '../../theme';

export default function LoanCreateScreen({ navigation }: any) {
    const { t } = useLanguage();
    const { somitiId } = useSomiti();
    const [amount, setAmount] = useState('');
    const [interestRate, setInterestRate] = useState('5');
    const [durationMonths, setDurationMonths] = useState('12');
    const [purpose, setPurpose] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const submit = async () => {
        if (!amount) { Alert.alert(t('error'), t('amount') + ' ' + t('required')); return; }
        setSubmitting(true);
        try {
            await client.post('/loans', { somiti_id: somitiId, amount: parseFloat(amount), interest_rate: parseFloat(interestRate), term_months: parseInt(durationMonths), purpose });
            Alert.alert(t('done'), t('loanSubmitted')); navigation.goBack();
            maybeShowInterstitial();
        } catch (err: any) { Alert.alert(t('error'), err.response?.data?.message || 'Failed'); }
        finally { setSubmitting(false); }
    };

    return (
        <FormScreen title={t('newLoan')} subtitle={t('applyForLoan')} onBack={() => navigation.goBack()} submitLabel={t('submitApplication')} onSubmit={submit} submitting={submitting}>
            <AppInput label={t('amount')} placeholder="0.00" value={amount} onChangeText={setAmount} keyboardType="decimal-pad" />
            <View style={styles.row}>
                <View style={styles.flex}><AppInput label={t('interestRate')} placeholder="5" value={interestRate} onChangeText={setInterestRate} keyboardType="decimal-pad" /></View>
                <View style={styles.flex}><AppInput label={t('months')} placeholder="12" value={durationMonths} onChangeText={setDurationMonths} keyboardType="number-pad" /></View>
            </View>
            <AppInput label={t('purpose')} placeholder={t('optional')} value={purpose} onChangeText={setPurpose} multiline />
        </FormScreen>
    );
}

const styles = StyleSheet.create({ row: { flexDirection: 'row', gap: spacing.md }, flex: { flex: 1 } });
