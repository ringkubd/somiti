import React, { useState, useCallback } from 'react';
import { View, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import client from '../../api/client';
import { ListItem, EmptyState } from '../../components/Shared';
import { ListHeader, Badge } from '../../components/ui';
import { useLanguage } from '../../i18n/LanguageContext';
import { getCurrencySymbol } from '../../hooks/useSomiti';
import { colors } from '../../theme';

export default function BankAccountsListScreen({ navigation }: any) {
    const { t } = useLanguage();
    const [items, setItems] = useState<any[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const fetch = async () => { try { const { data } = await client.get('/bank-accounts'); setItems(data.data || []); } catch { } };
    useFocusEffect(useCallback(() => { fetch(); }, []));
    return (
        <View style={styles.container}>
            <ListHeader title={t('bankAccounts')} subtitle={t('linkedBankAccounts')} actionLabel={t('add')} onAction={() => navigation.navigate('BankAccountCreate')} />
            <FlatList data={items} keyExtractor={(i) => i.id.toString()}
                renderItem={({ item }) => (
                    <ListItem title={item.bank_name}
                        subtitle={`${item.account_number} • ${getCurrencySymbol()}${parseFloat(item.current_balance).toLocaleString()}`}
                        right={<Badge label={item.account_type} tone="primary" />}
                        onPress={() => navigation.navigate('BankAccountDetail', { id: item.id })} />
                )}
                ListEmptyComponent={<EmptyState message={t('noBankAccounts')} action={t('addBankAccount')} onAction={() => navigation.navigate('BankAccountCreate')} />}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await fetch(); setRefreshing(false); }} />}
                contentContainerStyle={items.length === 0 ? { flex: 1 } : {}} />
        </View>
    );
}

const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: colors.bg } });
