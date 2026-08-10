/**
 * Somiti — Professional Design System
 * Centralized colors, typography, spacing, and radii so every screen
 * shares a consistent, polished look.
 */

export const colors = {
    // Brand
    primary: '#2F6BFF',
    primaryDark: '#1E4FE0',
    primaryDeep: '#123FB8',
    primaryLight: '#EAF0FF',
    primaryFaint: '#F5F8FF',

    // Gradient endpoints
    gradientStart: '#3B82F6',
    gradientEnd: '#1E4FE0',
    gradientDarkStart: '#1E4FE0',
    gradientDarkEnd: '#123FB8',

    // Semantic
    success: '#16A34A',
    successLight: '#E7F6EC',
    warning: '#D97706',
    warningLight: '#FEF3E2',
    danger: '#DC2626',
    dangerLight: '#FDE8E8',
    info: '#0EA5E9',
    infoLight: '#E0F2FE',

    // Neutrals
    bg: '#F4F6FB',
    surface: '#FFFFFF',
    surfaceAlt: '#F8FAFC',
    border: '#E6EAF2',
    borderStrong: '#D3DAE6',

    // Text
    text: '#0F172A',
    textSecondary: '#475569',
    textMuted: '#94A3B8',
    textOnPrimary: '#FFFFFF',

    // Feature accents
    violet: '#7C3AED',
    teal: '#0D9488',
    cyan: '#0891B2',
    pink: '#DB2777',
    indigo: '#4F46E5',

    // States
    overlay: 'rgba(15,23,42,0.45)',
    backdrop: 'rgba(15,23,42,0.6)',
} as const;

export const gradients = {
    primary: [colors.gradientStart, colors.gradientEnd] as const,
    primaryDeep: [colors.gradientDarkStart, colors.gradientDarkEnd] as const,
    success: ['#22C55E', '#15803D'] as const,
    warning: ['#F59E0B', '#B45309'] as const,
    danger: ['#EF4444', '#B91C1C'] as const,
    violet: ['#8B5CF6', '#6D28D9'] as const,
    muted: ['#94A3B8', '#64748B'] as const,
} as const;

export const spacing = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
} as const;

export const radius = {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxxl: 32,
    full: 999,
} as const;

export const typography = {
    h1: { fontSize: 26, fontWeight: '700' as const, lineHeight: 34 },
    h2: { fontSize: 22, fontWeight: '700' as const, lineHeight: 30 },
    h3: { fontSize: 18, fontWeight: '600' as const, lineHeight: 26 },
    body: { fontSize: 15, fontWeight: '400' as const, lineHeight: 22 },
    bodyMedium: { fontSize: 15, fontWeight: '500' as const, lineHeight: 22 },
    bodySmall: { fontSize: 13, fontWeight: '400' as const, lineHeight: 18 },
    caption: { fontSize: 12, fontWeight: '500' as const, lineHeight: 16 },
    label: { fontSize: 14, fontWeight: '600' as const, lineHeight: 20 },
} as const;

export const shadows = {
    // iOS + Android friendly shadow presets
    card: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
    },
    popover: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
        elevation: 6,
    },
} as const;

export const theme = {
    colors,
    gradients,
    spacing,
    radius,
    typography,
    shadows,
};