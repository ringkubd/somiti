import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView } from 'react-native';
import client from '../../api/client';
import { useSomiti } from '../../hooks/useSomiti';
import { SelectField } from '../../components/SelectField';

export default function MemberAddScreen({ navigation }: any) {
    const { somitiId } = useSomiti();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [searching, setSearching] = useState(false);
    const [selected, setSelected] = useState<any>(null);
    const [role, setRole] = useState('member');
    const [submitting, setSubmitting] = useState(false);

    const search = async () => {
        if (!query.trim()) { Alert.alert('Error', 'Enter a name, phone, or email'); return; }
        setSearching(true);
        try {
            const { data } = await client.get('/users/search', { params: { q: query.trim() } });
            setResults(data || []);
        } catch (err: any) {
            Alert.alert('Error', err.response?.data?.message || 'Search failed');
        } finally {
            setSearching(false);
        }
    };

    const add = async () => {
        if (!selected) { Alert.alert('Error', 'Select a user from search results'); return; }
        setSubmitting(true);
        try {
            await client.post(`/somitis/${somitiId}/users`, { user_id: selected.id, role });
            Alert.alert('Success', `${selected.name} added as ${role}`);
            navigation.goBack();
        } catch (err: any) {
            Alert.alert('Error', err.response?.data?.message || 'Failed to add member');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.back}>← Back</Text></TouchableOpacity>
            <Text style={styles.title}>Add Member</Text>
            <Text style={styles.hint}>Search by name, phone, or email. The user must already have an account.</Text>

            <View style={styles.searchRow}>
                <TextInput style={[styles.input, { flex: 1, marginBottom: 0 }]} placeholder="Name, phone, or email" value={query} onChangeText={setQuery} autoCapitalize="none" />
                <TouchableOpacity style={styles.searchBtn} onPress={search} disabled={searching}>
                    {searching ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.searchBtnText}>Search</Text>}
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

            {selected && (
                <>
                    <Text style={styles.selectedLabel}>Adding: <Text style={styles.selectedName}>{selected.name}</Text></Text>
                    <SelectField
                        label="Role"
                        value={role}
                        options={[
                            { label: 'Member', value: 'member' },
                            { label: 'Manager', value: 'manager' },
                        ]}
                        onSelect={setRole}
                    />
                </>
            )}

            <TouchableOpacity style={styles.addBtn} onPress={add} disabled={submitting || !selected}>
                {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.addBtnText}>Add to Somiti</Text>}
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
    input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, padding: 14, fontSize: 15 },
    searchBtn: { backgroundColor: '#2563eb', borderRadius: 12, paddingHorizontal: 18, paddingVertical: 14, justifyContent: 'center' },
    searchBtnText: { color: '#fff', fontWeight: '600' },
    results: { backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 16, overflow: 'hidden' },
    result: { flexDirection: 'row', alignItems: 'center', padding: 14, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
    resultActive: { backgroundColor: '#eff6ff' },
    resultName: { fontSize: 15, fontWeight: '600', color: '#1e293b' },
    resultSub: { fontSize: 12, color: '#94a3b8', marginTop: 2 },
    check: { fontSize: 18, color: '#2563eb', fontWeight: 'bold' },
    selectedLabel: { fontSize: 14, color: '#1e293b', marginBottom: 12 },
    selectedName: { fontWeight: '700' },
    addBtn: { backgroundColor: '#2563eb', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 8 },
    addBtnText: { color: '#fff', fontSize: 17, fontWeight: '600' },
});
