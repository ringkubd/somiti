import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView } from 'react-native';
import client from '../../api/client';
import { useSomiti } from '../../hooks/useSomiti';

export default function WithdrawalCreateScreen({ navigation }: any) {
    const { somitiId } = useSomiti();
    const [amount, setAmount] = useState('');
    const [reason, setReason] = useState('');
    const [method, setMethod] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const submit = async () => {
        if (!amount) { Alert.alert('Error', 'Amount required'); return; }
        setSubmitting(true);
        try {
            await client.post('/withdrawals', {
                somiti_id: somitiId,
                amount: parseFloat(amount),
                reason: reason || undefined,
                method: method || undefined,
            });
            Alert.alert('Success', 'Withdrawal request submitted');
            navigation.goBack();
        } catch (err: any) {
            Alert.alert('Error', err.response?.data?.errors?.amount?.[0] || err.response?.data?.message || 'Failed');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.back}>← Back</Text></TouchableOpacity>
            <Text style={styles.title}>Withdraw Savings</Text>
            <Text style={styles.hint}>Withdrawals need manager approval.</Text>
            <TextInput style={styles.input} placeholder="Amount" value={amount} onChangeText={setAmount} keyboardType="decimal-pad" />
            <TextInput style={styles.input} placeholder="Method (cash / bKash / bank…)" value={method} onChangeText={setMethod} />
            <TextInput style={[styles.input, { height: 80 }]} placeholder="Reason (optional)" value={reason} onChangeText={setReason} multiline />
            <TouchableOpacity style={styles.submitBtn} onPress={submit} disabled={submitting}>
                {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>Request Withdrawal</Text>}
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    content: { padding: 20, paddingTop: 20 },
    back: { fontSize: 16, color: '#2563eb', marginBottom: 12 },
    title: { fontSize: 26, fontWeight: 'bold', color: '#1e293b', marginBottom: 8 },
    hint: { fontSize: 13, color: '#64748b', marginBottom: 20 },
    input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, padding: 14, fontSize: 15, marginBottom: 12 },
    submitBtn: { backgroundColor: '#2563eb', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 8 },
    submitText: { color: '#fff', fontSize: 17, fontWeight: '600' },
});
