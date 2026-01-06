import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';

export const DepositScreen = () => {
    const [amount, setAmount] = useState('');
    const [month, setMonth] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!amount || !month) {
            Alert.alert('Error', 'Please fill all fields');
            return;
        }

        setLoading(true);
        try {
            // Mock API call
            // await axios.post('/api/deposits', { amount, month, type: 'monthly', somiti_id: 1 });
            setTimeout(() => {
                Alert.alert('Success', 'Deposit request submitted successfully!');
                setAmount('');
                setMonth('');
                setLoading(false);
            }, 1000);
        } catch (error) {
            Alert.alert('Error', 'Failed to submit request');
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>New Deposit Request</Text>

            <View style={styles.formGroup}>
                <Text style={styles.label}>Amount (৳)</Text>
                <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    value={amount}
                    onChangeText={setAmount}
                    placeholder="e.g. 500"
                />
            </View>

            <View style={styles.formGroup}>
                <Text style={styles.label}>Month</Text>
                <TextInput
                    style={styles.input}
                    value={month}
                    onChangeText={setMonth}
                    placeholder="e.g. January 2024"
                />
            </View>

            <TouchableOpacity
                style={[styles.button, loading && styles.disabled]}
                onPress={handleSubmit}
                disabled={loading}
            >
                <Text style={styles.buttonText}>{loading ? 'Submitting...' : 'Submit Request'}</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: 'white' },
    title: { fontSize: 22, fontWeight: 'bold', marginBottom: 30, textAlign: 'center' },
    formGroup: { marginBottom: 20 },
    label: { fontSize: 16, marginBottom: 8, color: '#333' },
    input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, fontSize: 16 },
    button: { backgroundColor: '#1976d2', padding: 15, borderRadius: 8, alignItems: 'center' },
    disabled: { backgroundColor: '#90caf9' },
    buttonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
});
