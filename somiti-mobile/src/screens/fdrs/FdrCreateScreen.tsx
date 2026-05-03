import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView } from 'react-native';
import client from '../../api/client';
import { useSomiti } from '../../hooks/useSomiti';

export default function FdrCreateScreen({ navigation }: any) {
    const { somitiId } = useSomiti();
    const [bankName, setBankName] = useState(''); const [interestRate, setInterestRate] = useState('');
    const [tenure, setTenure] = useState('12'); const [maturityAmount, setMaturityAmount] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const submit = async () => {
        if (!bankName) { Alert.alert('Error', 'Bank name required'); return; }
        setSubmitting(true);
        try {
            await client.post('/fdrs', { somiti_id: somitiId, bank_name: bankName, interest_rate: parseFloat(interestRate) || 0, tenure_months: parseInt(tenure), maturity_amount: parseFloat(maturityAmount) || 0 });
            Alert.alert('Success', 'FDR submitted'); navigation.goBack();
        } catch (err: any) { Alert.alert('Error', err.response?.data?.message || 'Failed'); }
        finally { setSubmitting(false); }
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.back}>← Back</Text></TouchableOpacity>
            <Text style={styles.title}>New FDR</Text>
            <TextInput style={styles.input} placeholder="Bank Name" value={bankName} onChangeText={setBankName} />
            <View style={styles.row}>
                <TextInput style={[styles.input, { flex: 1 }]} placeholder="Interest Rate %" value={interestRate} onChangeText={setInterestRate} keyboardType="decimal-pad" />
                <TextInput style={[styles.input, { flex: 1 }]} placeholder="Tenure (months)" value={tenure} onChangeText={setTenure} keyboardType="number-pad" />
            </View>
            <TextInput style={styles.input} placeholder="Maturity Amount" value={maturityAmount} onChangeText={setMaturityAmount} keyboardType="decimal-pad" />
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
    row: { flexDirection: 'row', gap: 12 }, submitBtn: { backgroundColor: '#2563eb', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 8 },
    submitText: { color: '#fff', fontSize: 18, fontWeight: '600' },
});
