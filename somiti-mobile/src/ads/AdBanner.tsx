import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';
import { ADS } from './config';

const UNIT = Platform.OS === 'ios' ? ADS.bannerIos : ADS.bannerAndroid;

/**
 * A non-intrusive banner shown at the bottom of the home screen.
 * Uses test ads in development.
 */
export default function AdBanner() {
    return (
        <View style={styles.wrap}>
            <BannerAd
                unitId={__DEV__ ? TestIds.BANNER : UNIT}
                size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
                requestOptions={{ requestNonPersonalizedAdsOnly: true }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    wrap: { alignItems: 'center', marginTop: 12 },
});
