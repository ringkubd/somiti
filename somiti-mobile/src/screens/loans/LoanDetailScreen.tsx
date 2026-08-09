import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import client from '../../api/client';
import { StatusBadge, StatCard } from '../../components/Shared';
import { getCurrencySymbol } from '../../hooks/useSomiti';

export default function LoanDetailScreen({ route, navigation }: any) {
    const [loan, setLoan] = useState<any>(null);

    useEffect(() => {
        client.get(`/loans/${route.params.id}`).then(({ data }) => setLoan(data)).catch(() => {});
    }, []);

    if (!loan) return <View style={styles.center}><ActivityIndicator size="large" /></View>;

    return (
        <ScrollView style={styles.container}>
            <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.back}>← Back</Text></TouchableOpacity>
            <View style={styles.header}>
                <Text style={styles.title}>Loan #{loan.id}</Text>
                <StatusBadge status={loan.status} />
            </View>
            <StatCard label="Amount" value={loan.amount} color="#ef4444" />
            <View style={styles.details}>
                <DetailRow label="Somiti" value={loan.somiti?.name} />
                <DetailRow label="Member" value={loan.user?.name} />
                <DetailRow label="Interest Rate" value={`${loan.interest_rate}%`} />
                <DetailRow label="Outstanding" value={`${getCurrencySymbol()}${parseFloat(loan.outstanding_balance || '0').toLocaleString()}`} />
                <DetailRow label="Term" value={`${loan.term_months || '-'} months`} />
                <DetailRow label="Status" value={loan.status} />
                <DetailRow label="Created" value={new Date(loan.created_at).toLocaleDateString()} />
            </View>
            <TouchableOpacity style={styles.linkBtn} onPress={() => navigation.navigate('RepaymentsList', { loanId: loan.id })}>
                <Text style={styles.linkText}>View Repayments</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

function DetailRow({ label, value }: any) {
    return (
        <View style={styles.row}><Text style={styles.label}>{label}</Text><Text style={styles.value}>{value || '-'}</Text></View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' }, center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    back: { fontSize: 16, color: '#2563eb', padding: 20, paddingBottom: 0 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 },
    title: { fontSize: 24, fontWeight: 'bold', color: '#1e293b' },
    details: { backgroundColor: '#fff', margin: 20, borderRadius: 12, padding: 16 },
    row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
    label: { fontSize: 14, color: '#64748b' }, value: { fontSize: 14, fontWeight: '600', color: '#1e293b' },
    linkBtn: { backgroundColor: '#2563eb', marginHorizontal: 20, borderRadius: 12, padding: 14, alignItems: 'center', marginBottom: 20 },
    linkText: { color: '#fff', fontSize: 15, fontWeight: '600' },
});
