import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView } from 'react-native';
import client from '../../api/client';
import { useSomiti } from '../../hooks/useSomiti';
import { SelectField } from '../../components/SelectField';

export default function DividendCreateScreen({ navigation }: any) {
    const { somitiId } = useSomiti();
    const [totalAmount, setTotalAmount] = useState('');
    const [distributionType, setDistributionType] = useState('share_based');
    const [financialYearId, setFinancialYearId] = useState<string | null>(null);
    const [years, setYears] = useState<any[]>([]);
    const [profitPeriod, setProfitPeriod] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!somitiId) return;
        client.get(`/somitis/${somitiId}/financial-years`).then(({ data }) => {
            setYears((data || []).map((y: any) => ({ label: y.title || y.name || `${y.start_date} – ${y.end_date}`, value: y.id })));
            const active = (data || []).find((y: any) => y.is_active);
            if (active) setFinancialYearId(String(active.id));
        }).catch(() => {});
    }, [somitiId]);

    const submit = async () => {
        if (!totalAmount || !financialYearId) { Alert.alert('Error', 'Amount and financial year required'); return; }
        setSubmitting(true);
        try {
            await client.post(`/somitis/${somitiId}/dividends`, {
                total_amount: parseFloat(totalAmount),
                distribution_type: distributionType,
                financial_year_id: parseInt(financialYearId),
                profit_period: profitPeriod || undefined,
            });
            Alert.alert('Success', 'Dividend declared');
            navigation.goBack();
        } catch (err: any) {
            Alert.alert('Error', err.response?.data?.errors?.distribution_type?.[0] || err.response?.data?.errors?.total_amount?.[0] || err.response?.data?.message || 'Failed');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.back}>← Back</Text></TouchableOpacity>
            <Text style={styles.title}>Declare Dividend</Text>
            <TextInput style={styles.input} placeholder="Total amount" value={totalAmount} onChangeText={setTotalAmount} keyboardType="decimal-pad" />
            <SelectField
                label="Distribution type"
                value={distributionType}
                options={[{ label: 'Share based', value: 'share_based' }]}
                onSelect={setDistributionType}
            />
            <SelectField
                label="Financial year"
                value={financialYearId}
                options={years}
                onSelect={setFinancialYearId}
                placeholder="Select financial year"
            />
            <TextInput style={styles.input} placeholder="Profit period (e.g. FY 2026)" value={profitPeriod} onChangeText={setProfitPeriod} />
            <TouchableOpacity style={styles.submitBtn} onPress={submit} disabled={submitting}>
                {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>Declare Dividend</Text>}
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
