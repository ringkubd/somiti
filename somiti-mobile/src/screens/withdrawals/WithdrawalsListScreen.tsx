import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import client from '../../api/client';
import { ListItem, StatusBadge, EmptyState } from '../../components/Shared';
import { getCurrencySymbol } from '../../hooks/useSomiti';

export default function WithdrawalsListScreen({ navigation }: any) {
    const [items, setItems] = useState<any[]>([]);
    const [refreshing, setRefreshing] = useState(false);

    const fetch = async () => {
        try {
            const { data } = await client.get('/withdrawals');
            setItems(data.data || []);
        } catch {}
    };

    useFocusEffect(useCallback(() => { fetch(); }, []));

    const decide = async (item: any, decision: string) => {
        try {
            await client.post(`/withdrawals/${item.id}/${decision}`);
            Alert.alert('Done', `Withdrawal ${decision}`);
            fetch();
        } catch (err: any) {
            Alert.alert('Error', err.response?.data?.message || 'Failed');
        }
    };

    const onPressItem = (item: any) => {
        if (item.status === 'pending') {
            Alert.alert('Decision', 'Approve or reject this withdrawal?', [
                { text: 'Approve', onPress: () => decide(item, 'approve') },
                { text: 'Reject', style: 'destructive', onPress: () => decide(item, 'reject') },
                { text: 'Cancel', style: 'cancel' },
            ]);
        } else {
            Alert.alert(item.user?.name || 'Withdrawal', `${getCurrencySymbol()}${parseFloat(item.amount).toLocaleString()}\n${item.reason || 'No reason'}`);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Withdrawals</Text>
                <TouchableOpacity style={styles.addBtn} onPress={() => navigation.navigate('WithdrawalCreate')}>
                    <Text style={styles.addBtnText}>+ Request</Text>
                </TouchableOpacity>
            </View>
            <FlatList
                data={items}
                keyExtractor={(i) => i.id.toString()}
                renderItem={({ item }) => (
                    <ListItem
                        title={`${getCurrencySymbol()}${parseFloat(item.amount || '0').toLocaleString()}`}
                        subtitle={`${item.user?.name || ''}${item.reason ? ` • ${item.reason}` : ''}`}
                        right={<StatusBadge status={item.status} />}
                        onPress={() => onPressItem(item)}
                    />
                )}
                ListEmptyComponent={<EmptyState message="No withdrawals yet" action="Request Withdrawal" onAction={() => navigation.navigate('WithdrawalCreate')} />}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await fetch(); setRefreshing(false); }} />}
                contentContainerStyle={items.length === 0 ? { flex: 1 } : {}}
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
    title: { fontSize: 24, fontWeight: 'bold', color: '#1e293b' },
    addBtn: { backgroundColor: '#2563eb', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 8 },
    addBtnText: { color: '#fff', fontWeight: '600', fontSize: 14 },
});
