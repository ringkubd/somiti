import React, { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import client from '../../api/client';
import { useSomiti } from '../../hooks/useSomiti';
import { SelectField } from '../../components/SelectField';
import { FormScreen, AppInput } from '../../components/ui';
import { useLanguage } from '../../i18n/LanguageContext';

export default function UserShareCreateScreen({ navigation }: any) {
    const { t } = useLanguage();
    const { somitiId } = useSomiti();
    const [userId, setUserId] = useState(''); const [shareCount, setShareCount] = useState('1');
    const [fyId, setFyId] = useState(''); const [submitting, setSubmitting] = useState(false);
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
        if (!userId || !fyId) { Alert.alert(t('error'), t('selectMemberAndFy')); return; }
        setSubmitting(true);
        try {
            await client.post('/shares', { somiti_id: somitiId, user_id: parseInt(userId), share_count: parseInt(shareCount), financial_year_id: parseInt(fyId) });
            Alert.alert(t('done'), t('sharesAssigned')); navigation.goBack();
        } catch (err: any) { Alert.alert(t('error'), err.response?.data?.message || 'Failed'); }
        finally { setSubmitting(false); }
    };

    return (
        <FormScreen title={t('assignShares')} subtitle={t('allocateShares')} onBack={() => navigation.goBack()} submitLabel={t('assignShares')} onSubmit={submit} submitting={submitting}>
            <SelectField label={t('member')} value={userId} options={members} onSelect={setUserId} placeholder={t('selectMember')} />
            <SelectField label={t('financialYear')} value={fyId} options={fys} onSelect={setFyId} placeholder={t('selectFy')} />
            <AppInput label={t('shareCount')} placeholder="1" value={shareCount} onChangeText={setShareCount} keyboardType="number-pad" />
        </FormScreen>
    );
}
