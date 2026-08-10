import React, { useState, useCallback } from 'react';
import { View, FlatList, StyleSheet, RefreshControl, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import client from '../../api/client';
import { ListItem, StatusBadge, EmptyState } from '../../components/Shared';
import { ListHeader, ConfirmDialog } from '../../components/ui';
import { useLanguage } from '../../i18n/LanguageContext';
import { colors } from '../../theme';

export default function ApprovalsListScreen({ navigation }: any) {
    const { t } = useLanguage();
    const [items, setItems] = useState<any[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const [pendingItem, setPendingItem] = useState<any>(null);

    const fetch = async () => { try { const { data } = await client.get('/approvals'); setItems(data.data || []); } catch { } };
    useFocusEffect(useCallback(() => { fetch(); }, []));

    const decide = async (decision: string) => {
        if (!pendingItem) return;
        try {
            await client.post(`/approvals/${pendingItem.id}/decide`, { decision, comment: '' });
            setItems(prev => prev.filter(i => i.id !== pendingItem.id));
            setPendingItem(null);
            Alert.alert(t('done'), `${t('request')} ${decision}`);
        } catch (err: any) { Alert.alert(t('error'), err.response?.data?.message || 'Failed'); }
        finally { setPendingItem(null); }
    };

    return (
        <View style={styles.container}>
            <ListHeader title={t('approvals')} subtitle={`${items.length} ${t('pending')}`} />
            <FlatList
                data={items}
                keyExtractor={(i) => i.id.toString()}
                renderItem={({ item }) => (
                    <ListItem
                        title={`${(item.approvable_type || '').split('\\').pop() || t('request')} #${item.approvable_id}`}
                        subtitle={item.user?.name}
                        right={<StatusBadge status={item.status} />}
                        onPress={() => setPendingItem(item)}
                    />
                )}
                ListEmptyComponent={<EmptyState message={t('noApprovals')} />}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await fetch(); setRefreshing(false); }} />}
                contentContainerStyle={items.length === 0 ? { flex: 1 } : {}}
            />
            <ConfirmDialog
                visible={!!pendingItem}
                title={t('approve') + '?'}
                message={`${pendingItem ? (pendingItem.approvable_type || '').split('\\').pop() : ''} #${pendingItem?.approvable_id}`}
                confirmLabel={t('approve')}
                cancelLabel={t('reject')}
                icon="checkmark-circle-outline"
                onConfirm={() => decide('approved')}
                onCancel={() => setPendingItem(null)}
            />
        </View>
    );
}

const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: colors.bg } });
