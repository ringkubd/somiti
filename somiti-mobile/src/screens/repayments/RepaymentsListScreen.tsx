import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import client from '../../api/client';
import { ListItem, StatusBadge, EmptyState } from '../../components/Shared';
import { getCurrencySymbol } from '../../hooks/useSomiti';

export default function RepaymentsListScreen({ route, navigation }: any) {
    const loanId = route.params?.loanId;
    const [repayments, setRepayments] = useState<any[]>([]);
    const [refreshing, setRefreshing] = useState(false);

    const fetch = async () => {
        try {
            const url = loanId ? `/loans/${loanId}/repayments` : '/repayments';
            const { data } = await client.get(url);
            setRepayments(data.data || []);
        } catch {}
    };

    useFocusEffect(useCallback(() => { fetch(); }, [loanId]));

    const decide = async (item: any, decision: string) => {
        try {
            await client.post(`/repayments/${item.id}/${decision}`);
            Alert.alert('Done', `Repayment ${decision}`);
            fetch();
        } catch (err: any) {
            Alert.alert('Error', err.response?.data?.message || 'Failed');
        }
    };

    const onPressItem = (item: any) => {
        if (item.status === 'pending') {
            Alert.alert('Decision', 'Approve or reject this repayment?', [
                { text: 'Approve', onPress: () => decide(item, 'approve') },
                { text: 'Reject', style: 'destructive', onPress: () => decide(item, 'reject') },
                { text: 'Cancel', style: 'cancel' },
            ]);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>{loanId ? `Loan #${loanId} Repayments` : 'Repayments'}</Text>
                {loanId && (
                    <TouchableOpacity style={styles.addBtn} onPress={() => navigation.navigate('RepaymentCreate', { loanId })}>
                        <Text style={styles.addBtnText}>+ Pay</Text>
                    </TouchableOpacity>
                )}
            </View>
            <FlatList
                data={repayments}
                keyExtractor={(i) => i.id.toString()}
                renderItem={({ item }) => (
                    <ListItem
                        title={`${getCurrencySymbol()}${parseFloat(item.amount || '0').toLocaleString()}`}
                        subtitle={`${item.user?.name || ''} • ${item.payment_date ? new Date(item.payment_date).toLocaleDateString() : ''}`}
                        right={<StatusBadge status={item.status} />}
                        onPress={() => onPressItem(item)}
                    />
                )}
                ListEmptyComponent={<EmptyState message="No repayments yet" action={loanId ? 'Make a Payment' : undefined} onAction={() => loanId && navigation.navigate('RepaymentCreate', { loanId })} />}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await fetch(); setRefreshing(false); }} />}
                contentContainerStyle={repayments.length === 0 ? { flex: 1 } : {}}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    header: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingHorizontal: 20, paddingBottom: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f1f5f9'
    },
    title: { fontSize: 22, fontWeight: 'bold', color: '#1e293b', flex: 1 },
    addBtn: { backgroundColor: '#2563eb', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 8 },
    addBtnText: { color: '#fff', fontWeight: '600', fontSize: 14 },
});
