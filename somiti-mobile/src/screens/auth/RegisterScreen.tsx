import React, { useState } from 'react';
import {
    View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator,
    ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import AppInput from '../../components/ui/AppInput';
import AppButton from '../../components/ui/AppButton';
import { useLanguage } from '../../i18n/LanguageContext';
import { colors, radius, shadows, spacing, typography } from '../../theme';

export default function RegisterScreen({ navigation }: any) {
    const { t } = useLanguage();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);
    const register = useAuthStore((s) => s.register);

    const handleRegister = async () => {
        if (!name || (!email && !phone) || !password) {
            Alert.alert(t('error'), t('registerValidation'));
            return;
        }
        setLoading(true);
        try {
            await register(name, email, phone, password);
        } catch (err: any) {
            Alert.alert(t('error'), err.response?.data?.message || t('registrationFailed'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
                <View style={styles.header}>
                    <View style={styles.logo}><Ionicons name="people" size={30} color={colors.textOnPrimary} /></View>
                    <Text style={styles.brand}>{t('joinSomiti')}</Text>
                    <Text style={styles.subtitle}>{t('createAccount')}</Text>
                </View>

                <View style={styles.card}>
                    <AppInput label={t('fullName')} placeholder={t('yourFullName')} value={name} onChangeText={setName} leftIcon={<Ionicons name="person-outline" size={20} color={colors.textMuted} />} />
                    <AppInput label={t('email')} placeholder="you@example.com" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" leftIcon={<Ionicons name="mail-outline" size={20} color={colors.textMuted} />} />
                    <AppInput label={t('phone')} placeholder={t('enterPhone')} value={phone} onChangeText={setPhone} keyboardType="phone-pad" leftIcon={<Ionicons name="call-outline" size={20} color={colors.textMuted} />} />
                    <AppInput label={t('password')} placeholder={t('passwordMin')} value={password} onChangeText={setPassword} secureTextEntry={!showPass} leftIcon={<Ionicons name="lock-closed-outline" size={20} color={colors.textMuted} />} rightIcon={
                        <TouchableOpacity onPress={() => setShowPass(v => !v)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                            <Ionicons name={showPass ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.textMuted} />
                        </TouchableOpacity>
                    } />
                    <AppButton title={t('register')} onPress={handleRegister} loading={loading} size="lg" style={{ marginTop: spacing.sm }} />
                </View>

                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.linkWrap}>
                    <Text style={styles.link}>{t('alreadyHaveAccount')}</Text>
                    <Text style={styles.linkStrong}> {t('login')}</Text>
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    flex: { flex: 1, backgroundColor: colors.bg },
    container: { flexGrow: 1, justifyContent: 'center', padding: spacing.xxl },
    header: { alignItems: 'center', marginBottom: spacing.xxl },
    logo: { width: 60, height: 60, borderRadius: radius.lg, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', ...shadows.card },
    brand: { ...typography.h1, color: colors.text, marginTop: spacing.lg },
    subtitle: { ...typography.body, color: colors.textMuted, marginTop: 4 },
    card: { backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.xxl, ...shadows.card },
    linkWrap: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.xl },
    link: { ...typography.body, color: colors.textSecondary },
    linkStrong: { ...typography.body, color: colors.primary, fontWeight: '600' },
});
