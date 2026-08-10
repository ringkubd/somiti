import React, { useState, useCallback } from 'react';
import { View, FlatList, StyleSheet, RefreshControl, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import client from '../../api/client';
import { ListItem, StatusBadge, EmptyState } from '../../components/Shared';
import { ListHeader, ConfirmDialog } from '../../components/ui';
import { useLanguage } from '../../i18n/LanguageContext';
import { getCurrencySymbol } from '../../hooks/useSomiti';
import { colors } from '../../theme';

export default function WithdrawalsListScreen({ navigation }: any) {
    const { t } = useLanguage();
    const [items, setItems] = useState<any[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const [pendingItem, setPendingItem] = useState<any>(null);

    const fetch = async () => { try { const { data } = await client.get('/withdrawals'); setItems(data.data || []); } catch { } };
    useFocusEffect(useCallback(() => { fetch(); }, []));

    const decide = async (decision: string) => {
        if (!pendingItem) return;
        try {
            await client.post(`/withdrawals/${pendingItem.id}/${decision}`);
            Alert.alert(t('done'), `${t('withdrawals')} ${decision}`);
            setPendingItem(null);
            fetch();
        } catch (err: any) { Alert.alert(t('error'), err.response?.data?.message || 'Failed'); }
        finally { setPendingItem(null); }
    };

    const onPressItem = (item: any) => {
        if (item.status === 'pending') setPendingItem(item);
        else Alert.alert(item.user?.name || t('withdrawals'), `${getCurrencySymbol()}${parseFloat(item.amount).toLocaleString()}\n${item.reason || t('notes')}`);
    };

    return (
        <View style={styles.container}>
            <ListHeader title={t('withdrawals')} subtitle={t('savingsWithdrawals')} actionLabel={t('request')} onAction={() => navigation.navigate('WithdrawalCreate')} />
            <FlatList data={items} keyExtractor={(i) => i.id.toString()}
                renderItem={({ item }) => (
                    <ListItem title={`${getCurrencySymbol()}${parseFloat(item.amount || '0').toLocaleString()}`}
                        subtitle={`${item.user?.name || ''}${item.reason ? ` • ${item.reason}` : ''}`}
                        right={<StatusBadge status={item.status} />} onPress={() => onPressItem(item)} />
                )}
                ListEmptyComponent={<EmptyState message={t('noWithdrawals')} action={t('requestWithdrawal')} onAction={() => navigation.navigate('WithdrawalCreate')} />}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await fetch(); setRefreshing(false); }} />}
                contentContainerStyle={items.length === 0 ? { flex: 1 } : {}} />
            <ConfirmDialog
                visible={!!pendingItem}
                title={t('approve') + '?'}
                message={`${getCurrencySymbol()}${pendingItem ? parseFloat(pendingItem.amount).toLocaleString() : ''}`}
                confirmLabel={t('approve')}
                cancelLabel={t('reject')}
                icon="checkmark-circle-outline"
                onConfirm={() => decide('approve')}
                onCancel={() => setPendingItem(null)}
            />
        </View>
    );
}

const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: colors.bg } });
