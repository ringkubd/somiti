import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import client from '../api/client';
import { useAuthStore } from '../store/authStore';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

let cachedToken: string | null = null;

/**
 * Register the Expo push token with the backend once the user is
 * authenticated, and react to notification taps.
 */
export function usePushNotifications(onTap?: (data: any) => void) {
    const token = useAuthStore((s) => s.token);
    const notificationListener = useRef<any>(null);
    const responseListener = useRef<any>(null);

    useEffect(() => {
        if (!token) return;

        registerForPushNotifications();

        notificationListener.current = Notifications.addNotificationReceivedListener(() => {});

        responseListener.current = Notifications.addNotificationResponseReceivedListener((response: any) => {
            const data = response.notification.request.content.data;
            if (data && onTap) {
                onTap(data);
            }
        });

        return () => {
            if (notificationListener.current) {
                (Notifications as any).removeNotificationSubscription(notificationListener.current);
            }
            if (responseListener.current) {
                (Notifications as any).removeNotificationSubscription(responseListener.current);
            }
        };
    }, [token]);
}

async function registerForPushNotifications() {
    if (!Device.isDevice) return;

    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'Default',
            importance: Notifications.AndroidImportance.HIGH,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#2563eb',
        });
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }

    if (finalStatus !== 'granted') return;

    try {
        const tokenData = await Notifications.getExpoPushTokenAsync({ projectId: undefined });
        const token = tokenData.data;

        if (token && token !== cachedToken) {
            cachedToken = token;
            await client.post('/auth/push-token', { token, platform: Platform.OS });
        }
    } catch {}
}
