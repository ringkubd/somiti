import React, { useState, useCallback } from 'react';
import { View, FlatList, StyleSheet, RefreshControl, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import client from '../../api/client';
import { ListItem, StatusBadge, EmptyState } from '../../components/Shared';
import { ListHeader, ConfirmDialog } from '../../components/ui';
import { useLanguage } from '../../i18n/LanguageContext';
import { getCurrencySymbol } from '../../hooks/useSomiti';
import { colors } from '../../theme';

export default function RepaymentsListScreen({ route, navigation }: any) {
    const { t } = useLanguage();
    const loanId = route.params?.loanId;
    const [items, setItems] = useState<any[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const [pendingItem, setPendingItem] = useState<any>(null);

    const fetch = async () => {
        try {
            const url = loanId ? `/loans/${loanId}/repayments` : '/repayments';
            const { data } = await client.get(url);
            setItems(data.data || []);
        } catch { }
    };
    useFocusEffect(useCallback(() => { fetch(); }, [loanId]));

    const decide = async (decision: string) => {
        if (!pendingItem) return;
        try {
            await client.post(`/repayments/${pendingItem.id}/${decision}`);
            Alert.alert(t('done'), `${t('repayments')} ${decision}`);
            setPendingItem(null);
            fetch();
        } catch (err: any) { Alert.alert(t('error'), err.response?.data?.message || 'Failed'); }
        finally { setPendingItem(null); }
    };

    const onPressItem = (item: any) => { if (item.status === 'pending') setPendingItem(item); };

    return (
        <View style={styles.container}>
            <ListHeader
                title={loanId ? `${t('loans')} #${loanId}` : t('repayments')}
                subtitle={t('loanRepaymentsList')}
                actionLabel={t('new')}
                onAction={() => navigation.navigate('RepaymentCreate', { loanId })}
            />
            <FlatList data={items} keyExtractor={(i) => i.id.toString()}
                renderItem={({ item }) => (
                    <ListItem title={`${getCurrencySymbol()}${parseFloat(item.amount || '0').toLocaleString()}`}
                        subtitle={`${item.user?.name || ''} • ${new Date(item.created_at).toLocaleDateString()}`}
                        right={<StatusBadge status={item.status} />} onPress={() => onPressItem(item)} />
                )}
                ListEmptyComponent={<EmptyState message={t('noRepayments')} action={t('loanRepayment')} onAction={() => navigation.navigate('RepaymentCreate', { loanId })} />}
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
