import 'react-native-gesture-handler';
import { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator } from 'react-native';
import { PaperProvider, MD3LightTheme } from 'react-native-paper';
import AppNavigator from './src/navigation/AppNavigator';
import LockScreen from './src/components/LockScreen';
import { useAuthStore } from './src/store/authStore';
import { useLocalAuth } from './src/hooks/useLocalAuth';

const theme = {
    ...MD3LightTheme,
    colors: { ...MD3LightTheme.colors, primary: '#2563eb' },
};

export default function App() {
    const loadToken = useAuthStore((s) => s.loadToken);
    const token = useAuthStore((s) => s.token);
    const [appReady, setAppReady] = useState(false);

    const {
        isLocked, loading: authLoading, hasPin,
        authenticate, authenticateWithPin, setPin,
        enableBiometric, biometricType,
        unlock, lock,
    } = useLocalAuth();

    useEffect(() => {
        loadToken().finally(() => setAppReady(true));
    }, []);

    const handleBiometric = async () => {
        const result = await authenticate();
        if (result === true) {
            unlock();
            return true;
        }
        return false;
    };

    const handlePinAuth = async (pin: string) => {
        if (hasPin) return authenticateWithPin(pin);
        await setPin(pin);
        // Ask about biometric after PIN setup
        const bioOk = await enableBiometric();
        unlock();
        return true;
    };

    // Show loading while checking auth
    if (!appReady || authLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' }}>
                <ActivityIndicator size="large" color="#2563eb" />
            </View>
        );
    }

    // Show lock screen when app starts (only if user is logged in)
    if (token && isLocked) {
        return (
            <PaperProvider theme={theme}>
                <StatusBar style="dark" />
                <LockScreen
                    onUnlock={unlock}
                    onSetupPin={handlePinAuth}
                    biometricType={biometricType}
                    onBiometric={handleBiometric}
                />
            </PaperProvider>
        );
    }

    return (
        <PaperProvider theme={theme}>
            <StatusBar style="dark" />
            <AppNavigator />
        </PaperProvider>
    );
}
