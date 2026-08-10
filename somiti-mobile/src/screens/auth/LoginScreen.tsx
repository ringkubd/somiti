import React, { useState } from 'react';
import {
    View, Text, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView,
    ActivityIndicator, Platform, ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import client from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import * as SecureStore from 'expo-secure-store';
import AppInput from '../../components/ui/AppInput';
import AppButton from '../../components/ui/AppButton';
import { colors, gradients, radius, shadows, spacing, typography } from '../../theme';
import { useLanguage } from '../../i18n/LanguageContext';
import { LANGUAGES } from '../../i18n/translations';

export default function LoginScreen({ navigation }: any) {
    const { t, language, setLanguage } = useLanguage();
    const [login, setLogin] = useState('');
    const [password, setPassword] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!login || !password) { Alert.alert('Error', 'Fill all fields'); return; }
        setLoading(true);
        try {
            const { data } = await client.post('/auth/login', { login, password });
            await SecureStore.setItemAsync('auth_token', data.token);
            useAuthStore.setState({ token: data.token, user: data.user });
        } catch (err: any) {
            Alert.alert('Error', err.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
                <LinearGradient colors={gradients.primary} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
                    <View style={styles.logo}>
                        <Ionicons name="people" size={40} color={colors.textOnPrimary} />
                    </View>
                    <Text style={styles.brand}>{t('appName')}</Text>
                    <Text style={styles.subtitle}>{t('appTagline')}</Text>
                </LinearGradient>

                <View style={styles.card}>
                    <Text style={styles.cardTitle}>{t('greeting')}</Text>
                    <Text style={styles.cardSubtitle}>{t('emailOrPhone')}</Text>

                    <AppInput
                        label={t('emailOrPhone')}
                        placeholder={t('emailOrPhone')}
                        value={login}
                        onChangeText={setLogin}
                        autoCapitalize="none"
                        autoCorrect={false}
                        leftIcon={<Ionicons name="person-outline" size={20} color={colors.textMuted} />}
                    />
                    <AppInput
                        label={t('password')}
                        placeholder={t('password')}
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry={!showPass}
                        leftIcon={<Ionicons name="lock-closed-outline" size={20} color={colors.textMuted} />}
                        rightIcon={
                            <TouchableOpacity onPress={() => setShowPass(v => !v)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                                <Ionicons name={showPass ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.textMuted} />
                            </TouchableOpacity>
                        }
                    />

                    <AppButton title={t('login')} onPress={handleLogin} loading={loading} size="lg" style={{ marginTop: spacing.sm }} />

                    <View style={styles.langRow}>
                        {LANGUAGES.map((l) => (
                            <TouchableOpacity key={l.code} onPress={() => setLanguage(l.code)}>
                                <Text style={[styles.langText, language === l.code && styles.langTextActive]}>{l.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <TouchableOpacity onPress={() => navigation.navigate('Register')} style={styles.linkWrap}>
                    <Text style={styles.link}>Don't have an account?</Text>
                    <Text style={styles.linkStrong}> Register</Text>
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    flex: { flex: 1, backgroundColor: colors.bg },
    container: { flexGrow: 1, paddingBottom: spacing.xxl },
    hero: { alignItems: 'center', paddingVertical: spacing.xxxl, borderBottomLeftRadius: radius.xl, borderBottomRightRadius: radius.xl },
    logo: { width: 84, height: 84, borderRadius: radius.xl, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)', ...shadows.card },
    brand: { color: colors.textOnPrimary, ...typography.h1, fontWeight: '800', marginTop: spacing.lg },
    subtitle: { color: colors.primaryLight, ...typography.body, marginTop: 4 },
    card: {
        backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.xxl,
        marginHorizontal: spacing.xl, marginTop: -spacing.xxl, ...shadows.popover,
    },
    cardTitle: { ...typography.h2, color: colors.text },
    cardSubtitle: { ...typography.bodySmall, color: colors.textMuted, marginBottom: spacing.xl, marginTop: 4 },
    linkWrap: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.xl },
    link: { ...typography.body, color: colors.textSecondary },
    linkStrong: { ...typography.body, color: colors.primary, fontWeight: '600' },
    langRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10, marginTop: spacing.lg },
    langText: { fontSize: 13, color: colors.textMuted },
    langTextActive: { color: colors.primary, fontWeight: '700' },
});
