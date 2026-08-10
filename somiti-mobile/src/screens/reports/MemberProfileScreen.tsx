import React from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { ScreenHeader } from '../../components/ui';
import { getCurrencySymbol } from '../../hooks/useSomiti';
import { useLanguage } from '../../i18n/LanguageContext';
import { colors, shadows, spacing } from '../../theme';

export default function MemberProfileScreen({ route, navigation }: any) {
    const { t } = useLanguage();
    const p = route.params?.profile || {};
    const cs = getCurrencySymbol();

    const rows = [
        [t('totalSavings'), `${cs}${Number(p.total_savings || 0).toLocaleString()}`, colors.success],
        [t('shareCount'), `${p.share_count || 0}`, colors.primary],
        [t('shareValue'), `${cs}${Number(p.share_value || 0).toLocaleString()}`, colors.primary],
        [t('loanOutstanding'), `${cs}${Number(p.loan_outstanding || 0).toLocaleString()}`, colors.danger],
        [t('dividendsReceived'), `${cs}${Number(p.dividends_received || 0).toLocaleString()}`, colors.warning],
        [t('dueMonths'), `${p.dues?.due_count || 0}`, colors.warning],
        [t('overdueMonths'), `${p.dues?.overdue_count || 0}`, p.dues?.overdue_count > 0 ? colors.danger : colors.textMuted],
    ];

    return (
        <>
            <ScreenHeader title={p.member?.name || t('memberProfile')} onBack={() => navigation.goBack()} />
            <ScrollView style={styles.container} contentContainerStyle={styles.content}>
                <View style={styles.hero}>
                    <Text style={styles.heroLabel}>{t('netWorth')}</Text>
                    <Text style={[styles.heroValue, { color: (p.net_worth || 0) >= 0 ? colors.success : colors.danger }]}>{cs}{Number(p.net_worth || 0).toLocaleString()}</Text>
                    <Text style={styles.role}>{p.role?.toUpperCase()}{p.joined_at ? ` • ${t('joinedOn')} ${p.joined_at}` : ''}</Text>
                </View>

                <View style={styles.card}>
                    {rows.map(([label, value, color]) => (
                        <View key={label as string} style={styles.row}>
                            <Text style={styles.label}>{label}</Text>
                            <Text style={[styles.value, { color }]}>{value}</Text>
                        </View>
                    ))}
                </View>

                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>{t('duesSummary')}</Text>
                    <View style={styles.row}>
                        <Text style={styles.label}>{t('expected')}</Text>
                        <Text style={styles.value}>{cs}{Number(p.dues?.total_expected || 0).toLocaleString()}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>{t('paid')}</Text>
                        <Text style={[styles.value, { color: colors.success }]}>{cs}{Number(p.dues?.total_paid || 0).toLocaleString()}</Text>
                    </View>
                </View>

                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>{t('recentTransactions')}</Text>
                    {(p.transactions || []).length === 0 && <Text style={styles.empty}>{t('noTransactions')}</Text>}
                    {(p.transactions || []).map((tx: any, i: number) => (
                        <View key={i} style={styles.row}>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.label}>{tx.label}</Text>
                                <Text style={styles.txDate}>{tx.date}</Text>
                            </View>
                            <Text style={[styles.value, { color: tx.type === 'loan' ? colors.danger : colors.success }]}>
                                {tx.type === 'loan' ? '−' : '+'}{cs}{Number(tx.amount).toLocaleString()}
                            </Text>
                        </View>
                    ))}
                </View>
            </ScrollView>
        </>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.bg },
    content: { padding: spacing.lg, gap: spacing.lg },
    hero: { backgroundColor: colors.surface, borderRadius: 20, padding: spacing.xl, alignItems: 'center', ...shadows.card },
    heroLabel: { fontSize: 13, color: colors.textMuted },
    heroValue: { fontSize: 32, fontWeight: '800', marginTop: 4 },
    role: { fontSize: 12, color: colors.textMuted, marginTop: 6 },
    card: { backgroundColor: colors.surface, borderRadius: 16, padding: spacing.lg, ...shadows.card },
    row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
    label: { fontSize: 14, color: colors.textSecondary },
    value: { fontSize: 14, fontWeight: '600', color: colors.text },
    sectionTitle: { fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: 4 },
    txDate: { fontSize: 11, color: colors.textMuted, marginTop: 1 },
    empty: { color: colors.textMuted, fontSize: 13, paddingVertical: 6 },
});
