import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView } from 'react-native';
import client from '../../api/client';
import { useSomiti } from '../../hooks/useSomiti';
import { SelectField } from '../../components/SelectField';

export default function PenaltyCreateScreen({ navigation }: any) {
    const { somitiId } = useSomiti();
    const [members, setMembers] = useState<any[]>([]);
    const [userId, setUserId] = useState<string | null>(null);
    const [type, setType] = useState('late_deposit');
    const [amount, setAmount] = useState('');
    const [notes, setNotes] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!somitiId) return;
        client.get(`/somitis/${somitiId}/members`).then(({ data }) => {
            setMembers((data || []).map((m: any) => ({ label: m.name, value: m.id })));
        }).catch(() => {});
    }, [somitiId]);

    const submit = async () => {
        if (!userId || !amount) { Alert.alert('Error', 'Member and amount required'); return; }
        setSubmitting(true);
        try {
            await client.post('/penalties', {
                somiti_id: somitiId,
                user_id: parseInt(userId),
                type,
                amount: parseFloat(amount),
                notes: notes || undefined,
            });
            Alert.alert('Success', 'Penalty submitted for approval');
            navigation.goBack();
        } catch (err: any) {
            Alert.alert('Error', err.response?.data?.message || 'Failed');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.back}>← Back</Text></TouchableOpacity>
            <Text style={styles.title}>Add Penalty</Text>
            <SelectField label="Member" value={userId} options={members} onSelect={setUserId} placeholder="Select member" />
            <SelectField
                label="Type"
                value={type}
                options={[
                    { label: 'Late deposit', value: 'late_deposit' },
                    { label: 'Loan default', value: 'loan_default' },
                    { label: 'Other', value: 'other' },
                ]}
                onSelect={setType}
            />
            <TextInput style={styles.input} placeholder="Amount" value={amount} onChangeText={setAmount} keyboardType="decimal-pad" />
            <TextInput style={[styles.input, { height: 80 }]} placeholder="Notes (optional)" value={notes} onChangeText={setNotes} multiline />
            <TouchableOpacity style={styles.submitBtn} onPress={submit} disabled={submitting}>
                {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>Submit Penalty</Text>}
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    content: { padding: 20, paddingTop: 20 },
    back: { fontSize: 16, color: '#2563eb', marginBottom: 12 },
    title: { fontSize: 26, fontWeight: 'bold', color: '#1e293b', marginBottom: 20 },
    input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, padding: 14, fontSize: 15, marginBottom: 12 },
    submitBtn: { backgroundColor: '#2563eb', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 8 },
    submitText: { color: '#fff', fontSize: 17, fontWeight: '600' },
});
