import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView } from 'react-native';
import client from '../../api/client';
import { useSomiti } from '../../hooks/useSomiti';
import { SelectField } from '../../components/SelectField';

export default function UserShareCreateScreen({ navigation }: any) {
    const { somitiId } = useSomiti();
    const [userId, setUserId] = useState(''); const [shareCount, setShareCount] = useState('1');
    const [fyId, setFyId] = useState(''); const [submitting, setSubmitting] = useState(false);
    const [members, setMembers] = useState<{ label: string; value: string }[]>([]);
    const [fys, setFys] = useState<{ label: string; value: string }[]>([]);

    useEffect(() => {
        if (!somitiId) return;
        client.get(`/somitis/${somitiId}/members`).then(({ data }) => {
            setMembers((data || []).map((m: any) => ({ label: `${m.name} (#${m.id})`, value: m.id.toString() })));
        }).catch(() => {});
        client.get(`/somitis/${somitiId}/financial-years`).then(({ data }) => {
            setFys((data || []).map((fy: any) => ({ label: fy.title, value: fy.id.toString() })));
        }).catch(() => {});
    }, [somitiId]);

    const submit = async () => {
        if (!userId || !fyId) { Alert.alert('Error', 'Select member and FY'); return; }
        setSubmitting(true);
        try {
            await client.post('/shares', { somiti_id: somitiId, user_id: parseInt(userId), share_count: parseInt(shareCount), financial_year_id: parseInt(fyId) });
            Alert.alert('Success', 'Shares assigned'); navigation.goBack();
        } catch (err: any) { Alert.alert('Error', err.response?.data?.message || 'Failed'); }
        finally { setSubmitting(false); }
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.back}>← Back</Text></TouchableOpacity>
            <Text style={styles.title}>Assign Shares</Text>

            <SelectField label="Member" value={userId} options={members} onSelect={setUserId} placeholder="Select member" />
            <SelectField label="Financial Year" value={fyId} options={fys} onSelect={setFyId} placeholder="Select FY" />

            <TextInput style={styles.input} placeholder="Share Count" value={shareCount} onChangeText={setShareCount} keyboardType="number-pad" />
            <TouchableOpacity style={styles.submitBtn} onPress={submit} disabled={submitting}>
                {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>Assign Shares</Text>}
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' }, content: { padding: 20, paddingTop: 60 },
    back: { fontSize: 16, color: '#2563eb', marginBottom: 16 }, title: { fontSize: 28, fontWeight: 'bold', color: '#1e293b', marginBottom: 24 },
    input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, padding: 16, fontSize: 16, marginBottom: 16 },
    submitBtn: { backgroundColor: '#2563eb', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 8 },
    submitText: { color: '#fff', fontSize: 18, fontWeight: '600' },
});
