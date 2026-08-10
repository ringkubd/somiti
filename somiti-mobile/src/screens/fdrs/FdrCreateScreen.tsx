import React, { useState } from 'react';
import { StyleSheet, Alert, View } from 'react-native';
import client from '../../api/client';
import { useSomiti } from '../../hooks/useSomiti';
import { FormScreen, AppInput } from '../../components/ui';
import { useLanguage } from '../../i18n/LanguageContext';
import { spacing } from '../../theme';

export default function FdrCreateScreen({ navigation }: any) {
    const { t } = useLanguage();
    const { somitiId } = useSomiti();
    const [bankName, setBankName] = useState(''); const [interestRate, setInterestRate] = useState('');
    const [tenure, setTenure] = useState('12'); const [maturityAmount, setMaturityAmount] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const submit = async () => {
        if (!bankName) { Alert.alert(t('error'), t('bankNameRequired')); return; }
        setSubmitting(true);
        try {
            await client.post('/fdrs', { somiti_id: somitiId, bank_name: bankName, interest_rate: parseFloat(interestRate) || 0, tenure_months: parseInt(tenure), maturity_amount: parseFloat(maturityAmount) || 0 });
            Alert.alert(t('done'), t('fdrSubmitted')); navigation.goBack();
        } catch (err: any) { Alert.alert(t('error'), err.response?.data?.message || 'Failed'); }
        finally { setSubmitting(false); }
    };

    return (
        <FormScreen title={t('newFdr')} subtitle={t('recordFixedDeposit')} onBack={() => navigation.goBack()} submitLabel={t('submit')} onSubmit={submit} submitting={submitting}>
            <AppInput label={t('bankName')} placeholder={t('bankName')} value={bankName} onChangeText={setBankName} />
            <View style={styles.row}>
                <View style={styles.flex}><AppInput label={t('interestRate')} placeholder="6" value={interestRate} onChangeText={setInterestRate} keyboardType="decimal-pad" /></View>
                <View style={styles.flex}><AppInput label={t('tenure')} placeholder="12" value={tenure} onChangeText={setTenure} keyboardType="number-pad" /></View>
            </View>
            <AppInput label={t('maturityAmount')} placeholder="0.00" value={maturityAmount} onChangeText={setMaturityAmount} keyboardType="decimal-pad" />
        </FormScreen>
    );
}

const styles = StyleSheet.create({ row: { flexDirection: 'row', gap: spacing.md }, flex: { flex: 1 } });
