import { useState, useEffect, useCallback } from 'react';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';

const PIN_STORAGE_KEY = 'app_pin';
const BIOMETRIC_ENABLED_KEY = 'biometric_enabled';

export function useLocalAuth() {
    const [isLocked, setIsLocked] = useState(false);
    const [biometricType, setBiometricType] = useState<'fingerprint' | 'facial' | 'iris' | null>(null);
    const [hasPin, setHasPin] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => { init(); }, []);

    const init = async () => {
        const stored = await SecureStore.getItemAsync(PIN_STORAGE_KEY);
        setHasPin(!!stored);

        const compatible = await LocalAuthentication.hasHardwareAsync();
        if (compatible) {
            const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
            if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) setBiometricType('fingerprint');
            else if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) setBiometricType('facial');
            else if (types.includes(LocalAuthentication.AuthenticationType.IRIS)) setBiometricType('iris');
        }

        const bioEnabled = await SecureStore.getItemAsync(BIOMETRIC_ENABLED_KEY);
        if (stored || bioEnabled === 'true') setIsLocked(true);
        setLoading(false);
    };

    const authenticate = async (): Promise<boolean> => {
        // Try biometric first if enabled
        const bioEnabled = await SecureStore.getItemAsync(BIOMETRIC_ENABLED_KEY);
        if (bioEnabled === 'true' && biometricType) {
            const result = await LocalAuthentication.authenticateAsync({
                promptMessage: 'Unlock Somiti',
                fallbackLabel: 'Use PIN',
                disableDeviceFallback: false,
            });
            if (result.success) return true;
        }

        // Fallback: check PIN
        const stored = await SecureStore.getItemAsync(PIN_STORAGE_KEY);
        if (stored) return false; // Return false meaning "ask for PIN"

        return true; // No auth configured
    };

    const authenticateWithPin = async (pin: string): Promise<boolean> => {
        const stored = await SecureStore.getItemAsync(PIN_STORAGE_KEY);
        return pin === stored;
    };

    const setPin = async (pin: string) => {
        await SecureStore.setItemAsync(PIN_STORAGE_KEY, pin);
        setHasPin(true);
    };

    const enableBiometric = async () => {
        const compatible = await LocalAuthentication.hasHardwareAsync();
        if (!compatible) return false;
        const enrolled = await LocalAuthentication.isEnrolledAsync();
        if (!enrolled) return false;
        await SecureStore.setItemAsync(BIOMETRIC_ENABLED_KEY, 'true');
        return true;
    };

    const disableBiometric = async () => {
        await SecureStore.deleteItemAsync(BIOMETRIC_ENABLED_KEY);
    };

    const unlock = () => setIsLocked(false);
    const lock = () => setIsLocked(true);

    return {
        isLocked, loading, hasPin, biometricType,
        authenticate, authenticateWithPin, setPin,
        enableBiometric, disableBiometric,
        unlock, lock,
    };
}
