import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView, Switch } from 'react-native';
import client from '../../api/client';

export default function SomitiSettingsScreen({ route, navigation }: any) {
    const somitiId = route.params?.id;
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState<any>({});

    useEffect(() => {
        (async () => {
            try {
                const { data } = await client.get(`/somitis/${somitiId}/settings`);
                setForm(data);
            } catch (err: any) {
                Alert.alert('Error', err.response?.data?.message || 'Failed to load settings');
            } finally {
                setLoading(false);
            }
        })();
    }, [somitiId]);

    const set = (key: string, value: any) => setForm((f: any) => ({ ...f, [key]: value }));

    const save = async () => {
        setSaving(true);
        try {
            await client.put(`/somitis/${somitiId}/settings`, {
                currency: form.currency,
                currency_symbol: form.currency_symbol,
                receipt_header: form.receipt_header,
                receipt_footer: form.receipt_footer,
                phone: form.phone,
                address: form.address,
                default_interest_rate: parseFloat(form.default_interest_rate) || 0,
                total_shares: parseInt(form.total_shares) || 0,
                min_share_per_member: parseInt(form.min_share_per_member) || 0,
                max_share_per_member: parseInt(form.max_share_per_member) || 0,
                loan_penalty_rate: parseFloat(form.loan_penalty_rate) || 0,
                loan_grace_days: parseInt(form.loan_grace_days) || 0,
            });
            Alert.alert('Success', 'Settings saved');
        } catch (err: any) {
            Alert.alert('Error', err.response?.data?.message || 'Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <View style={styles.center}><ActivityIndicator size="large" /></View>;

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.back}>← Back</Text></TouchableOpacity>
            <Text style={styles.title}>Somiti Settings</Text>

            <Text style={styles.section}>General</Text>
            <TextInput style={styles.input} placeholder="Currency code (e.g. BDT, USD)" value={form.currency || ''} onChangeText={(v) => set('currency', v)} />
            <TextInput style={styles.input} placeholder="Currency symbol (e.g. ৳, $)" value={form.currency_symbol || ''} onChangeText={(v) => set('currency_symbol', v)} />
            <TextInput style={styles.input} placeholder="Phone" value={form.phone || ''} onChangeText={(v) => set('phone', v)} keyboardType="phone-pad" />
            <TextInput style={styles.input} placeholder="Address" value={form.address || ''} onChangeText={(v) => set('address', v)} multiline />

            <Text style={styles.section}>Receipt</Text>
            <TextInput style={[styles.input, { height: 60 }]} placeholder="Receipt header" value={form.receipt_header || ''} onChangeText={(v) => set('receipt_header', v)} multiline />
            <TextInput style={[styles.input, { height: 60 }]} placeholder="Receipt footer" value={form.receipt_footer || ''} onChangeText={(v) => set('receipt_footer', v)} multiline />

            <Text style={styles.section}>Shares & Loans</Text>
            <View style={styles.row}>
                <TextInput style={[styles.input, { flex: 1 }]} placeholder="Total shares" value={String(form.total_shares ?? '')} onChangeText={(v) => set('total_shares', v)} keyboardType="number-pad" />
                <TextInput style={[styles.input, { flex: 1 }]} placeholder="Min share/member" value={String(form.min_share_per_member ?? '')} onChangeText={(v) => set('min_share_per_member', v)} keyboardType="number-pad" />
            </View>
            <View style={styles.row}>
                <TextInput style={[styles.input, { flex: 1 }]} placeholder="Max share/member" value={String(form.max_share_per_member ?? '')} onChangeText={(v) => set('max_share_per_member', v)} keyboardType="number-pad" />
                <TextInput style={[styles.input, { flex: 1 }]} placeholder="Interest rate %" value={String(form.default_interest_rate ?? '')} onChangeText={(v) => set('default_interest_rate', v)} keyboardType="decimal-pad" />
            </View>
            <View style={styles.row}>
                <TextInput style={[styles.input, { flex: 1 }]} placeholder="Loan penalty rate %" value={String(form.loan_penalty_rate ?? '')} onChangeText={(v) => set('loan_penalty_rate', v)} keyboardType="decimal-pad" />
                <TextInput style={[styles.input, { flex: 1 }]} placeholder="Loan grace days" value={String(form.loan_grace_days ?? '')} onChangeText={(v) => set('loan_grace_days', v)} keyboardType="number-pad" />
            </View>

            <TouchableOpacity style={styles.saveBtn} onPress={save} disabled={saving}>
                {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveText}>Save Settings</Text>}
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    content: { padding: 20, paddingTop: 20, paddingBottom: 60 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    back: { fontSize: 16, color: '#2563eb', marginBottom: 12 },
    title: { fontSize: 26, fontWeight: 'bold', color: '#1e293b', marginBottom: 20 },
    section: { fontSize: 15, fontWeight: '700', color: '#64748b', marginTop: 12, marginBottom: 10, textTransform: 'uppercase' },
    input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, padding: 14, fontSize: 15, marginBottom: 12 },
    row: { flexDirection: 'row', gap: 12 },
    saveBtn: { backgroundColor: '#2563eb', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 20 },
    saveText: { color: '#fff', fontSize: 17, fontWeight: '600' },
});
