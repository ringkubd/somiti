import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ActivityIndicator,
    StyleSheet,
    ViewStyle,
    TextStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, gradients, radius, spacing, typography } from '../../theme';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface AppButtonProps {
    title: string;
    onPress?: () => void;
    variant?: Variant;
    size?: Size;
    loading?: boolean;
    disabled?: boolean;
    icon?: React.ReactNode;
    fullWidth?: boolean;
    style?: ViewStyle;
    labelStyle?: TextStyle;
}

export default function AppButton({
    title,
    onPress,
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled = false,
    icon,
    fullWidth = true,
    style,
    labelStyle,
}: AppButtonProps) {
    const isDisabled = disabled || loading;
    const sizeStyles: Record<Size, { padding: number; borderRadius: number }> = {
        sm: { padding: spacing.sm, borderRadius: radius.sm },
        md: { padding: spacing.md + 2, borderRadius: radius.md },
        lg: { padding: spacing.lg, borderRadius: radius.md },
    };

    const base: ViewStyle = {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.sm,
        ...sizeStyles[size],
    };

    const textColor: Record<Variant, string> = {
        primary: colors.textOnPrimary,
        secondary: colors.primaryDark,
        outline: colors.primary,
        ghost: colors.primary,
        danger: colors.textOnPrimary,
    };

    const borderColor: Record<Variant, string | undefined> = {
        primary: undefined,
        secondary: undefined,
        outline: colors.borderStrong,
        ghost: undefined,
        danger: undefined,
    };

    const isGradient = variant === 'primary' || variant === 'danger';
    const gradientColors = variant === 'danger' ? gradients.danger : gradients.primary;
    const bgColor = variant === 'primary' ? colors.primary : colors.primaryLight;
    const loaderColor = variant === 'outline' || variant === 'ghost' ? colors.primary : colors.textOnPrimary;

    const content = loading ? (
        <ActivityIndicator color={loaderColor} size="small" />
    ) : (
        <>
            {icon}
            <Text style={[{ color: textColor[variant], ...typography.bodyMedium }, labelStyle]}>
                {title}
            </Text>
        </>
    );

    const inner = (
        <View
            style={[
                base,
                {
                    backgroundColor: isGradient ? 'transparent' : bgColor,
                    borderWidth: variant === 'outline' ? 1.5 : 0,
                    borderColor: borderColor[variant],
                },
                fullWidth && { width: '100%' },
                isDisabled && { opacity: 0.55 },
                style,
            ]}
        >
            {content}
        </View>
    );

    if (isGradient) {
        return (
            <TouchableOpacity activeOpacity={0.8} onPress={onPress} disabled={isDisabled}>
                <LinearGradient colors={gradientColors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[base, fullWidth && { width: '100%' }, isDisabled && { opacity: 0.55 }, style]}>
                    {content}
                </LinearGradient>
            </TouchableOpacity>
        );
    }

    return (
        <TouchableOpacity activeOpacity={0.8} onPress={onPress} disabled={isDisabled} style={inner as any} />
    );
}