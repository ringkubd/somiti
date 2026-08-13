import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import client from '../../api/client';
import { ScreenHeader, ErrorState, SkeletonList, AppCard } from '../../components/ui';
import { useLanguage } from '../../i18n/LanguageContext';
import { getCurrencySymbol } from '../../hooks/useSomiti';
import { useSomiti } from '../../hooks/useSomiti';
import { colors, spacing, typography } from '../../theme';

export default function ReportsTrialBalanceScreen({ navigation }: any) {
    const { t } = useLanguage();
    const { somitiId } = useSomiti();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const load = async () => {
        setLoading(true); setError(false);
        if (!somitiId) { setError(true); setLoading(false); return; }
        try { const { data: d } = await client.get('/reports/trial-balance', { params: { somiti_id: somitiId } }); setData(d); }
        catch { setError(true); }
        finally { setLoading(false); }
    };
    React.useEffect(() => { load(); }, [somitiId]);

    const cs = getCurrencySymbol();

    return (
        <>
            <ScreenHeader title={t('trialBalance')} onBack={() => navigation.goBack()} />
            {loading ? <SkeletonList count={3} rows={2} /> : error ? <ErrorState onRetry={load} /> : (
                <ScrollView style={styles.container} contentContainerStyle={styles.content}>
                    <AppCard style={styles.summaryCard}>
                        <Text style={[styles.balance, { color: data?.summary?.is_balanced ? colors.success : colors.danger }]}>
                            {data?.summary?.is_balanced ? `✓ ${t('balanced')}` : `✗ ${t('unbalanced')}`}
                        </Text>
                        <View style={styles.summaryRow}>
                            <View style={styles.summaryItem}>
                                <Text style={styles.summaryLabel}>{t('totalDebit')}</Text>
                                <Text style={styles.summaryValue}>{cs}{data?.summary?.total_debit?.toLocaleString()}</Text>
                            </View>
                            <View style={styles.summaryItem}>
                                <Text style={styles.summaryLabel}>{t('totalCredit')}</Text>
                                <Text style={styles.summaryValue}>{cs}{data?.summary?.total_credit?.toLocaleString()}</Text>
                            </View>
                        </View>
                    </AppCard>

                    {(data?.accounts || []).map((acc: any, i: number) => (
                        <AppCard key={i} style={styles.rowCard}>
                            <View style={styles.rowText}>
                                <Text style={styles.acctName}>{acc.name}</Text>
                                <Text style={styles.acctType}>{acc.type} • {acc.code}</Text>
                            </View>
                            <View style={styles.rowBalance}>
                                <Text style={styles.acctBalance}>{cs}{acc.balance?.toLocaleString()}</Text>
                                <Text style={styles.acctDetail}>D:{cs}{acc.debit} C:{cs}{acc.credit}</Text>
                            </View>
                        </AppCard>
                    ))}
                    <View style={{ height: spacing.xxl }} />
                </ScrollView>
            )}
        </>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.bg },
    content: { padding: spacing.lg },
    summaryCard: { backgroundColor: colors.primary, marginBottom: spacing.md },
    balance: { ...typography.h2, color: colors.textOnPrimary, textAlign: 'center', marginBottom: spacing.md },
    summaryRow: { flexDirection: 'row', gap: spacing.md },
    summaryItem: { flex: 1, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 12, padding: spacing.md, alignItems: 'center' },
    summaryLabel: { ...typography.caption, color: colors.primaryLight },
    summaryValue: { ...typography.bodyMedium, color: colors.textOnPrimary, marginTop: 2 },
    rowCard: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
    rowText: { flex: 1 },
    acctName: { ...typography.bodyMedium, color: colors.text },
    acctType: { ...typography.bodySmall, color: colors.textMuted, marginTop: 2 },
    rowBalance: { alignItems: 'flex-end' },
    acctBalance: { ...typography.bodyMedium, color: colors.text, fontWeight: '700' },
    acctDetail: { ...typography.caption, color: colors.textMuted, fontWeight: '400' },
});
