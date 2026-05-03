import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import client from '../../api/client';
import { ListItem, EmptyState } from '../../components/Shared';

export default function NotificationsListScreen({ navigation }: any) {
    const [items, setItems] = useState<any[]>([]);
    useFocusEffect(useCallback(() => { client.get('/notifications').then(({ data }) => setItems(data.data || [])).catch(() => { }); }, []));
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Notifications</Text>
            </View>
            <FlatList data={items} keyExtractor={(i) => i.id.toString()}
                renderItem={({ item }) => (
                    <ListItem title={item.title} subtitle={item.message} right={item.is_read ? undefined : <View style={styles.dot} />} />
                )}
                ListEmptyComponent={<EmptyState message="No notifications" />}
                contentContainerStyle={items.length === 0 ? { flex: 1 } : {}} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' }, header: {
        paddingHorizontal: 20, paddingBottom: 16,
        backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f1f5f9'
    },
    title: { fontSize: 24, fontWeight: 'bold', color: '#1e293b' }, dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#2563eb' },
});
