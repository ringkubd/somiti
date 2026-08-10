import React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import client from '../../api/client';
import { ScreenHeader, ErrorState, SkeletonList } from '../../components/ui';
import { StatCard } from '../../components/Shared';
import { useSomiti, getCurrencySymbol } from '../../hooks/useSomiti';
import { useLanguage } from '../../i18n/LanguageContext';
import { colors, shadows, spacing } from '../../theme';

export default function PortfolioScreen({ navigation }: any) {
    const { t } = useLanguage();
    const { somitiId } = useSomiti();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const load = async () => {
        if (!somitiId) return;
        setLoading(true); setError(false);
        try { const { data: d } = await client.get(`/somitis/${somitiId}/reports/portfolio`); setData(d); }
        catch { setError(true); }
        finally { setLoading(false); }
    };
    useEffect(() => { load(); }, [somitiId]);

    const cs = getCurrencySymbol();
    const total = data?.total_fund || 0;
    const pct = (v: number) => total > 0 ? Math.round((v / total) * 100) : 0;
    const alloc = data ? [
        { label: t('cash'), value: data.cash, color: '#16A34A' },
        { label: t('bank'), value: data.bank, color: '#2563EB' },
        { label: t('invested'), value: data.invested, color: '#D97706' },
        { label: t('loans'), value: data.loans_outstanding, color: '#DC2626' },
    ] : [];

    return (
        <>
            <ScreenHeader title={t('fundPortfolio')} onBack={() => navigation.goBack()} />
            {loading ? <SkeletonList count={2} rows={1} /> : error ? <ErrorState onRetry={load} /> : (
                <ScrollView style={styles.container} contentContainerStyle={styles.content}>
                    <View style={styles.hero}>
                        <Text style={styles.heroLabel}>{t('totalFund')}</Text>
                        <Text style={styles.heroValue}>{cs}{Number(total).toLocaleString()}</Text>
                        <View style={styles.deployBadge}>
                            <Text style={styles.deployText}>{data?.deployment_rate || 0}% {t('deployed')}</Text>
                        </View>
                    </View>

                    <View style={styles.allocationBar}>
                        {alloc.filter(a => a.value > 0).map(a => (
                            <View key={a.label} style={{ flex: Math.max(pct(a.value), 1), backgroundColor: a.color, minWidth: 4 }} />
                        ))}
                    </View>
                    <View style={styles.legend}>
                        {alloc.map(a => (
                            <View key={a.label} style={styles.legendItem}>
                                <View style={[styles.legendDot, { backgroundColor: a.color }]} />
                                <Text style={styles.legendText}>{a.label} {pct(a.value)}%</Text>
                            </View>
                        ))}
                    </View>

                    <View style={styles.statsRow}>
                        <StatCard label={t('cash')} value={data?.cash} color="#16A34A" currency={cs} />
                        <StatCard label={t('bank')} value={data?.bank} color="#2563EB" currency={cs} />
                    </View>
                    <View style={styles.statsRow}>
                        <StatCard label={t('invested')} value={data?.invested} color="#D97706" currency={cs} />
                        <StatCard label={t('loansOut')} value={data?.loans_outstanding} color="#DC2626" currency={cs} />
                    </View>

                    <Text style={styles.sectionTitle}>{t('investments')} ({data?.investments?.length || 0})</Text>
                    <View style={styles.card}>
                        {(data?.investments || []).map((i: any) => (
                            <View key={i.id} style={styles.row}>
                                <Text style={styles.label}>{i.type}{i.maturity_date ? ` • ${i.maturity_date}` : ''}</Text>
                                <Text style={styles.value}>{cs}{Number(i.amount).toLocaleString()}</Text>
                            </View>
                        ))}
                        {!data?.investments?.length && <Text style={styles.empty}>{t('noInvestments')}</Text>}
                    </View>

                    <Text style={styles.sectionTitle}>{t('fdrs')} ({data?.fdrs?.length || 0})</Text>
                    <View style={styles.card}>
                        {(data?.fdrs || []).map((f: any) => (
                            <View key={f.id} style={styles.row}>
                                <Text style={styles.label}>{f.bank_name} • {f.interest_rate}% • {f.tenure_months}mo</Text>
                                <Text style={styles.value}>{cs}{Number(f.maturity_amount).toLocaleString()}</Text>
                            </View>
                        ))}
                        {!data?.fdrs?.length && <Text style={styles.empty}>{t('noFdrs')}</Text>}
                    </View>
                    <View style={{ height: spacing.xxl }} />
                </ScrollView>
            )}
        </>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.bg },
    content: { padding: spacing.lg, gap: spacing.md },
    hero: { backgroundColor: colors.surface, borderRadius: 20, padding: spacing.xl, alignItems: 'center', ...shadows.card },
    heroLabel: { fontSize: 13, color: colors.textMuted },
    heroValue: { fontSize: 34, fontWeight: '800', color: colors.text, marginTop: 4 },
    deployBadge: { backgroundColor: colors.primary + '14', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 4, marginTop: 8 },
    deployText: { color: colors.primary, fontSize: 12, fontWeight: '700' },
    allocationBar: { flexDirection: 'row', height: 14, borderRadius: 7, overflow: 'hidden', marginTop: spacing.md },
    legend: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, marginTop: spacing.sm },
    legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    legendDot: { width: 10, height: 10, borderRadius: 5 },
    legendText: { fontSize: 12, color: colors.textSecondary },
    statsRow: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.md },
    sectionTitle: { fontSize: 15, fontWeight: '700', color: colors.text, marginTop: spacing.lg },
    card: { backgroundColor: colors.surface, borderRadius: 16, padding: spacing.lg, ...shadows.card },
    row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
    label: { fontSize: 13, color: colors.textSecondary, flex: 1 },
    value: { fontSize: 13, fontWeight: '600', color: colors.text },
    empty: { color: colors.textMuted, fontSize: 13, paddingVertical: 6 },
});
