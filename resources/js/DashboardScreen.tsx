import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { User, LedgerEntry } from './types'; // Fixed import path

// Mock API call for demo purposes
const fetchDashboardData = async () => {
    // In real app: axios.get('/api/dashboard')
    return {
        totalSavings: 50000,
        myBalance: 12500,
        pendingApprovals: 3,
        recentTransactions: [
            { id: 1, transaction_ref: 'DEP-001', type: 'deposit', amount: 500, dr_cr: 'cr', created_at: '2024-01-01' },
            { id: 2, transaction_ref: 'LN-001', type: 'loan_disbursement', amount: 10000, dr_cr: 'dr', created_at: '2024-01-15' },
        ] as LedgerEntry[]
    };
};

export const DashboardScreen = () => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any>(null);

    const loadData = async () => {
        setLoading(true);
        try {
            const result = await fetchDashboardData();
            setData(result);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    if (loading) return <ActivityIndicator size="large" color="#0000ff" />;

    return (
        <ScrollView style={styles.container} refreshControl={<RefreshControl refreshing={loading} onRefresh={loadData} />}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Somiti Manager</Text>
            </View>

            <View style={styles.card}>
                <Text style={styles.cardTitle}>My Savings</Text>
                <Text style={styles.amount}>৳ {data?.myBalance}</Text>
            </View>

            <View style={styles.row}>
                <View style={[styles.card, styles.halfCard]}>
                    <Text style={styles.cardTitle}>Total Group</Text>
                    <Text style={styles.subAmount}>৳ {data?.totalSavings}</Text>
                </View>
                <View style={[styles.card, styles.halfCard]}>
                    <Text style={styles.cardTitle}>Pending</Text>
                    <Text style={styles.pending}>{data?.pendingApprovals}</Text>
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Recent Transactions</Text>
                {data?.recentTransactions.map((txn: LedgerEntry) => (
                    <View key={txn.id} style={styles.txnRow}>
                        <View>
                            <Text style={styles.txnType}>{txn.type.toUpperCase()}</Text>
                            <Text style={styles.txnRef}>{txn.transaction_ref}</Text>
                        </View>
                        <Text style={[styles.txnAmount, txn.dr_cr === 'dr' ? styles.dr : styles.cr]}>
                            {txn.dr_cr === 'dr' ? '-' : '+'} ৳{txn.amount}
                        </Text>
                    </View>
                ))}
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5', padding: 15 },
    header: { marginBottom: 20, marginTop: 10 },
    headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#333' },
    card: { backgroundColor: 'white', padding: 20, borderRadius: 10, marginBottom: 15, elevation: 3 },
    cardTitle: { fontSize: 14, color: '#666', marginBottom: 5 },
    amount: { fontSize: 32, fontWeight: 'bold', color: '#2e7d32' },
    row: { flexDirection: 'row', justifyContent: 'space-between' },
    halfCard: { width: '48%' },
    subAmount: { fontSize: 20, fontWeight: 'bold', color: '#333' },
    pending: { fontSize: 20, fontWeight: 'bold', color: '#ed6c02' },
    section: { marginTop: 10 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: '#333' },
    txnRow: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: 'white', padding: 15, borderRadius: 8, marginBottom: 10 },
    txnType: { fontWeight: 'bold', fontSize: 14 },
    txnRef: { fontSize: 12, color: '#999' },
    txnAmount: { fontSize: 16, fontWeight: 'bold' },
    dr: { color: '#d32f2f' },
    cr: { color: '#2e7d32' },
});
