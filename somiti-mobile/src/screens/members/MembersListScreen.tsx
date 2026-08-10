import React, { useState, useCallback } from 'react';
import { View, FlatList, StyleSheet, RefreshControl, Alert, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import client from '../../api/client';
import { useSomiti } from '../../hooks/useSomiti';
import { ListItem, EmptyState } from '../../components/Shared';
import { ListHeader, ConfirmDialog } from '../../components/ui';
import { useLanguage } from '../../i18n/LanguageContext';
import { colors } from '../../theme';

export default function MembersListScreen({ navigation }: any) {
    const { t } = useLanguage();
    const { somitiId } = useSomiti();
    const [members, setMembers] = useState<any[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const [removeTarget, setRemoveTarget] = useState<any>(null);

    const fetchMembers = async () => {
        if (!somitiId) return;
        try { const { data } = await client.get(`/somitis/${somitiId}/members`); setMembers(data || []); } catch { }
    };
    useFocusEffect(useCallback(() => { fetchMembers(); }, [somitiId]));

    const removeMember = async () => {
        if (!removeTarget) return;
        try {
            await client.delete(`/somitis/${somitiId}/users/${removeTarget.id}`);
            setMembers(prev => prev.filter(m => m.id !== removeTarget.id));
            setRemoveTarget(null);
            Alert.alert(t('done'), t('member') + ' removed');
        } catch (err: any) { Alert.alert(t('error'), err.response?.data?.message || 'Failed'); setRemoveTarget(null); }
    };

    return (
        <View style={styles.container}>
            <ListHeader title={t('members')} subtitle={t('somitiCooperators')} actionLabel={t('add')} onAction={() => navigation.navigate('MemberAdd')} />
            <FlatList data={members} keyExtractor={(i) => i.id.toString()}
                renderItem={({ item }) => (
                    <ListItem
                        title={item.name}
                        subtitle={`${item.role || 'member'}${item.phone ? ` • ${item.phone}` : ''}`}
                        onPress={undefined}
                        right={
                            <TouchableOpacity onPress={() => setRemoveTarget(item)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                                <Ionicons name="trash-outline" size={20} color={colors.danger} />
                            </TouchableOpacity>
                        }
                    />
                )}
                ListEmptyComponent={<EmptyState message={t('noMembers')} action={t('addMember')} onAction={() => navigation.navigate('MemberAdd')} />}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await fetchMembers(); setRefreshing(false); }} />}
                contentContainerStyle={members.length === 0 ? { flex: 1 } : {}} />
            <ConfirmDialog
                visible={!!removeTarget}
                title={t('removeMember')}
                message={`${t('remove')} ${removeTarget?.name || ''}?`}
                confirmLabel={t('remove')}
                destructive
                icon="trash-outline"
                onConfirm={removeMember}
                onCancel={() => setRemoveTarget(null)}
            />
        </View>
    );
}

const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: colors.bg } });
