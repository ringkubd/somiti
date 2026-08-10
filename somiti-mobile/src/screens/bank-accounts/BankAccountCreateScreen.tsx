import React, { useState } from 'react';
import { Alert } from 'react-native';
import client from '../../api/client';
import { useSomiti } from '../../hooks/useSomiti';
import { FormScreen, AppInput, ChipGroup } from '../../components/ui';
import { useLanguage } from '../../i18n/LanguageContext';

export default function BankAccountCreateScreen({ navigation }: any) {
    const { t } = useLanguage();
    const { somitiId } = useSomiti();
    const [bankName, setBankName] = useState(''); const [accountNumber, setAccountNumber] = useState('');
    const [type, setType] = useState('savings'); const [openingBalance, setOpeningBalance] = useState('0');
    const [submitting, setSubmitting] = useState(false);

    const submit = async () => {
        if (!bankName || !accountNumber) { Alert.alert(t('error'), t('fillRequiredFields')); return; }
        setSubmitting(true);
        try {
            await client.post('/bank-accounts', { somiti_id: somitiId, bank_name: bankName, account_number: accountNumber, account_type: type, opening_balance: parseFloat(openingBalance) });
            Alert.alert(t('done'), t('bankAccountAdded')); navigation.goBack();
        } catch (err: any) { Alert.alert(t('error'), err.response?.data?.message || 'Failed'); }
        finally { setSubmitting(false); }
    };

    return (
        <FormScreen title={t('addBankAccount')} subtitle={t('linkBankAccount')} onBack={() => navigation.goBack()} submitLabel={t('addAccount')} onSubmit={submit} submitting={submitting}>
            <AppInput label={t('bankName')} placeholder={t('bankName')} value={bankName} onChangeText={setBankName} />
            <AppInput label={t('accountNumber')} placeholder={t('accountNumber')} value={accountNumber} onChangeText={setAccountNumber} />
            <ChipGroup label={t('accountType')} options={['savings', 'current', 'fd', 'loan']} value={type} onChange={setType} />
            <AppInput label={t('openingBalance')} placeholder="0.00" value={openingBalance} onChangeText={setOpeningBalance} keyboardType="decimal-pad" />
        </FormScreen>
    );
}
