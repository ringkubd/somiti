import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl, ActivityIndicator, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import client from '../../api/client';
import { useSomiti, getCurrencySymbol } from '../../hooks/useSomiti';
import { ListItem, EmptyState } from '../../components/Shared';
import { ListHeader } from '../../components/ui';
import { useLanguage } from '../../i18n/LanguageContext';
import { colors } from '../../theme';

export default function DuesOverviewScreen({ navigation }: any) {
    const { t } = useLanguage();
    const { somitiId } = useSomiti();
    const [data, setData] = useState<any>(null);
    const [refreshing, setRefreshing] = useState(false);

    const fetch = async () => {
        if (!somitiId) return;
        try {
            const { data } = await client.get(`/somitis/${somitiId}/dues`);
            setData(data);
        } catch {}
    };

    useFocusEffect(useCallback(() => { fetch(); }, [somitiId]));

    if (!data) return <View style={styles.center}><ActivityIndicator size="large" /></View>;

    const cs = getCurrencySymbol();
    const totals = (data as any).totals || {};

    const openProfile = async (member: any) => {
        try {
            const { data } = await client.get(`/somitis/${somitiId}/reports/members/${member.user?.id}`);
            navigation.navigate('MemberProfile', { profile: data });
        } catch (err: any) {
            Alert.alert('Restricted', err.response?.status === 403 ? 'Only managers can view member profiles.' : 'Failed to load profile');
        }
    };

    return (
        <View style={styles.container}>
            <ListHeader title={t('duesOverview')} subtitle={t('whoPaidWhoOwes')} />

            <View style={styles.summary}>
                <View style={styles.summaryItem}>
                    <Text style={styles.summaryLabel}>{t('expected')}</Text>
                    <Text style={styles.summaryValue}>{cs}{Number(totals.expected || 0).toLocaleString()}</Text>
                </View>
                <View style={styles.summaryItem}>
                    <Text style={styles.summaryLabel}>{t('paid')}</Text>
                    <Text style={[styles.summaryValue, { color: '#10b981' }]}>{cs}{Number(totals.paid || 0).toLocaleString()}</Text>
                </View>
                <View style={styles.summaryItem}>
                    <Text style={styles.summaryLabel}>{t('overdue')}</Text>
                    <Text style={[styles.summaryValue, { color: (totals.overdue_months || 0) > 0 ? '#ef4444' : '#94a3b8' }]}>{totals.overdue_months || 0} mo</Text>
                </View>
            </View>

            <Text style={styles.section}>{t('membersCount')} ({data.members?.length || 0})</Text>
            <FlatList
                data={data.members || []}
                keyExtractor={(m) => m.user?.id?.toString() || Math.random().toString()}
                renderItem={({ item }) => (
                    <ListItem
                        title={item.user?.name || `${t('member')} #${item.user?.id}`}
                        subtitle={`${t('paid')} ${cs}${Number(item.total_paid || 0).toLocaleString()} / ${cs}${Number(item.total_expected || 0).toLocaleString()} • ${item.overdue_count || 0} ${t('overdueStatus')}`}
                        right={
                            (item.overdue_count || 0) > 0
                                ? <Text style={styles.overdue}>{t('overdue')}</Text>
                                : <Text style={styles.ok}>{t('paidStatus')}</Text>
                        }
                        onPress={() => openProfile(item)}
                    />
                )}
                ListEmptyComponent={<EmptyState message={t('noActiveMembers')} />}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await fetch(); setRefreshing(false); }} />}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingHorizontal: 20, paddingBottom: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f1f5f9'
    },
    title: { fontSize: 24, fontWeight: 'bold', color: '#1e293b' },
    summary: { flexDirection: 'row', backgroundColor: '#fff', margin: 16, marginBottom: 8, borderRadius: 12, padding: 16, gap: 12 },
    summaryItem: { flex: 1, alignItems: 'center' },
    summaryLabel: { fontSize: 12, color: '#94a3b8', marginBottom: 4 },
    summaryValue: { fontSize: 16, fontWeight: 'bold', color: '#1e293b' },
    section: { fontSize: 14, fontWeight: '700', color: '#64748b', paddingHorizontal: 20, paddingVertical: 8, textTransform: 'uppercase' },
    overdue: { color: '#ef4444', fontSize: 12, fontWeight: 'bold' },
    ok: { color: '#10b981', fontSize: 12, fontWeight: 'bold' },
});
