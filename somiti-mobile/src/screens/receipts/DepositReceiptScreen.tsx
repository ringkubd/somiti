import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Share } from 'react-native';
import client from '../../api/client';

export default function DepositReceiptScreen({ route, navigation }: any) {
    const { somitiId, depositId } = route.params || {};
    const [data, setData] = useState<any>(null);

    useEffect(() => {
        client.get(`/somitis/${somitiId}/receipts/deposit/${depositId}`).then(({ data }) => setData(data)).catch(() => {});
    }, [somitiId, depositId]);

    if (!data) return <View style={styles.center}><ActivityIndicator size="large" /></View>;

    const { somiti, deposit } = data;
    const symbol = somiti.currency_symbol || '$';

    const shareReceipt = async () => {
        try {
            await Share.share({
                message: `${somiti.receipt_header || somiti.name}\n\nDeposit Receipt #${deposit.id}\nAmount: ${symbol}${Number(deposit.amount).toLocaleString()}\nDate: ${new Date(deposit.created_at).toLocaleDateString()}\nStatus: ${deposit.status}\n\n${somiti.receipt_footer || ''}`,
            });
        } catch {}
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.topBar}>
                <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.back}>← Back</Text></TouchableOpacity>
                <TouchableOpacity onPress={shareReceipt}><Text style={styles.share}>Share</Text></TouchableOpacity>
            </View>
            <View style={styles.receipt}>
                {!!somiti.receipt_header && <Text style={styles.headerText}>{somiti.receipt_header}</Text>}
                <Text style={styles.title}>{somiti.name}</Text>
                <Text style={styles.subtitle}>{somiti.unique_code}</Text>
                {!!somiti.address && <Text style={styles.meta}>{somiti.address}</Text>}
                {!!somiti.phone && <Text style={styles.meta}>{somiti.phone}</Text>}

                <View style={styles.divider} />
                <Text style={styles.receiptLabel}>DEPOSIT RECEIPT</Text>
                <View style={styles.row}>
                    <Text style={styles.label}>Receipt #</Text>
                    <Text style={styles.value}>{deposit.id}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>Member</Text>
                    <Text style={styles.value}>{deposit.user?.name}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>Amount</Text>
                    <Text style={styles.amount}>{symbol}{Number(deposit.amount).toLocaleString()}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>Type</Text>
                    <Text style={styles.value}>{deposit.type || '-'}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>Date</Text>
                    <Text style={styles.value}>{new Date(deposit.created_at).toLocaleDateString()}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>Status</Text>
                    <Text style={[styles.value, { color: deposit.status === 'approved' ? '#10b981' : '#f59e0b' }]}>{deposit.status.toUpperCase()}</Text>
                </View>
                {!!deposit.approver && (
                    <View style={styles.row}>
                        <Text style={styles.label}>Approved by</Text>
                        <Text style={styles.value}>{deposit.approver.name}</Text>
                    </View>
                )}

                <View style={styles.divider} />
                {!!somiti.receipt_footer && <Text style={styles.footer}>{somiti.receipt_footer}</Text>}
                <Text style={styles.thanks}>Thank you!</Text>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#e2e8f0' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' },
    topBar: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, paddingBottom: 8 },
    back: { fontSize: 16, color: '#2563eb' },
    share: { fontSize: 16, color: '#2563eb', fontWeight: '600' },
    receipt: { backgroundColor: '#fff', margin: 20, marginTop: 8, borderRadius: 12, padding: 24, elevation: 2 },
    headerText: { textAlign: 'center', fontSize: 13, color: '#64748b', marginBottom: 8 },
    title: { textAlign: 'center', fontSize: 22, fontWeight: 'bold', color: '#1e293b' },
    subtitle: { textAlign: 'center', fontSize: 13, color: '#94a3b8', marginTop: 4 },
    meta: { textAlign: 'center', fontSize: 12, color: '#94a3b8', marginTop: 2 },
    divider: { height: 1, backgroundColor: '#e2e8f0', marginVertical: 18 },
    receiptLabel: { textAlign: 'center', fontSize: 12, fontWeight: 'bold', color: '#2563eb', letterSpacing: 2, marginBottom: 16 },
    row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
    label: { fontSize: 14, color: '#64748b' },
    value: { fontSize: 14, fontWeight: '600', color: '#1e293b' },
    amount: { fontSize: 16, fontWeight: 'bold', color: '#1e293b' },
    footer: { textAlign: 'center', fontSize: 12, color: '#64748b', marginBottom: 12 },
    thanks: { textAlign: 'center', fontSize: 14, fontWeight: '600', color: '#2563eb' },
});
