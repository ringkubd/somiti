import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import client from '../../api/client';

export default function ReportsTrialBalanceScreen({ navigation }: any) {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    React.useEffect(() => {
        client.get('/reports/trial-balance').then(({ data: d }) => { setData(d); setLoading(false); }).catch(() => setLoading(false));
    }, []);

    if (loading) return <View style={styles.center}><ActivityIndicator size="large" /></View>;

    return (
        <ScrollView style={styles.container}>
            <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.back}>← Back</Text></TouchableOpacity>
            <Text style={styles.title}>Trial Balance</Text>
            <View style={styles.summaryRow}>
                <Text style={[styles.summaryText, data?.summary?.is_balanced ? { color: '#10b981' } : { color: '#ef4444' }]}>
                    {data?.summary?.is_balanced ? '✓ Balanced' : '✗ Unbalanced'}
                </Text>
                <Text style={styles.summaryText}>Debit: ${data?.summary?.total_debit?.toLocaleString()}</Text>
                <Text style={styles.summaryText}>Credit: ${data?.summary?.total_credit?.toLocaleString()}</Text>
            </View>
            {data?.accounts?.map((acc: any, i: number) => (
                <View key={i} style={styles.row}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.acctName}>{acc.name}</Text>
                        <Text style={styles.acctType}>{acc.type} • {acc.code}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                        <Text style={styles.acctBalance}>${acc.balance?.toLocaleString()}</Text>
                        <Text style={styles.acctDetail}>D:${acc.debit} C:${acc.credit}</Text>
                    </View>
                </View>
            ))}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' }, center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    back: { fontSize: 16, color: '#2563eb', padding: 20, paddingBottom: 0 },
    title: { fontSize: 28, fontWeight: 'bold', color: '#1e293b', padding: 20, paddingTop: 12 },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-around', padding: 16, backgroundColor: '#fff', marginHorizontal: 20, borderRadius: 12, marginBottom: 16 },
    summaryText: { fontSize: 14, fontWeight: '600' },
    row: { flexDirection: 'row', backgroundColor: '#fff', marginHorizontal: 20, marginBottom: 8, borderRadius: 8, padding: 16 },
    acctName: { fontSize: 15, fontWeight: '600', color: '#1e293b' },
    acctType: { fontSize: 11, color: '#94a3b8', marginTop: 2 },
    acctBalance: { fontSize: 16, fontWeight: 'bold', color: '#1e293b' },
    acctDetail: { fontSize: 10, color: '#94a3b8' },
});
