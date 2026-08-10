import React, { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import client from '../../api/client';
import { useSomiti } from '../../hooks/useSomiti';
import { SelectField } from '../../components/SelectField';
import { FormScreen, AppInput } from '../../components/ui';
import { useLanguage } from '../../i18n/LanguageContext';

export default function PenaltyCreateScreen({ navigation }: any) {
    const { t } = useLanguage();
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
        if (!userId || !amount) { Alert.alert(t('error'), t('memberAndAmountRequired')); return; }
        setSubmitting(true);
        try {
            await client.post('/penalties', { somiti_id: somitiId, user_id: parseInt(userId), type, amount: parseFloat(amount), notes: notes || undefined });
            Alert.alert(t('done'), t('penaltySubmitted')); navigation.goBack();
        } catch (err: any) { Alert.alert(t('error'), err.response?.data?.message || 'Failed'); }
        finally { setSubmitting(false); }
    };

    return (
        <FormScreen title={t('addPenalty')} subtitle={t('latePaymentPenalties')} onBack={() => navigation.goBack()} submitLabel={t('submitPenalty')} onSubmit={submit} submitting={submitting}>
            <SelectField label={t('member')} value={userId} options={members} onSelect={setUserId} placeholder={t('selectMember')} />
            <SelectField label={t('type')} value={type} options={[
                { label: t('lateDeposit'), value: 'late_deposit' },
                { label: t('loanDefault'), value: 'loan_default' },
                { label: t('other'), value: 'other' },
            ]} onSelect={setType} />
            <AppInput label={t('amount')} placeholder="0.00" value={amount} onChangeText={setAmount} keyboardType="decimal-pad" />
            <AppInput label={t('notes') + ' ' + t('optional')} placeholder={t('reason')} value={notes} onChangeText={setNotes} multiline />
        </FormScreen>
    );
}
