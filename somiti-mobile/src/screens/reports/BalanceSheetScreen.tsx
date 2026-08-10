import React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import client from '../../api/client';
import { ScreenHeader, ErrorState, SkeletonList } from '../../components/ui';
import { useSomiti, getCurrencySymbol } from '../../hooks/useSomiti';
import { useLanguage } from '../../i18n/LanguageContext';
import { colors, shadows, spacing } from '../../theme';

interface Line { code: string; name: string; amount: number }

export default function BalanceSheetScreen({ navigation }: any) {
    const { t } = useLanguage();
    const { somitiId } = useSomiti();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const load = async () => {
        if (!somitiId) return;
        setLoading(true); setError(false);
        try { const { data: d } = await client.get(`/somitis/${somitiId}/reports/balance-sheet`); setData(d); }
        catch { setError(true); }
        finally { setLoading(false); }
    };
    useEffect(() => { load(); }, [somitiId]);

    const cs = getCurrencySymbol();

    const Section = ({ title, lines, total, color }: any) => (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>{title}</Text>
            {lines.map((l: Line) => (
                <View key={l.code} style={styles.row}>
                    <Text style={styles.label}>{l.name}</Text>
                    <Text style={styles.value}>{cs}{Number(l.amount).toLocaleString()}</Text>
                </View>
            ))}
            <View style={[styles.totalRow, { borderTopColor: color }]}>
                <Text style={[styles.totalLabel, { color }]}>{t('total')} {title}</Text>
                <Text style={[styles.totalValue, { color }]}>{cs}{Number(total).toLocaleString()}</Text>
            </View>
        </View>
    );

    return (
        <>
            <ScreenHeader title={t('balanceSheet')} onBack={() => navigation.goBack()} />
            {loading ? <SkeletonList count={3} rows={2} /> : error ? <ErrorState onRetry={load} /> : (
                <ScrollView style={styles.container} contentContainerStyle={styles.content}>
                    <View style={styles.badgeRow}>
                        <View style={[styles.badge, data?.balanced ? styles.badgeOk : styles.badgeBad]}>
                            <Text style={styles.badgeText}>{data?.balanced ? `✓ ${t('balanced')}` : `✗ ${t('unbalanced')}`}</Text>
                        </View>
                        <Text style={styles.asOf}>{t('asOf')} {data?.as_of}</Text>
                    </View>
                    <Section title={t('assets')} lines={data?.assets || []} total={data?.total_assets} color={colors.success} />
                    <Section title={t('liabilities')} lines={data?.liabilities || []} total={data?.total_liabilities} color={colors.warning} />
                    <Section title={t('equity')} lines={data?.equity || []} total={data?.total_equity} color={colors.violet} />
                    <View style={{ height: spacing.xxl }} />
                </ScrollView>
            )}
        </>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.bg },
    content: { padding: spacing.lg, gap: spacing.lg },
    badgeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    badge: { borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
    badgeOk: { backgroundColor: colors.success + '1A' },
    badgeBad: { backgroundColor: colors.danger + '1A' },
    badgeText: { fontSize: 12, fontWeight: '700', color: colors.success },
    asOf: { fontSize: 12, color: colors.textMuted },
    section: { backgroundColor: colors.surface, borderRadius: 16, padding: spacing.lg, ...shadows.card },
    sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: spacing.sm },
    row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
    label: { fontSize: 14, color: colors.textSecondary },
    value: { fontSize: 14, fontWeight: '600', color: colors.text },
    totalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 12, borderTopWidth: 2, marginTop: 4 },
    totalLabel: { fontSize: 14, fontWeight: '700' },
    totalValue: { fontSize: 15, fontWeight: '800' },
});
