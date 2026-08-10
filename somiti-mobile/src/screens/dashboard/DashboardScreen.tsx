import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, RefreshControl, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import client from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import { StatCard, EmptyState } from '../../components/Shared';
import { colors, gradients, radius, shadows, spacing, typography } from '../../theme';
import { useLanguage } from '../../i18n/LanguageContext';
import { useFormatMoney } from '../../i18n/format';
import AdBanner from '../../ads/AdBanner';

interface QuickAction { labelKey: string; screen: string; icon: keyof typeof Ionicons.glyphMap; color: string; gradient: readonly [string, string]; }

const quickActions: QuickAction[] = [
    { labelKey: 'investments', screen: 'InvestmentsList', icon: 'trending-up-outline', color: colors.cyan, gradient: gradients.primary },
    { labelKey: 'fdrs', screen: 'FdrsList', icon: 'document-text-outline', color: colors.teal, gradient: gradients.success },
    { labelKey: 'bankAccounts', screen: 'BankAccountsList', icon: 'card-outline', color: colors.teal, gradient: gradients.success },
    { labelKey: 'shares', screen: 'UserSharesList', icon: 'pie-chart-outline', color: colors.warning, gradient: gradients.warning },
    { labelKey: 'transfers', screen: 'ShareTransfersList', icon: 'swap-horizontal-outline', color: colors.pink, gradient: gradients.warning },
    { labelKey: 'approvals', screen: 'ApprovalsList', icon: 'checkmark-done-outline', color: colors.success, gradient: gradients.success },
    { labelKey: 'members', screen: 'MembersList', icon: 'people-outline', color: colors.indigo, gradient: gradients.violet },
];

const primaryActions = [
    { labelKey: 'deposit', screen: 'DepositCreate', icon: 'add-circle-outline' as const, color: colors.success },
    { labelKey: 'loan', screen: 'LoanCreate', icon: 'business-outline' as const, color: colors.violet },
    { labelKey: 'payDues', screen: 'MyDues', icon: 'calendar-outline' as const, color: colors.warning },
    { labelKey: 'withdraw', screen: 'WithdrawalCreate', icon: 'arrow-down-circle-outline' as const, color: colors.danger },
];

export default function DashboardScreen({ navigation }: any) {
    const user = useAuthStore((s) => s.user);
    const [somiti, setSomiti] = useState<any>(null);
    const [data, setData] = useState<any>(null);
    const [refreshing, setRefreshing] = useState(false);
    const { t } = useLanguage();
    const money = useFormatMoney();

    const fetchDashboard = async () => {
        try {
            const { data } = await client.get('/dashboard');
            setSomiti(data.selected_somiti);
            setData(data);
        } catch {}
    };

    useEffect(() => { fetchDashboard(); }, []);
    const onRefresh = async () => { setRefreshing(true); await fetchDashboard(); setRefreshing(false); };

    const firstName = (user?.name || 'Welcome').split(' ')[0];
    const stats = data?.stats;
    const fund = data?.fund;
    const dues = data?.dues;
    const currency = somiti?.currency || 'USD';
    const symbol = somiti?.currency_symbol || '$';

    const alloc = fund ? [
        { label: t('cash'), value: fund.cash, color: '#16A34A' },
        { label: t('bank'), value: fund.bank, color: '#2563EB' },
        { label: t('invested'), value: fund.invested, color: '#D97706' },
        { label: t('loans'), value: fund.loans_outstanding, color: '#DC2626' },
    ] : [];
    const totalFund = fund?.total_fund || stats?.net_fund || 0;
    const pct = (v: number) => totalFund > 0 ? Math.round((v / totalFund) * 100) : 0;

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
            {!somiti ? (
                <EmptyStateWrap navigation={navigation} t={t} />
            ) : (
                <>
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.headerLeft}>
                            <Text style={styles.greeting}>{t('greeting')}, {firstName}</Text>
                            <Text style={styles.heroTitle}>{somiti?.name}</Text>
                        </View>
                        <TouchableOpacity style={styles.bell} onPress={() => navigation.navigate('More', { screen: 'NotificationsFromMore' })}>
                            <Ionicons name="notifications-outline" size={20} color={colors.primary} />
                            {dues?.overdue_count > 0 && <View style={styles.bellDot} />}
                        </TouchableOpacity>
                    </View>

                    {/* Fund card */}
                    <View style={styles.fundCard}>
                        <View style={styles.fundTop}>
                            <Text style={styles.fundLabel}>{t('totalFund')}</Text>
                            <View style={styles.liveBadge}>
                                <View style={styles.liveDot} />
                                <Text style={styles.liveText}>LIVE</Text>
                            </View>
                        </View>
                        <Text style={styles.fundValue}>{money(totalFund, currency, symbol)}</Text>
                        <View style={styles.fundPills}>
                            <View style={styles.fundPill}>
                                <Ionicons name="people-outline" size={14} color={colors.primary} />
                                <Text style={styles.fundPillText}>{stats?.total_members || 0} {t('members')}</Text>
                            </View>
                            <View style={styles.fundPill}>
                                <Ionicons name="pie-chart-outline" size={14} color={colors.violet} />
                                <Text style={styles.fundPillText}>{fund?.deployment_rate || 0}% {t('deployed')}</Text>
                            </View>
                        </View>
                    </View>

                    <TouchableOpacity style={styles.managerChip} onPress={() => navigation.navigate('Transactions', { screen: 'Managers' })}>
                        <Ionicons name="briefcase-outline" size={14} color={colors.primary} />
                        <Text style={styles.managerChipText}>
                            {data?.manager ? `${t('manager')}: ${data.manager.name}` : `${t('setManager')} →`}
                        </Text>
                    </TouchableOpacity>

                    {/* Primary actions */}
                    <View style={styles.primaryRow}>
                        {primaryActions.map((a) => (
                            <TouchableOpacity key={a.screen} style={styles.primaryAction} onPress={() => navigation.navigate('Transactions', { screen: a.screen })}>
                                <View style={[styles.primaryIcon, { backgroundColor: a.color + '18' }]}>
                                    <Ionicons name={a.icon} size={22} color={a.color} />
                                </View>
                                <Text style={styles.primaryLabel}>{t(a.labelKey)}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Fund allocation */}
                    <View style={styles.allocCard}>
                        <View style={styles.allocHeader}>
                            <Text style={styles.cardTitle}>{t('fundAllocation')}</Text>
                            <Text style={styles.allocSub}>{t('whereMoneyIs')}</Text>
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
                    </View>

                    {/* Dues alert */}
                    {(dues?.overdue_count > 0 || dues?.due_count > 0) && (
                        <TouchableOpacity style={[styles.duesCard, { backgroundColor: dues.overdue_count > 0 ? colors.danger + '12' : colors.warning + '14' }]}
                            onPress={() => navigation.navigate('Transactions', { screen: 'MyDues' })}>
                            <Ionicons name="alert-circle-outline" size={22} color={dues.overdue_count > 0 ? colors.danger : colors.warning} />
                            <View style={{ flex: 1, marginLeft: spacing.md }}>
                                <Text style={[styles.duesTitle, { color: dues.overdue_count > 0 ? colors.danger : colors.warning }]}>
                                    {dues.overdue_count > 0 ? `${dues.overdue_count} ${t('overdueMonths')}` : `${dues.due_count} ${t('dueMonths')}`}
                                </Text>
                                <Text style={styles.duesSub}>{t('collected')} {money(dues?.paid, currency, symbol)} {t('of')} {money(dues?.expected, currency, symbol)}</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
                        </TouchableOpacity>
                    )}

                    <View style={styles.statsGrid}>
                        <View style={styles.statsRow}>
                            <StatCard label={t('savings')} value={stats?.total_savings} color={colors.success} currency={symbol} />
                            <StatCard label={t('loans')} value={stats?.total_loans} color={colors.danger} currency={symbol} />
                        </View>
                        <View style={styles.statsRow}>
                            <StatCard label={t('shareCapital')} value={stats?.share_capital} color={colors.violet} currency={symbol} />
                            <StatCard label={t('invested')} value={fund?.invested} color={colors.warning} currency={symbol} />
                        </View>
                    </View>

                    <Text style={styles.sectionTitle}>{t('quickActions')}</Text>
                    <View style={styles.grid}>
                        {quickActions.map((item) => (
                            <TouchableOpacity key={item.screen} style={styles.actionCard}
                                onPress={() => navigation.navigate('Transactions', { screen: item.screen })}>
                                <LinearGradient colors={item.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.actionIcon}>
                                    <Ionicons name={item.icon} size={20} color={colors.textOnPrimary} />
                                </LinearGradient>
                                <Text style={styles.actionLabel} numberOfLines={2}>{t(item.labelKey)}</Text>
                            </TouchableOpacity>
                        ))}
                        <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('More')}>
                            <LinearGradient colors={gradients.violet} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.actionIcon}>
                                <Ionicons name="ellipsis-horizontal" size={20} color={colors.textOnPrimary} />
                            </LinearGradient>
                            <Text style={styles.actionLabel}>{t('tabs.more')}</Text>
                        </TouchableOpacity>
                    </View>
                    <AdBanner />
                    <View style={{ height: spacing.xxl }} />
                </>
            )}
        </ScrollView>
    );
}

function EmptyStateWrap({ navigation, t }: any) {
    return (
        <View style={styles.emptyWrap}>
            <EmptyState
                icon="business-outline"
                message={t('noSomiti')}
                action={t('createSomiti')}
                onAction={() => navigation.navigate('More', { screen: 'CreateSomitiFromDash' })}
            />
            <TouchableOpacity style={styles.joinBtn} onPress={() => navigation.navigate('More', { screen: 'JoinSomitiFromDash' })}>
                <Text style={styles.joinBtnText}>{t('joinWithCode')}</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.bg },
    content: { paddingBottom: 140 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.xl, paddingTop: spacing.xl },
    headerLeft: { flex: 1 },
    greeting: { ...typography.caption, color: colors.textMuted },
    heroTitle: { ...typography.h2, color: colors.text, marginTop: 2 },
    bell: { width: 40, height: 40, borderRadius: radius.full, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
    bellDot: { position: 'absolute', top: 9, right: 9, width: 8, height: 8, borderRadius: 4, backgroundColor: colors.danger, borderWidth: 1.5, borderColor: colors.surface },
    fundCard: {
        backgroundColor: colors.surface, borderRadius: radius.xl, margin: spacing.lg,
        marginTop: spacing.lg, padding: spacing.xl, borderTopWidth: 4, borderTopColor: colors.primary, ...shadows.card,
    },
    fundTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%' },
    fundLabel: { ...typography.label, color: colors.textMuted, letterSpacing: 1.5 },
    fundValue: { ...typography.h1, color: colors.text, marginTop: spacing.sm, fontSize: 30, alignSelf: 'flex-start' },
    liveBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: colors.success + '14', borderRadius: radius.full, paddingHorizontal: 10, paddingVertical: 4 },
    liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.success },
    liveText: { fontSize: 10, fontWeight: '700', color: colors.success, letterSpacing: 0.5 },
    fundPills: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
    fundPill: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: colors.bg, borderRadius: radius.full, paddingHorizontal: 12, paddingVertical: 6 },
    fundPillText: { fontSize: 12, fontWeight: '600', color: colors.textSecondary },
    managerChip: {
        flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: 6,
        borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface,
        borderRadius: radius.full, paddingHorizontal: 14, paddingVertical: 8, marginHorizontal: spacing.lg, marginTop: spacing.sm,
    },
    managerChipText: { color: colors.primary, fontSize: 12, fontWeight: '600' },
    primaryRow: { flexDirection: 'row', margin: spacing.lg, marginBottom: 0, gap: spacing.sm },
    primaryAction: { flex: 1, backgroundColor: colors.surface, borderRadius: radius.lg, paddingVertical: spacing.md, alignItems: 'center', ...shadows.card },
    primaryIcon: { width: 42, height: 42, borderRadius: radius.full, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
    primaryLabel: { fontSize: 11, fontWeight: '600', color: colors.text },
    allocCard: { backgroundColor: colors.surface, borderRadius: radius.xl, margin: spacing.lg, marginBottom: 0, padding: spacing.lg, ...shadows.card },
    allocHeader: { marginBottom: spacing.md },
    cardTitle: { ...typography.h3, color: colors.text },
    allocSub: { ...typography.caption, color: colors.textMuted },
    allocationBar: { flexDirection: 'row', height: 14, borderRadius: 7, overflow: 'hidden' },
    legend: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, marginTop: spacing.md },
    legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    legendDot: { width: 10, height: 10, borderRadius: 5 },
    legendText: { fontSize: 12, color: colors.textSecondary },
    duesCard: { flexDirection: 'row', alignItems: 'center', margin: spacing.lg, marginBottom: 0, borderRadius: radius.lg, padding: spacing.lg },
    duesTitle: { ...typography.bodyMedium, fontWeight: '700' },
    duesSub: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
    statsGrid: { padding: spacing.lg, paddingBottom: 0 },
    statsRow: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.md },
    sectionTitle: { ...typography.h3, color: colors.text, paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.sm },
    grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: spacing.lg, gap: spacing.sm },
    actionCard: { width: '31.5%', backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md, alignItems: 'center', ...shadows.card },
    actionIcon: { width: 40, height: 40, borderRadius: radius.full, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
    actionLabel: { fontSize: 11, fontWeight: '600', color: colors.text, textAlign: 'center' },
    emptyWrap: { flex: 1, justifyContent: 'center', padding: spacing.xl, minHeight: 400 },
    joinBtn: { borderWidth: 1, borderColor: colors.primary, borderRadius: radius.md, padding: spacing.md, alignItems: 'center', marginTop: spacing.md },
    joinBtnText: { color: colors.primary, fontWeight: '600' },
});
