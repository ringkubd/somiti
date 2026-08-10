import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import client from '../../api/client';
import { FormScreen, AppInput } from '../../components/ui';
import { useLanguage } from '../../i18n/LanguageContext';
import { colors, spacing, typography } from '../../theme';

export default function SomitiSettingsScreen({ route, navigation }: any) {
    const { t } = useLanguage();
    const somitiId = route.params?.id;
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState<any>({});

    useEffect(() => {
        (async () => {
            try {
                const { data } = await client.get(`/somitis/${somitiId}/settings`);
                setForm(data);
            } catch (err: any) { Alert.alert(t('error'), err.response?.data?.message || 'Failed'); }
            finally { setLoading(false); }
        })();
    }, [somitiId]);

    const set = (key: string, value: any) => setForm((f: any) => ({ ...f, [key]: value }));

    const save = async () => {
        setSaving(true);
        try {
            await client.put(`/somitis/${somitiId}/settings`, {
                currency: form.currency, currency_symbol: form.currency_symbol, receipt_header: form.receipt_header, receipt_footer: form.receipt_footer,
                phone: form.phone, address: form.address, default_interest_rate: parseFloat(form.default_interest_rate) || 0,
                total_shares: parseInt(form.total_shares) || 0, min_share_per_member: parseInt(form.min_share_per_member) || 0, max_share_per_member: parseInt(form.max_share_per_member) || 0,
                loan_penalty_rate: parseFloat(form.loan_penalty_rate) || 0, loan_grace_days: parseInt(form.loan_grace_days) || 0,
            });
            Alert.alert(t('done'), t('settingsSaved'));
        } catch (err: any) { Alert.alert(t('error'), err.response?.data?.message || 'Failed'); }
        finally { setSaving(false); }
    };

    if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View>;

    return (
        <FormScreen title={t('somitiSettings')} subtitle={t('configureYourCoop')} onBack={() => navigation.goBack()} submitLabel={t('saveSettings')} onSubmit={save} submitting={saving}>
            <Text style={styles.section}>{t('general')}</Text>
            <AppInput label={t('currencyCode')} placeholder={t('currencyCode')} value={form.currency || ''} onChangeText={(v) => set('currency', v)} />
            <AppInput label={t('currencySymbol')} placeholder={t('currencySymbol')} value={form.currency_symbol || ''} onChangeText={(v) => set('currency_symbol', v)} />
            <AppInput label={t('phone')} placeholder={t('phone')} value={form.phone || ''} onChangeText={(v) => set('phone', v)} keyboardType="phone-pad" />
            <AppInput label={t('address')} placeholder={t('address')} value={form.address || ''} onChangeText={(v) => set('address', v)} multiline />

            <Text style={styles.section}>{t('receipt')}</Text>
            <AppInput label={t('receiptHeader')} placeholder={t('receiptHeader')} value={form.receipt_header || ''} onChangeText={(v) => set('receipt_header', v)} multiline />
            <AppInput label={t('receiptFooter')} placeholder={t('receiptFooter')} value={form.receipt_footer || ''} onChangeText={(v) => set('receipt_footer', v)} multiline />

            <Text style={styles.section}>{t('sharesAndLoans')}</Text>
            <AppInput label={t('totalShares')} placeholder={t('totalShares')} value={String(form.total_shares ?? '')} onChangeText={(v) => set('total_shares', v)} keyboardType="number-pad" />
            <AppInput label={t('minSharePerMember')} placeholder={t('minSharePerMember')} value={String(form.min_share_per_member ?? '')} onChangeText={(v) => set('min_share_per_member', v)} keyboardType="number-pad" />
            <AppInput label={t('maxSharePerMember')} placeholder={t('maxSharePerMember')} value={String(form.max_share_per_member ?? '')} onChangeText={(v) => set('max_share_per_member', v)} keyboardType="number-pad" />
            <AppInput label={t('defaultInterestRate')} placeholder={t('defaultInterestRate')} value={String(form.default_interest_rate ?? '')} onChangeText={(v) => set('default_interest_rate', v)} keyboardType="decimal-pad" />
            <AppInput label={t('loanPenaltyRate')} placeholder={t('loanPenaltyRate')} value={String(form.loan_penalty_rate ?? '')} onChangeText={(v) => set('loan_penalty_rate', v)} keyboardType="decimal-pad" />
            <AppInput label={t('loanGraceDays')} placeholder={t('loanGraceDays')} value={String(form.loan_grace_days ?? '')} onChangeText={(v) => set('loan_grace_days', v)} keyboardType="number-pad" />
        </FormScreen>
    );
}

const styles = StyleSheet.create({
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.bg },
    section: { ...typography.label, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: spacing.lg, marginBottom: spacing.sm },
});
