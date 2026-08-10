import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { InterstitialAd, AdEventType, TestIds } from 'react-native-google-mobile-ads';
import { ADS } from './config';

const UNIT = Platform.OS === 'ios' ? ADS.interstitialIos : ADS.interstitialAndroid;
const LAST_KEY = 'somiti_ads_last_interstitial';

/**
 * Show an interstitial only after natural breaks and never more often than
 * the configured cooldown. Fire-and-forget from the caller.
 */
export async function maybeShowInterstitial(): Promise<void> {
    try {
        const last = await SecureStore.getItemAsync(LAST_KEY);
        const cooldownMs = ADS.interstitialCooldownMinutes * 60 * 1000;
        if (last && Date.now() - Number(last) < cooldownMs) {
            return;
        }

        const ad = InterstitialAd.createForAdRequest(__DEV__ ? TestIds.INTERSTITIAL : UNIT, {
            requestNonPersonalizedAdsOnly: true,
        });

        let shown = false;
        const unsubscribeLoaded = ad.addAdEventListener(AdEventType.LOADED, () => {
            if (!shown) {
                shown = true;
                ad.show();
            }
        });
        const unsubscribeClosed = ad.addAdEventListener(AdEventType.CLOSED, () => {
            SecureStore.setItemAsync(LAST_KEY, String(Date.now())).catch(() => {});
            unsubscribeLoaded();
            unsubscribeClosed();
        });

        ad.load();
    } catch {}
}
