import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { getCurrencySymbol } from '../../hooks/useSomiti';
import { useLanguage } from '../../i18n/LanguageContext';

const statusColor: Record<string, string> = { paid: '#10b981', partial: '#f59e0b', due: '#3b82f6', overdue: '#ef4444', future: '#94a3b8' };

export default function MemberDuesScreen({ route, navigation }: any) {
    const { t } = useLanguage();
    const member = route.params?.member;
    const cs = getCurrencySymbol();

    if (!member) return <View style={styles.center}><Text>{t('noData')}</Text></View>;

    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                <Text style={styles.back}>← {t('back')}</Text>
            </TouchableOpacity>
            <View style={styles.header}>
                <Text style={styles.title}>{member.user?.name}</Text>
                <Text style={styles.sub}>{t('paid')} {cs}{Number(member.total_paid || 0).toLocaleString()} {t('of')} {cs}{Number(member.total_expected || 0).toLocaleString()}</Text>
            </View>
            <FlatList
                data={member.months || []}
                keyExtractor={(m) => m.month_key}
                renderItem={({ item }) => (
                    <View style={styles.row}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.month}>{item.month_label}</Text>
                            <Text style={styles.amount}>{cs}{Number(item.paid || 0).toLocaleString()} / {cs}{Number(item.expected || 0).toLocaleString()}</Text>
                        </View>
                        <View style={[styles.pill, { backgroundColor: statusColor[item.status] || '#94a3b8' }]}>
                            <Text style={styles.pillText}>{item.status.toUpperCase()}</Text>
                        </View>
                    </View>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    backBtn: { padding: 20, paddingBottom: 0 },
    back: { fontSize: 16, color: '#2563eb' },
    header: { padding: 20 },
    title: { fontSize: 24, fontWeight: 'bold', color: '#1e293b' },
    sub: { fontSize: 14, color: '#64748b', marginTop: 4 },
    row: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 16,
        borderBottomWidth: 1, borderBottomColor: '#f1f5f9'
    },
    month: { fontSize: 15, fontWeight: '600', color: '#1e293b' },
    amount: { fontSize: 13, color: '#64748b', marginTop: 3 },
    pill: { borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4 },
    pillText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
});
