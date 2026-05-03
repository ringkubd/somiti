import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView } from 'react-native';
import client from '../../api/client';
import { useSomiti } from '../../hooks/useSomiti';
import { SelectField } from '../../components/SelectField';

export default function InvestmentCreateScreen({ navigation }: any) {
    const { somitiId } = useSomiti();
    const [fyId, setFyId] = useState(''); const [type, setType] = useState('business');
    const [amount, setAmount] = useState(''); const [startDate, setStartDate] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [fys, setFys] = useState<{ label: string; value: string }[]>([]);

    useEffect(() => {
        if (!somitiId) return;
        client.get(`/somitis/${somitiId}/financial-years`).then(({ data }) => {
            setFys((data || []).map((fy: any) => ({ label: fy.title, value: fy.id.toString() })));
        }).catch(() => {});
    }, [somitiId]);

    const submit = async () => {
        if (!amount) { Alert.alert('Error', 'Amount required'); return; }
        setSubmitting(true);
        try {
            await client.post('/investments', { somiti_id: somitiId, financial_year_id: parseInt(fyId) || undefined, type, amount: parseFloat(amount), start_date: startDate || undefined });
            Alert.alert('Success', 'Investment submitted'); navigation.goBack();
        } catch (err: any) { Alert.alert('Error', err.response?.data?.message || 'Failed'); }
        finally { setSubmitting(false); }
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.back}>← Back</Text></TouchableOpacity>
            <Text style={styles.title}>New Investment</Text>

            <SelectField label="Financial Year" value={fyId} options={fys} onSelect={setFyId} placeholder="Select FY" />

            <View style={styles.row}>
                {['business', 'fdr', 'stock', 'other'].map(t => (
                    <TouchableOpacity key={t} style={[styles.typeBtn, type === t && styles.typeActive]} onPress={() => setType(t)}>
                        <Text style={[styles.typeText, type === t && styles.typeTextActive]}>{t}</Text>
                    </TouchableOpacity>
                ))}
            </View>
            <TextInput style={styles.input} placeholder="Amount" value={amount} onChangeText={setAmount} keyboardType="decimal-pad" />
            <TextInput style={styles.input} placeholder="Start Date (YYYY-MM-DD)" value={startDate} onChangeText={setStartDate} />
            <TouchableOpacity style={styles.submitBtn} onPress={submit} disabled={submitting}>
                {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>Submit</Text>}
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' }, content: { padding: 20, paddingTop: 60 },
    back: { fontSize: 16, color: '#2563eb', marginBottom: 16 }, title: { fontSize: 28, fontWeight: 'bold', color: '#1e293b', marginBottom: 24 },
    input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, padding: 16, fontSize: 16, marginBottom: 16 },
    row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
    typeBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: '#e2e8f0', backgroundColor: '#fff' },
    typeActive: { backgroundColor: '#2563eb', borderColor: '#2563eb' }, typeText: { color: '#64748b', fontWeight: '600' },
    typeTextActive: { color: '#fff' }, submitBtn: { backgroundColor: '#2563eb', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 8 },
    submitText: { color: '#fff', fontSize: 18, fontWeight: '600' },
});
