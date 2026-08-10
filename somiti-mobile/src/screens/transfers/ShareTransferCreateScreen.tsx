import React, { useState, useEffect } from 'react';
import { StyleSheet, Alert, View } from 'react-native';
import client from '../../api/client';
import { useSomiti } from '../../hooks/useSomiti';
import { SelectField } from '../../components/SelectField';
import { FormScreen, AppInput } from '../../components/ui';
import { useLanguage } from '../../i18n/LanguageContext';
import { spacing } from '../../theme';

export default function ShareTransferCreateScreen({ navigation }: any) {
    const { t } = useLanguage();
    const { somitiId } = useSomiti();
    const [fyId, setFyId] = useState(''); const [toUserId, setToUserId] = useState('');
    const [quantity, setQuantity] = useState('1'); const [price, setPrice] = useState('');
    const [submitting, setSubmitting] = useState(false);
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
        if (!toUserId || !price) { Alert.alert(t('error'), t('fillRequiredFields')); return; }
        setSubmitting(true);
        try {
            await client.post('/share-transfers', { somiti_id: somitiId, financial_year_id: parseInt(fyId) || undefined, to_user_id: parseInt(toUserId), quantity: parseInt(quantity), price_per_share: parseFloat(price), transfer_date: new Date().toISOString().split('T')[0] });
            Alert.alert(t('done'), t('transferRequested')); navigation.goBack();
        } catch (err: any) { Alert.alert(t('error'), err.response?.data?.message || 'Failed'); }
        finally { setSubmitting(false); }
    };

    return (
        <FormScreen title={t('transferShares')} subtitle={t('transferSharesToMember')} onBack={() => navigation.goBack()} submitLabel={t('submitTransfer')} onSubmit={submit} submitting={submitting}>
            <SelectField label={t('recipient')} value={toUserId} options={members} onSelect={setToUserId} placeholder={t('selectMember')} />
            <SelectField label={t('financialYear')} value={fyId} options={fys} onSelect={setFyId} placeholder={t('selectFy')} />
            <View style={styles.row}>
                <View style={styles.flex}><AppInput label={t('quantity')} placeholder="1" value={quantity} onChangeText={setQuantity} keyboardType="number-pad" /></View>
                <View style={styles.flex}><AppInput label={t('pricePerShare')} placeholder="0.00" value={price} onChangeText={setPrice} keyboardType="decimal-pad" /></View>
            </View>
        </FormScreen>
    );
}

const styles = StyleSheet.create({ row: { flexDirection: 'row', gap: spacing.md }, flex: { flex: 1 } });
