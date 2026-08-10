import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView } from 'react-native';
import client from '../../api/client';
import { useSomiti } from '../../hooks/useSomiti';
import { useLanguage } from '../../i18n/LanguageContext';

export default function ManagerAddScreen({ navigation }: any) {
    const { t } = useLanguage();
    const { somitiId } = useSomiti();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [selected, setSelected] = useState<any>(null);
    const [fromDate, setFromDate] = useState(new Date().toISOString().slice(0, 10));
    const [toDate, setToDate] = useState('');
    const [note, setNote] = useState('');
    const [searching, setSearching] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const search = async () => {
        if (!query.trim()) { Alert.alert(t('error'), t('enterNamePhoneEmail')); return; }
        setSearching(true);
        try {
            const { data } = await client.get('/users/search', { params: { q: query.trim() } });
            setResults(data || []);
        } catch (err: any) {
            Alert.alert(t('error'), err.response?.data?.message || t('searchFailed'));
        } finally {
            setSearching(false);
        }
    };

    const submit = async () => {
        if (!selected) { Alert.alert(t('error'), t('selectUser')); return; }
        setSubmitting(true);
        try {
            await client.post(`/somitis/${somitiId}/manager-elections`, {
                candidate_user_id: selected.id,
                from_date: fromDate,
                to_date: toDate || undefined,
                note: note || undefined,
            });
            Alert.alert(t('done'), `${t('electionStarted')} ${selected.name}`);
            navigation.goBack();
        } catch (err: any) {
            Alert.alert(t('error'), err.response?.data?.errors?.candidate_user_id?.[0] || err.response?.data?.message || t('failed'));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.back}>← {t('back')}</Text></TouchableOpacity>
            <Text style={styles.title}>{t('appointManager')}</Text>
            <Text style={styles.hint}>{t('managerTenureHint')}</Text>

            <View style={styles.searchRow}>
                <TextInput style={[styles.input, { flex: 1, marginBottom: 0 }]} placeholder={t('namePhoneEmail')} value={query} onChangeText={setQuery} autoCapitalize="none" />
                <TouchableOpacity style={styles.searchBtn} onPress={search} disabled={searching}>
                    {searching ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.searchBtnText}>{t('search')}</Text>}
                </TouchableOpacity>
            </View>

            {results.length > 0 && (
                <View style={styles.results}>
                    {results.map((u) => (
                        <TouchableOpacity key={u.id} style={[styles.result, selected?.id === u.id && styles.resultActive]} onPress={() => setSelected(u)}>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.resultName}>{u.name}</Text>
                                <Text style={styles.resultSub}>{u.phone || u.email || ''}</Text>
                            </View>
                            {selected?.id === u.id && <Text style={styles.check}>✓</Text>}
                        </TouchableOpacity>
                    ))}
                </View>
            )}

            <TextInput style={styles.input} placeholder={t('fromDatePlaceholder')} value={fromDate} onChangeText={setFromDate} autoCapitalize="none" />
            <TextInput style={styles.input} placeholder={t('toDatePlaceholder')} value={toDate} onChangeText={setToDate} autoCapitalize="none" />
            <TextInput style={[styles.input, { height: 80 }]} placeholder={t('noteOptional')} value={note} onChangeText={setNote} multiline />

            <TouchableOpacity style={styles.submitBtn} onPress={submit} disabled={submitting || !selected}>
                {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>{t('appointManager')}</Text>}
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    content: { padding: 20, paddingBottom: 60 },
    back: { fontSize: 16, color: '#2563eb', marginBottom: 12 },
    title: { fontSize: 26, fontWeight: 'bold', color: '#1e293b', marginBottom: 8 },
    hint: { fontSize: 13, color: '#64748b', marginBottom: 16 },
    searchRow: { flexDirection: 'row', gap: 10, alignItems: 'center', marginBottom: 16 },
    input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, padding: 14, fontSize: 15, marginBottom: 12 },
    searchBtn: { backgroundColor: '#2563eb', borderRadius: 12, paddingHorizontal: 18, paddingVertical: 14, justifyContent: 'center' },
    searchBtnText: { color: '#fff', fontWeight: '600' },
    results: { backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 16, overflow: 'hidden' },
    result: { flexDirection: 'row', alignItems: 'center', padding: 14, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
    resultActive: { backgroundColor: '#eff6ff' },
    resultName: { fontSize: 15, fontWeight: '600', color: '#1e293b' },
    resultSub: { fontSize: 12, color: '#94a3b8', marginTop: 2 },
    check: { fontSize: 18, color: '#2563eb', fontWeight: 'bold' },
    submitBtn: { backgroundColor: '#2563eb', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 8 },
    submitText: { color: '#fff', fontSize: 17, fontWeight: '600' },
});
