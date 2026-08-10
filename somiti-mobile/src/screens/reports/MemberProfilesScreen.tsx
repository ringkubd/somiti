import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import client from '../../api/client';
import { ListHeader, SkeletonList, ErrorState } from '../../components/ui';
import { ListItem, EmptyState } from '../../components/Shared';
import { useSomiti, getCurrencySymbol } from '../../hooks/useSomiti';
import { useLanguage } from '../../i18n/LanguageContext';
import { colors } from '../../theme';

export default function MemberProfilesScreen({ navigation }: any) {
    const { t } = useLanguage();
    const { somitiId } = useSomiti();
    const [members, setMembers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const load = async () => {
        if (!somitiId) return;
        try {
            const { data } = await client.get(`/somitis/${somitiId}/reports/members`);
            setMembers(data.members || []);
            setError(false);
        } catch { setError(true); }
        finally { setLoading(false); }
    };
    useFocusEffect(useCallback(() => { load(); }, [somitiId]));

    const cs = getCurrencySymbol();

    if (loading) return <><ListHeader title={t('memberProfiles')} subtitle={t('financialSnapshot')} /><SkeletonList count={4} rows={1} /></>;

    return (
        <View style={styles.container}>
            <ListHeader title={t('memberProfiles')} subtitle={`${members.length} ${t('members')}`} />
            {error ? <ErrorState onRetry={load} /> : (
                <FlatList
                    data={members}
                    keyExtractor={(m) => m.id.toString()}
                    renderItem={({ item }) => (
                        <ListItem
                            title={item.name}
                            subtitle={`${t('savings')} ${cs}${Number(item.profile?.total_savings || 0).toLocaleString()} • ${t('loans')} ${cs}${Number(item.profile?.loan_outstanding || 0).toLocaleString()}`}
                            right={item.profile?.dues?.overdue_count > 0 ? <Text style={styles.overdue}>{t('overdue')}</Text> : <Text style={styles.ok}>{t('paidStatus')}</Text>}
                            onPress={() => navigation.navigate('MemberProfile', { profile: item.profile })}
                        />
                    )}
                    ListEmptyComponent={<EmptyState message={t('noMembers')} />}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await load(); setRefreshing(false); }} />}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.bg },
    overdue: { color: colors.danger, fontSize: 12, fontWeight: '700' },
    ok: { color: colors.success, fontSize: 12, fontWeight: '700' },
});
