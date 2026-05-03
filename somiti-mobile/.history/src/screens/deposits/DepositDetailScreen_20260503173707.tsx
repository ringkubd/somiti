import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import client from '../../api/client';
import { StatusBadge, StatCard } from '../../components/Shared';
import SafeScreen from '../../components/SafeScreen';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function DepositDetailScreen({ route, navigation }: any) {
    const [deposit, setDeposit] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        client.get(`/deposits/${route.params.id}`).then(({ data }) => {
            setDeposit(data);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, []);

    if (loading) return <View style={styles.center}><ActivityIndicator size="large" /></View>;
    if (!deposit) return <View style={styles.center}><Text>Not found</Text></View>;

    return (
        <ScrollView style={styles.container}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                <Text style={styles.back}>← Back</Text>
            </TouchableOpacity>
            <View style={styles.header}>
                <Text style={styles.title}>Deposit #{deposit.id}</Text>
                <StatusBadge status={deposit.status} />
            </View>
            <StatCard label="Amount" value={deposit.amount} color="#10b981" />
            <View style={styles.details}>
                <DetailRow label="Somiti" value={deposit.somiti?.name} />
                <DetailRow label="Member" value={deposit.user?.name} />
                <DetailRow label="Type" value={deposit.type} />
                <DetailRow label="Month" value={deposit.month} />
                <DetailRow label="Date" value={new Date(deposit.created_at).toLocaleDateString()} />
                {deposit.approver && <DetailRow label="Approved by" value={deposit.approver.name} />}
            </View>
        </ScrollView>
    );
}

function DetailRow({ label, value }: any) {
    return (
        <SafeAreaView style={styles.row} edges={['top', 'bottom']}>
            <Text style={styles.label}>{label}</Text>
            <Text style={styles.value}>{value || '-'}</Text>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    backBtn: { padding: 20, paddingBottom: 0 },
    back: { fontSize: 16, color: '#2563eb' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 12 },
    title: { fontSize: 24, fontWeight: 'bold', color: '#1e293b' },
    details: { backgroundColor: '#fff', margin: 20, borderRadius: 12, padding: 16 },
    row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
    label: { fontSize: 14, color: '#64748b' },
    value: { fontSize: 14, fontWeight: '600', color: '#1e293b' },
});
