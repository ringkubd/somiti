import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import client from '../../api/client';
import { useSomiti } from '../../hooks/useSomiti';
import { SelectField } from '../../components/SelectField';
import { FormScreen, AppInput } from '../../components/ui';
import { useLanguage } from '../../i18n/LanguageContext';
import { maybeShowInterstitial } from '../../ads/useInterstitial';
import { colors, radius, spacing, typography } from '../../theme';

const months = [
    { label: 'January', value: 'January' }, { label: 'February', value: 'February' },
    { label: 'March', value: 'March' }, { label: 'April', value: 'April' },
    { label: 'May', value: 'May' }, { label: 'June', value: 'June' },
    { label: 'July', value: 'July' }, { label: 'August', value: 'August' },
    { label: 'September', value: 'September' }, { label: 'October', value: 'October' },
    { label: 'November', value: 'November' }, { label: 'December', value: 'December' },
];

export default function DepositCreateScreen({ navigation }: any) {
    const { t } = useLanguage();
    const { somitiId } = useSomiti();
    const [amount, setAmount] = useState('');
    const [type, setType] = useState('monthly');
    const [month, setMonth] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const submit = async () => {
        if (!amount) { Alert.alert(t('error'), t('amount') + ' ' + t('required')); return; }
        setSubmitting(true);
        try {
            await client.post('/deposits', { somiti_id: somitiId, amount: parseFloat(amount), type, month: month || undefined });
            Alert.alert(t('done'), t('depositSubmitted'));
            navigation.goBack();
            maybeShowInterstitial();
        } catch (err: any) { Alert.alert(t('error'), err.response?.data?.message || 'Failed'); }
        finally { setSubmitting(false); }
    };

    return (
        <FormScreen title={t('newDeposit')} subtitle={t('addFundsToSavings')} onBack={() => navigation.goBack()} submitLabel={t('submitDeposit')} onSubmit={submit} submitting={submitting}>
            <AppInput label={t('amount')} placeholder="0.00" value={amount} onChangeText={setAmount} keyboardType="decimal-pad" />
            <View style={styles.row}>
                {['monthly', 'dps'].map(v => (
                    <TouchableOpacity key={v} style={[styles.typeBtn, type === v && styles.typeBtnActive]} onPress={() => setType(v)}>
                        <Text style={[styles.typeText, type === v && styles.typeTextActive]}>{v.toUpperCase()}</Text>
                    </TouchableOpacity>
                ))}
            </View>
            <SelectField label={t('month')} value={month} options={months} onSelect={setMonth} placeholder={t('selectMonth')} />
        </FormScreen>
    );
}

const styles = StyleSheet.create({
    row: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.lg },
    typeBtn: { flex: 1, padding: spacing.md, borderRadius: radius.md, borderWidth: 1.5, borderColor: colors.border, alignItems: 'center', backgroundColor: colors.surface },
    typeBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
    typeText: { ...typography.bodyMedium, color: colors.textSecondary },
    typeTextActive: { color: colors.textOnPrimary },
});
