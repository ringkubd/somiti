import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import client from '../../api/client';
import { useSomiti } from '../../hooks/useSomiti';
import { ListItem, EmptyState } from '../../components/Shared';

export default function MembersListScreen({ navigation }: any) {
    const { somitiId } = useSomiti();
    const [members, setMembers] = useState<any[]>([]);
    const [refreshing, setRefreshing] = useState(false);

    const fetchMembers = async () => {
        if (!somitiId) return;
        try {
            const { data } = await client.get(`/somitis/${somitiId}/members`);
            setMembers(data || []);
        } catch {}
    };

    useFocusEffect(useCallback(() => { fetchMembers(); }, [somitiId]));

    const removeMember = (member: any) => {
        Alert.alert('Remove Member', `Remove ${member.name} from this somiti?`, [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Remove',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await client.delete(`/somitis/${somitiId}/users/${member.id}`);
                        setMembers(prev => prev.filter(m => m.id !== member.id));
                        Alert.alert('Done', 'Member removed');
                    } catch (err: any) {
                        Alert.alert('Error', err.response?.data?.message || 'Failed to remove member');
                    }
                },
            },
        ]);
    };

    const roleColor = (role: string) => role === 'owner' ? '#8b5cf6' : role === 'manager' ? '#f59e0b' : '#94a3b8';

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Members</Text>
                <TouchableOpacity style={styles.addBtn} onPress={() => navigation.navigate('MemberAdd')}>
                    <Text style={styles.addBtnText}>+ Add</Text>
                </TouchableOpacity>
            </View>
            <FlatList
                data={members}
                keyExtractor={(i) => i.id.toString()}
                renderItem={({ item }) => (
                    <ListItem
                        title={item.name}
                        subtitle={`${item.phone || item.email || ''}${item.is_active ? '' : ' • inactive'}`}
                        right={
                            <View style={styles.rightWrap}>
                                <Text style={[styles.role, { color: roleColor(item.role) }]}>{item.role?.toUpperCase()}</Text>
                                {item.role !== 'owner' && (
                                    <TouchableOpacity onPress={() => removeMember(item)}>
                                        <Text style={styles.remove}>Remove</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        }
                    />
                )}
                ListEmptyComponent={<EmptyState message="No members yet" action="Add Member" onAction={() => navigation.navigate('MemberAdd')} />}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await fetchMembers(); setRefreshing(false); }} />}
                contentContainerStyle={members.length === 0 ? { flex: 1 } : {}}
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
    rightWrap: { alignItems: 'flex-end', gap: 4 },
    role: { fontSize: 11, fontWeight: 'bold' },
    remove: { fontSize: 12, color: '#ef4444', fontWeight: '600' },
});
