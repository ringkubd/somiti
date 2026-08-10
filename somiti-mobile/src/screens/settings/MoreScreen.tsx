import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { useLanguage } from '../../i18n/LanguageContext';
import { colors, radius, shadows, spacing, typography } from '../../theme';

type IconName = keyof typeof Ionicons.glyphMap;

interface MenuItem {
    labelKey?: string;
    descKey?: string;
    label: string;
    desc?: string;
    icon: IconName;
    color: string;
    screen: string;
    params?: any;
}

const sections: { titleKey: string; items: MenuItem[] }[] = [
    {
        titleKey: 'management',
        items: [
            { labelKey: 'approvals', descKey: 'approvePending', label: 'Approvals', desc: 'Approve pending requests', icon: 'checkmark-done-outline', color: '#16A34A', screen: 'ApprovalsList' },
            { labelKey: 'members', descKey: 'manageCooperators', label: 'Members', desc: 'Manage cooperators', icon: 'people-outline', color: '#4F46E5', screen: 'MembersList' },
            { labelKey: 'managers', descKey: 'appointManagers', label: 'Managers', desc: 'Appoint & manage tenures', icon: 'briefcase-outline', color: '#2563EB', screen: 'Managers' },
            { labelKey: 'duesOverview', descKey: 'whoPaidWhoOwes', label: 'Dues Overview', desc: 'Who paid & who owes', icon: 'calendar-outline', color: '#D97706', screen: 'DuesOverview' },
            { labelKey: 'financialYears', descKey: 'activePastYears', label: 'Financial Years', desc: 'Active & past years', icon: 'calendar-outline', color: '#0891B2', screen: 'FinancialYearsList' },
        ],
    },
    {
        titleKey: 'reports',
        items: [
            { labelKey: 'summaryReport', descKey: 'overviewOfFinances', label: 'Summary Report', desc: 'Overview of finances', icon: 'stats-chart-outline', color: '#7C3AED', screen: 'ReportsSummary' },
            { labelKey: 'trialBalance', descKey: 'balancedLedgerView', label: 'Trial Balance', desc: 'Balanced ledger view', icon: 'scale-outline', color: '#0D9488', screen: 'ReportsTrialBalance' },
            { labelKey: 'balanceSheet', descKey: 'assetsEqLiabEquity', label: 'Balance Sheet', desc: 'Assets = liabilities + equity', icon: 'scale-outline', color: '#0D9488', screen: 'BalanceSheet' },
            { labelKey: 'fundPortfolio', descKey: 'whereMoneyIs', label: 'Fund Portfolio', desc: 'Where the money is', icon: 'pie-chart-outline', color: '#7C3AED', screen: 'Portfolio' },
            { labelKey: 'memberProfiles', descKey: 'financialSnapshot', label: 'Member Profiles', desc: 'Financial snapshot per member', icon: 'people-outline', color: '#4F46E5', screen: 'MemberProfiles' },
        ],
    },
    {
        titleKey: 'account',
        items: [
            { labelKey: 'profile', descKey: 'yourDetails', label: 'Profile', desc: 'Your details', icon: 'person-outline', color: '#2563EB', screen: 'ProfileFromMore' },
            { labelKey: 'notifications', descKey: 'pushNotifications', label: 'Notifications', desc: 'Push notifications', icon: 'notifications-outline', color: '#D97706', screen: 'NotificationsFromMore' },
            { labelKey: 'changePassword', descKey: 'updateYourPassword', label: 'Change Password', desc: 'Update your password', icon: 'key-outline', color: '#DC2626', screen: 'ChangePasswordFromMore' },
        ],
    },
];

export default function MoreScreen({ navigation }: any) {
    const { t } = useLanguage();
    const user = useAuthStore((s) => s.user);
    const logout = useAuthStore((s) => s.logout);

    const nav = (screen: string) => {
        // Screens registered in the Transactions stack
        const txScreens = ['MembersList', 'Managers', 'DuesOverview', 'BalanceSheet', 'Portfolio', 'MemberProfiles'];
        if (txScreens.includes(screen)) {
            navigation.navigate('Transactions', { screen });
        } else {
            navigation.navigate(screen);
        }
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <View style={styles.profileCard}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{user?.name?.charAt(0)?.toUpperCase() || '?'}</Text>
                </View>
                <View style={styles.profileInfo}>
                    <Text style={styles.name}>{user?.name || 'Member'}</Text>
                    <Text style={styles.email}>{user?.email || user?.phone || ''}</Text>
                </View>
                <TouchableOpacity onPress={() => navigation.navigate('ProfileFromMore')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <Ionicons name="chevron-forward" size={22} color={colors.textMuted} />
                </TouchableOpacity>
            </View>

            {sections.map((section) => (
                <View key={section.titleKey} style={styles.section}>
                    <Text style={styles.sectionTitle}>{t(section.titleKey)}</Text>
                    <View style={styles.group}>
                        {section.items.map((item) => (
                            <TouchableOpacity key={item.screen} style={styles.row} activeOpacity={0.7} onPress={() => nav(item.screen)}>
                                <View style={[styles.iconWrap, { backgroundColor: item.color + '1A' }]}>
                                    <Ionicons name={item.icon} size={20} color={item.color} />
                                </View>
                                <View style={styles.rowText}>
                                    <Text style={styles.rowLabel}>{t(item.labelKey || item.label)}</Text>
                                    {item.descKey ? <Text style={styles.rowDesc}>{t(item.descKey)}</Text> : item.desc ? <Text style={styles.rowDesc}>{item.desc}</Text> : null}
                                </View>
                                <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            ))}

            <TouchableOpacity style={styles.logout} activeOpacity={0.8} onPress={() => logout()}>
                <Ionicons name="log-out-outline" size={20} color={colors.danger} />
                <Text style={styles.logoutText}>{t('logout')}</Text>
            </TouchableOpacity>
            <View style={{ height: 24 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.bg },
    content: { padding: spacing.lg, paddingTop: spacing.xl },
    profileCard: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface,
        borderRadius: radius.lg, padding: spacing.lg, ...shadows.card, marginBottom: spacing.xl,
    },
    avatar: {
        width: 52, height: 52, borderRadius: radius.full, backgroundColor: colors.primary,
        alignItems: 'center', justifyContent: 'center', marginRight: spacing.md,
    },
    avatarText: { color: colors.textOnPrimary, fontSize: 22, fontWeight: '700' },
    profileInfo: { flex: 1 },
    name: { ...typography.bodyMedium, color: colors.text, fontWeight: '700' },
    email: { ...typography.bodySmall, color: colors.textMuted, marginTop: 2 },
    section: { marginBottom: spacing.xl },
    sectionTitle: { ...typography.label, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: spacing.sm, marginLeft: spacing.sm },
    group: { backgroundColor: colors.surface, borderRadius: radius.lg, overflow: 'hidden', ...shadows.card },
    row: { flexDirection: 'row', alignItems: 'center', padding: spacing.lg, gap: spacing.md },
    iconWrap: { width: 40, height: 40, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
    rowText: { flex: 1 },
    rowLabel: { ...typography.bodyMedium, color: colors.text },
    rowDesc: { ...typography.bodySmall, color: colors.textMuted, marginTop: 2 },
    logout: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm,
        backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, ...shadows.card,
    },
    logoutText: { ...typography.bodyMedium, color: colors.danger, fontWeight: '600' },
});
