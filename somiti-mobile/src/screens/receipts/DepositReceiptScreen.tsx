import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Share } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import client from '../../api/client';
import { ErrorState } from '../../components/ui';
import { useLanguage } from '../../i18n/LanguageContext';
import { colors, radius, shadows, spacing, typography } from '../../theme';

export default function DepositReceiptScreen({ route, navigation }: any) {
    const { t } = useLanguage();
    const { somitiId, depositId } = route.params || {};
    const [data, setData] = useState<any>(null);
    const [error, setError] = useState(false);

    const load = async () => {
        setError(false); setData(null);
        try { const { data: d } = await client.get(`/somitis/${somitiId}/receipts/deposit/${depositId}`); setData(d); }
        catch { setError(true); }
    };
    useEffect(() => { load(); }, [somitiId, depositId]);

    if (error) return <View style={styles.centerFull}><ErrorState onRetry={load} /></View>;
    if (!data) return <View style={styles.centerFull}><ActivityIndicator size="large" color={colors.primary} /></View>;

    const { somiti, deposit } = data;
    const symbol = somiti.currency_symbol || '$';

    const shareReceipt = async () => {
        try {
            await Share.share({
                message: `${somiti.receipt_header || somiti.name}\n\nDeposit Receipt #${deposit.id}\nAmount: ${symbol}${Number(deposit.amount).toLocaleString()}\nDate: ${new Date(deposit.created_at).toLocaleDateString()}\nStatus: ${deposit.status}\n\n${somiti.receipt_footer || ''}`,
            });
        } catch {}
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <View style={styles.topBar}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.topBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <Ionicons name="chevron-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={styles.topTitle}>{t('receipt')}</Text>
                <TouchableOpacity onPress={shareReceipt} style={styles.topBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <Ionicons name="share-outline" size={22} color={colors.primary} />
                </TouchableOpacity>
            </View>

            <View style={styles.receipt}>
                <View style={styles.logoRow}>
                    <View style={styles.logoBadge}><Ionicons name="people" size={22} color={colors.textOnPrimary} /></View>
                    <Text style={styles.title}>{somiti.name}</Text>
                </View>
                {!!somiti.receipt_header && <Text style={styles.headerText}>{somiti.receipt_header}</Text>}
                <Text style={styles.subtitle}>{somiti.unique_code}</Text>
                {!!somiti.address && <Text style={styles.meta}>{somiti.address}</Text>}
                {!!somiti.phone && <Text style={styles.meta}>{somiti.phone}</Text>}

                <View style={styles.divider} />
                <Text style={styles.receiptLabel}>{t('depositReceipt')}</Text>
                <Row label={`${t('receipt')} #`} value={`#${deposit.id}`} />
                <Row label={t('member')} value={deposit.user?.name} />
                <Row label={t('amount')} value={`${symbol}${Number(deposit.amount).toLocaleString()}`} strong />
                <Row label={t('type')} value={deposit.type || '-'} />
                <Row label={t('date')} value={new Date(deposit.created_at).toLocaleDateString()} />
                <Row label={t('status')} value={deposit.status.toUpperCase()} highlight={deposit.status === 'approved' ? colors.success : colors.warning} />
                {!!deposit.approver && <Row label={t('approvedBy')} value={deposit.approver.name} />}

                <View style={styles.divider} />
                {!!somiti.receipt_footer && <Text style={styles.footer}>{somiti.receipt_footer}</Text>}
                <Text style={styles.thanks}>{t('thankYou')}!</Text>
            </View>
        </ScrollView>
    );
}

function Row({ label, value, strong, highlight }: any) {
    return (
        <View style={styles.row}>
            <Text style={styles.label}>{label}</Text>
            <Text style={[styles.value, strong && styles.strong, highlight && { color: highlight }]}>{value}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.bg },
    content: { paddingBottom: spacing.xxl },
    centerFull: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.bg },
    topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.lg, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border },
    topBtn: { width: 34, alignItems: 'center' },
    topTitle: { ...typography.h3, color: colors.text },
    receipt: { backgroundColor: colors.surface, margin: spacing.lg, borderRadius: radius.lg, padding: spacing.xxl, ...shadows.card },
    logoRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, marginBottom: spacing.sm },
    logoBadge: { width: 36, height: 36, borderRadius: radius.md, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
    headerText: { textAlign: 'center', fontSize: 13, color: colors.textSecondary, marginBottom: spacing.sm },
    title: { textAlign: 'center', fontSize: 22, fontWeight: '700', color: colors.text },
    subtitle: { textAlign: 'center', fontSize: 13, color: colors.textMuted, marginTop: 4 },
    meta: { textAlign: 'center', fontSize: 12, color: colors.textMuted, marginTop: 2 },
    divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.lg },
    receiptLabel: { textAlign: 'center', fontSize: 12, fontWeight: '700', color: colors.primary, letterSpacing: 2, marginBottom: spacing.lg },
    row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.sm },
    label: { fontSize: 14, color: colors.textSecondary },
    value: { fontSize: 14, fontWeight: '600', color: colors.text },
    strong: { fontSize: 16, fontWeight: '700' },
    footer: { textAlign: 'center', fontSize: 12, color: colors.textSecondary, marginBottom: spacing.md },
    thanks: { textAlign: 'center', fontSize: 14, fontWeight: '600', color: colors.primary },
});