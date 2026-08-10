import React, { useState } from 'react';
import { Alert } from 'react-native';
import client from '../../api/client';
import { FormScreen, AppInput } from '../../components/ui';
import { useLanguage } from '../../i18n/LanguageContext';

export default function ChangePasswordScreen({ navigation }: any) {
    const { t } = useLanguage();
    const [current, setCurrent] = useState(''); const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState(''); const [loading, setLoading] = useState(false);

    const submit = async () => {
        if (password !== confirm) { Alert.alert(t('error'), t('passwordsDoNotMatch')); return; }
        setLoading(true);
        try {
            await client.put('/auth/password', { current_password: current, password, password_confirmation: confirm });
            Alert.alert(t('done'), t('passwordChanged')); navigation.goBack();
        } catch (err: any) { Alert.alert(t('error'), err.response?.data?.message || 'Failed'); }
        finally { setLoading(false); }
    };

    return (
        <FormScreen title={t('changePassword')} subtitle={t('updateYourPassword')} onBack={() => navigation.goBack()} submitLabel={t('updatePassword')} onSubmit={submit} submitting={loading}>
            <AppInput label={t('currentPassword')} placeholder={t('currentPassword')} value={current} onChangeText={setCurrent} secureTextEntry />
            <AppInput label={t('newPassword')} placeholder={t('newPassword')} value={password} onChangeText={setPassword} secureTextEntry />
            <AppInput label={t('confirmPassword')} placeholder={t('confirmPassword')} value={confirm} onChangeText={setConfirm} secureTextEntry />
        </FormScreen>
    );
}
