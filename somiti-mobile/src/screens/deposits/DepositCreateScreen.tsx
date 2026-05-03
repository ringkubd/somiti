import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView } from 'react-native';
import client from '../../api/client';
import { useSomiti } from '../../hooks/useSomiti';
import { SelectField } from '../../components/SelectField';

const months = [
    { label: 'January', value: 'January' }, { label: 'February', value: 'February' },
    { label: 'March', value: 'March' }, { label: 'April', value: 'April' },
    { label: 'May', value: 'May' }, { label: 'June', value: 'June' },
    { label: 'July', value: 'July' }, { label: 'August', value: 'August' },
    { label: 'September', value: 'September' }, { label: 'October', value: 'October' },
    { label: 'November', value: 'November' }, { label: 'December', value: 'December' },
];

export default function DepositCreateScreen({ navigation }: any) {
    const { somitiId } = useSomiti();
    const [amount, setAmount] = useState('');
    const [type, setType] = useState('monthly');
    const [month, setMonth] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const submit = async () => {
        if (!amount) { Alert.alert('Error', 'Amount required'); return; }
        setSubmitting(true);
        try {
            await client.post('/deposits', { somiti_id: somitiId, amount: parseFloat(amount), type, month: month || undefined });
            Alert.alert('Success', 'Deposit submitted');
            navigation.goBack();
        } catch (err: any) { Alert.alert('Error', err.response?.data?.message || 'Failed'); }
        finally { setSubmitting(false); }
    };

    return (
            <ScrollView style={styles.container} contentContainerStyle={styles.content}>
                <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.back}>← Back</Text></TouchableOpacity>
                <Text style={styles.title}>New Deposit</Text>

                <TextInput style={styles.input} placeholder="Amount" value={amount} onChangeText={setAmount} keyboardType="decimal-pad" />

                <View style={styles.row}>
                    {['monthly', 'dps'].map(t => (
                        <TouchableOpacity key={t} style={[styles.typeBtn, type === t && styles.typeBtnActive]} onPress={() => setType(t)}>
                            <Text style={[styles.typeText, type === t && styles.typeTextActive]}>{t.toUpperCase()}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <SelectField label="Month" value={month} options={months} onSelect={setMonth} placeholder="Select month" />

                <TouchableOpacity style={styles.submitBtn} onPress={submit} disabled={submitting}>
                    {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>Submit Deposit</Text>}
                </TouchableOpacity>
            </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    content: { padding: 20, paddingTop: 20 },
    back: { fontSize: 16, color: '#2563eb', marginBottom: 16 },
    title: { fontSize: 28, fontWeight: 'bold', color: '#1e293b', marginBottom: 24 },
    input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, padding: 16, fontSize: 16, marginBottom: 16 },
    row: { flexDirection: 'row', gap: 12, marginBottom: 16 },
    typeBtn: { flex: 1, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#e2e8f0', alignItems: 'center', backgroundColor: '#fff' },
    typeBtnActive: { backgroundColor: '#2563eb', borderColor: '#2563eb' },
    typeText: { fontWeight: '600', color: '#64748b' },
    typeTextActive: { color: '#fff' },
    submitBtn: { backgroundColor: '#2563eb', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 8 },
    submitText: { color: '#fff', fontSize: 18, fontWeight: '600' },
});
