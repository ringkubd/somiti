import React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import client from '../../api/client';
import { ScreenHeader, ErrorState, SkeletonList } from '../../components/ui';
import { useSomiti, getCurrencySymbol } from '../../hooks/useSomiti';
import { useLanguage } from '../../i18n/LanguageContext';
import { colors, shadows, spacing } from '../../theme';

export default function ProfitLossScreen({ navigation }: any) {
    const { t } = useLanguage();
    const { somitiId } = useSomiti();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const load = async () => {
        if (!somitiId) return;
        setLoading(true); setError(false);
        try { const { data: d } = await client.get(`/somitis/${somitiId}/reports/profit-loss`); setData(d); }
        catch { setError(true); }
        finally { setLoading(false); }
    };
    useEffect(() => { load(); }, [somitiId]);

    const cs = getCurrencySymbol();

    const Section = ({ title, lines, total, color }: any) => (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>{title}</Text>
            {lines.length === 0 && <Text style={styles.empty}>{t('noEntries')}</Text>}
            {lines.map((l: any) => (
                <View key={l.code} style={styles.row}>
                    <Text style={styles.label}>{l.name}</Text>
                    <Text style={[styles.value, { color: l.amount >= 0 ? colors.success : colors.danger }]}>{cs}{Number(l.amount).toLocaleString()}</Text>
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
            <ScreenHeader title={t('profitLoss')} onBack={() => navigation.goBack()} />
            {loading ? <SkeletonList count={3} rows={2} /> : error ? <ErrorState onRetry={load} /> : (
                <ScrollView style={styles.container} contentContainerStyle={styles.content}>
                    <Text style={styles.period}>{t('period')}: {data?.period}</Text>
                    <Section title={t('income')} lines={data?.income || []} total={data?.total_income} color={colors.success} />
                    <Section title={t('expenses')} lines={data?.expenses || []} total={data?.total_expenses} color={colors.danger} />
                    <View style={styles.netCard}>
                        <Text style={styles.netLabel}>{t('netProfit')}</Text>
                        <Text style={[styles.netValue, { color: (data?.net_profit || 0) >= 0 ? colors.success : colors.danger }]}>
                            {cs}{Number(data?.net_profit || 0).toLocaleString()}
                        </Text>
                    </View>
                    <View style={{ height: spacing.xxl }} />
                </ScrollView>
            )}
        </>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.bg },
    content: { padding: spacing.lg, gap: spacing.lg },
    period: { fontSize: 13, color: colors.textMuted },
    section: { backgroundColor: colors.surface, borderRadius: 16, padding: spacing.lg, ...shadows.card },
    sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: spacing.sm },
    empty: { color: colors.textMuted, fontSize: 13, paddingVertical: 8 },
    row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
    label: { fontSize: 14, color: colors.textSecondary },
    value: { fontSize: 14, fontWeight: '600' },
    totalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 12, borderTopWidth: 2, marginTop: 4 },
    totalLabel: { fontSize: 14, fontWeight: '700' },
    totalValue: { fontSize: 15, fontWeight: '800' },
    netCard: { backgroundColor: colors.surface, borderRadius: 16, padding: spacing.lg, alignItems: 'center', ...shadows.card },
    netLabel: { fontSize: 13, color: colors.textMuted },
    netValue: { fontSize: 28, fontWeight: '800', marginTop: 4 },
});
