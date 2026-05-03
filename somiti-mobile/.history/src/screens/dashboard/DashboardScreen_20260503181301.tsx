import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, RefreshControl, ScrollView } from 'react-native';
import client from '../../api/client';
import { StatCard } from '../../components/Shared';

interface DashboardStats { total_members: number; total_savings: number; total_loans: number; net_fund: number; }

const quickActions = [
    { label: 'Deposits', screen: 'DepositsList', icon: '💰' },
    { label: 'Loans', screen: 'LoansList', icon: '🏦' },
    { label: 'Investments', screen: 'InvestmentsList', icon: '📈' },
    { label: 'FDRs', screen: 'FdrsList', icon: '📋' },
    { label: 'Bank Accounts', screen: 'BankAccountsList', icon: '🏛️' },
    { label: 'Shares', screen: 'UserSharesList', icon: '📊' },
    { label: 'Transfers', screen: 'ShareTransfersList', icon: '🔄' },
    { label: 'Approvals', screen: 'ApprovalsList', icon: '✅' },
];

export default function DashboardScreen({ navigation }: any) {
    const [somiti, setSomiti] = useState<any>(null);
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [refreshing, setRefreshing] = useState(false);

    const fetchDashboard = async () => {
        try {
            const { data } = await client.get('/dashboard');
            setSomiti(data.selected_somiti);
            setStats(data.stats);
        } catch { }
    };

    useEffect(() => { fetchDashboard(); }, []);

    const onRefresh = async () => { setRefreshing(true); await fetchDashboard(); setRefreshing(false); };

    const cs = somiti?.currency_symbol || '$';

    return (
        <ScrollView style={styles.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
            <View style={styles.header}>
                <Text style={styles.greeting}>Welcome</Text>
                <Text style={styles.title}>{somiti?.name || 'Somiti'}</Text>
                {somiti?.unique_code && <Text style={styles.code}>{somiti.unique_code}</Text>}
            </View>

            {stats && (
                <View style={styles.statsGrid}>
                    <View style={styles.statsRow}>
                        <StatCard label="Members" value={stats?.total_members} color="#3b82f6" currency="" />
                        <StatCard label="Savings" value={stats?.total_savings} color="#10b981" currency={cs} />
                    </View>
                    <View style={styles.statsRow}>
                        <StatCard label="Loans" value={stats?.total_loans} color="#ef4444" currency={cs} />
                        <StatCard label="Net Fund" value={stats?.net_fund} color="#8b5cf6" currency={cs} />
                    </View>
                </View>
            )}

            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.grid}>
                {quickActions.map((item) => (
                    <TouchableOpacity key={item.screen} style={styles.actionCard}
                        onPress={() => navigation.navigate('Transactions', { screen: item.screen })}>
                        <Text style={styles.actionIcon}>{item.icon}</Text>
                        <Text style={styles.actionLabel}>{item.label}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <View style={styles.bottomLinks}>
                <TouchableOpacity onPress={() => navigation.navigate('More', { screen: 'ProfileFromMore' })}>
                    <Text style={styles.link}>Profile</Text>
                </TouchableOpacity>
                <Text style={styles.linkSep}>|</Text>
                <TouchableOpacity onPress={() => navigation.navigate('More', { screen: 'ReportsSummary' })}>
                    <Text style={styles.link}>Reports</Text>
                </TouchableOpacity>
                <Text style={styles.linkSep}>|</Text>
                <TouchableOpacity onPress={() => navigation.navigate('More', { screen: 'FinancialYearsList' })}>
                    <Text style={styles.link}>Financial Years</Text>
                </TouchableOpacity>
            </View>
            <View style={{ height: 40 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    header: { paddingHorizontal: 20, paddingBottom: 12 },
    greeting: { fontSize: 16, color: '#94a3b8' },
    title: { fontSize: 28, fontWeight: 'bold', color: '#1e293b' },
    code: { fontSize: 12, color: '#94a3b8', marginTop: 2 },
    statsGrid: { padding: 20, paddingTop: 8, paddingBottom: 0 },
    statsRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1e293b', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 12 },
    grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, gap: 12 },
    actionCard: {
        width: '46%', backgroundColor: '#fff', borderRadius: 12, padding: 16,
        flexDirection: 'row', alignItems: 'center', gap: 12, elevation: 1
    },
    actionIcon: { fontSize: 28 },
    actionLabel: { fontSize: 13, fontWeight: '600', color: '#1e293b' },
    bottomLinks: { flexDirection: 'row', justifyContent: 'center', padding: 20, gap: 8 },
    link: { fontSize: 14, color: '#2563eb', fontWeight: '500' },
    linkSep: { fontSize: 14, color: '#cbd5e1' },
});
