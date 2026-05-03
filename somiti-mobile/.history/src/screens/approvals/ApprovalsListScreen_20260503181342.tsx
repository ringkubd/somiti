import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import client from '../../api/client';
import { ListItem, StatusBadge, EmptyState } from '../../components/Shared';

export default function ApprovalsListScreen({ navigation }: any) {
    const [items, setItems] = useState<any[]>([]);

    useFocusEffect(useCallback(() => { client.get('/approvals').then(({ data }) => setItems(data.data || [])).catch(() => { }); }, []));

    const decide = async (id: number, decision: string) => {
        try {
            await client.post(`/approvals/${id}/decide`, { decision, comment: '' });
            setItems(prev => prev.filter(i => i.id !== id));
            Alert.alert('Done', `Request ${decision}`);
        } catch (err: any) { Alert.alert('Error', err.response?.data?.message || 'Failed'); }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Approvals</Text>
                <Text style={styles.count}>{items.length} pending</Text>
            </View>
            <FlatList data={items} keyExtractor={(i) => i.id.toString()}
                renderItem={({ item }) => (
                    <ListItem title={`${item.approvable_type?.split('\\').pop() || 'Request'} #${item.approvable_id}`}
                        subtitle={item.user?.name} right={<StatusBadge status={item.status} />}
                        onPress={() => {
                            Alert.alert('Decision', 'Approve or reject?', [
                                { text: 'Approve', onPress: () => decide(item.id, 'approved') },
                                { text: 'Reject', style: 'destructive', onPress: () => decide(item.id, 'rejected') },
                                { text: 'Cancel', style: 'cancel' },
                            ]);
                        }} />
                )}
                ListEmptyComponent={<EmptyState message="No pending approvals" />}
                contentContainerStyle={items.length === 0 ? { flex: 1 } : {}} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' }, header: {
        flexDirection: 'row', justifyContent: 'space-between',
        alignItems: 'center', paddingHorizontal: 20, paddingBottom: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f1f5f9'
    },
    title: { fontSize: 24, fontWeight: 'bold', color: '#1e293b' }, count: { fontSize: 14, color: '#64748b' },
});
