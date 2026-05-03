import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import client from '../../api/client';
import { StatCard } from '../../components/Shared';

export default function ReportsSummaryScreen({ navigation }: any) {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    React.useEffect(() => {
        client.get('/reports/summary').then(({ data: d }) => { setData(d); setLoading(false); }).catch(() => setLoading(false));
    }, []);

    if (loading) return <View style={styles.center}><ActivityIndicator size="large" /></View>;

    return (
        <ScrollView style={styles.container}>
            <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.back}>← Back</Text></TouchableOpacity>
            <Text style={styles.title}>Financial Summary</Text>
            <View style={styles.content}>
                <StatCard label="Cash Balance" value={data?.cash || 0} color="#10b981" />
                <StatCard label="Member Savings" value={data?.member_savings || 0} color="#f59e0b" />
                <StatCard label="Loans Receivable" value={data?.loans_receivable || 0} color="#ef4444" />
                <StatCard label="Share Capital" value={data?.share_capital || 0} color="#8b5cf6" />
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' }, center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    back: { fontSize: 16, color: '#2563eb', padding: 20, paddingBottom: 0 }, title: { fontSize: 28, fontWeight: 'bold', color: '#1e293b', padding: 20, paddingTop: 12 },
    content: { padding: 20 },
});
