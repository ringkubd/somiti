import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView } from 'react-native';
import client from '../../api/client';
import { useSomiti } from '../../hooks/useSomiti';

export default function BankAccountCreateScreen({ navigation }: any) {
    const { somitiId } = useSomiti();
    const [bankName, setBankName] = useState(''); const [accountNumber, setAccountNumber] = useState('');
    const [type, setType] = useState('savings'); const [openingBalance, setOpeningBalance] = useState('0');
    const [submitting, setSubmitting] = useState(false);

    const submit = async () => {
        if (!bankName || !accountNumber) { Alert.alert('Error', 'Fill required fields'); return; }
        setSubmitting(true);
        try {
            await client.post('/bank-accounts', { somiti_id: somitiId, bank_name: bankName, account_number: accountNumber, account_type: type, opening_balance: parseFloat(openingBalance) });
            Alert.alert('Success', 'Bank account added'); navigation.goBack();
        } catch (err: any) { Alert.alert('Error', err.response?.data?.message || 'Failed'); }
        finally { setSubmitting(false); }
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.back}>← Back</Text></TouchableOpacity>
            <Text style={styles.title}>Add Bank Account</Text>
            <TextInput style={styles.input} placeholder="Bank Name" value={bankName} onChangeText={setBankName} />
            <TextInput style={styles.input} placeholder="Account Number" value={accountNumber} onChangeText={setAccountNumber} />
            <View style={styles.row}>
                {['savings', 'current', 'fd', 'loan'].map(t => (
                    <TouchableOpacity key={t} style={[styles.typeBtn, type === t && styles.typeActive]} onPress={() => setType(t)}>
                        <Text style={[styles.typeText, type === t && styles.typeTextActive]}>{t}</Text>
                    </TouchableOpacity>
                ))}
            </View>
            <TextInput style={styles.input} placeholder="Opening Balance" value={openingBalance} onChangeText={setOpeningBalance} keyboardType="decimal-pad" />
            <TouchableOpacity style={styles.submitBtn} onPress={submit} disabled={submitting}>
                {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>Add Account</Text>}
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
