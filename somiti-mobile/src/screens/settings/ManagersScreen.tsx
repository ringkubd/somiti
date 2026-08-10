import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl, Alert, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import client from '../../api/client';
import { useSomiti } from '../../hooks/useSomiti';
import { ListItem, EmptyState } from '../../components/Shared';
import { ListHeader } from '../../components/ui';
import { useLanguage } from '../../i18n/LanguageContext';
import { colors } from '../../theme';

export default function ManagersScreen({ navigation }: any) {
    const { t } = useLanguage();
    const { somitiId } = useSomiti();
    const [managers, setManagers] = useState<any[]>([]);
    const [elections, setElections] = useState<any[]>([]);
    const [refreshing, setRefreshing] = useState(false);

    const fetch = async () => {
        if (!somitiId) return;
        try {
            const [m, e] = await Promise.all([
                client.get(`/somitis/${somitiId}/managers`),
                client.get(`/somitis/${somitiId}/manager-elections`),
            ]);
            setManagers(m.data || []);
            setElections(e.data || []);
        } catch {}
    };

    useFocusEffect(useCallback(() => { fetch(); }, [somitiId]));

    const endTenure = (m: any) => {
        Alert.alert('End Tenure', `End ${m.user?.name}'s manager tenure?`, [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'End', style: 'destructive',
                onPress: async () => {
                    try {
                        await client.delete(`/somitis/${somitiId}/managers/${m.id}`);
                        Alert.alert('Done', 'Tenure ended');
                        fetch();
                    } catch (err: any) {
                        Alert.alert('Error', err.response?.data?.message || 'Failed');
                    }
                },
            },
        ]);
    };

    const isCurrent = (m: any) => !m.to_date || new Date(m.to_date) >= new Date(new Date().toDateString());

    const vote = async (election: any, decision: string) => {
        try {
            await client.post('/approvals/vote', {
                approvable_type: 'App\\Models\\ManagerElection',
                approvable_id: election.id,
                decision,
                comment: '',
            });
            Alert.alert('Done', `Vote recorded`);
            fetch();
        } catch (err: any) {
            Alert.alert('Error', err.response?.data?.errors?.approvable?.[0] || err.response?.data?.message || 'Failed');
        }
    };

    return (
        <View style={styles.container}>
            <ListHeader title={t('managers')} subtitle={t('appointManagers')} actionLabel={t('nominate')} onAction={() => navigation.navigate('ManagerAdd')} />
            <FlatList
                ListHeaderComponent={
                    elections.length > 0 ? (
                        <View style={styles.elections}>
                            <Text style={styles.sectionTitle}>{t('elections')}</Text>
                            {elections.map((e) => {
                                const yes = (e.approvals || []).filter((a: any) => a.status === 'approved').length;
                                const no = (e.approvals || []).filter((a: any) => a.status === 'rejected').length;
                                const done = e.status !== 'pending';
                                return (
                                    <View key={e.id} style={styles.electionCard}>
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.electionTitle}>{e.candidate?.name || `User #${e.candidate_user_id}`}</Text>
                                            <Text style={styles.electionSub}>
                                                {e.from_date}{e.to_date ? ` → ${e.to_date}` : ''} • {done ? e.status.toUpperCase() : `Yes ${yes} · No ${no}`}
                                            </Text>
                                        </View>
                                        {!done && (
                                            <View style={styles.voteRow}>
                                                <TouchableOpacity style={[styles.voteBtn, { backgroundColor: '#10b981' }]} onPress={() => vote(e, 'approved')}>
                                                    <Text style={styles.voteText}>{t('approve')}</Text>
                                                </TouchableOpacity>
                                                <TouchableOpacity style={[styles.voteBtn, { backgroundColor: '#ef4444' }]} onPress={() => vote(e, 'rejected')}>
                                                    <Text style={styles.voteText}>{t('reject')}</Text>
                                                </TouchableOpacity>
                                            </View>
                                        )}
                                    </View>
                                );
                            })}
                        </View>
                    ) : null
                }
                data={managers}
                keyExtractor={(m) => m.id.toString()}
                renderItem={({ item }) => (
                    <ListItem
                        title={item.user?.name || `User #${item.user_id}`}
                        subtitle={`${item.from_date}${item.to_date ? ` → ${item.to_date}` : ' → present'}`}
                        right={
                            isCurrent(item)
                                ? <TouchableOpacity onPress={() => endTenure(item)}><Text style={styles.end}>End</Text></TouchableOpacity>
                                : <Text style={styles.past}>PAST</Text>
                        }
                    />
                )}
                ListEmptyComponent={<EmptyState message={t('noManagers')} action={t('appointManager')} onAction={() => navigation.navigate('ManagerAdd')} />}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await fetch(); setRefreshing(false); }} />}
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
    end: { color: '#ef4444', fontSize: 13, fontWeight: '700' },
    past: { color: '#94a3b8', fontSize: 12, fontWeight: '600' },
    elections: { padding: 16, paddingBottom: 4 },
    sectionTitle: { fontSize: 13, fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: 8 },
    electionCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 8 },
    electionTitle: { fontSize: 15, fontWeight: '600', color: '#1e293b' },
    electionSub: { fontSize: 12, color: '#64748b', marginTop: 3 },
    voteRow: { flexDirection: 'row', gap: 8 },
    voteBtn: { borderRadius: 8, paddingHorizontal: 12, paddingVertical: 7 },
    voteText: { color: '#fff', fontSize: 12, fontWeight: '700' },
});
