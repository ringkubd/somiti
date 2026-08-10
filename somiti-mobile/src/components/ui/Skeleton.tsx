import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import { colors, radius, spacing } from '../../theme';

/** Simple shimmer-style loading placeholder. */
export function Skeleton({ width, height, style, radius: r }: any) {
    const opacity = useRef(new Animated.Value(0.4)).current;

    useEffect(() => {
        const loop = Animated.loop(
            Animated.sequence([
                Animated.timing(opacity, { toValue: 1, duration: 700, easing: Easing.linear, useNativeDriver: true }),
                Animated.timing(opacity, { toValue: 0.4, duration: 700, easing: Easing.linear, useNativeDriver: true }),
            ])
        );
        loop.start();
        return () => loop.stop();
    }, []);

    return (
        <Animated.View
            style={[styles.base, { width: width ?? '100%', height: height ?? 16, borderRadius: r ?? radius.sm, opacity }, style]}
        />
    );
}

/** A card-shaped skeleton block for list loading. */
export function SkeletonCard({ rows = 3 }) {
    return (
        <View style={styles.card}>
            <Skeleton width="40%" height={18} />
            {Array.from({ length: rows }).map((_, i) => (
                <Skeleton key={i} width={`${80 - i * 10}%`} height={14} style={{ marginTop: spacing.md }} />
            ))}
        </View>
    );
}

export function SkeletonList({ count = 3, rows = 3 }) {
    return (
        <View style={styles.wrap}>
            {Array.from({ length: count }).map((_, i) => (
                <SkeletonCard key={i} rows={rows} />
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    base: { backgroundColor: colors.border },
    wrap: { padding: spacing.lg, gap: spacing.lg },
    card: {
        backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg,
        borderWidth: 1, borderColor: colors.border,
    },
});