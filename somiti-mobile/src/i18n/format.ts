import { useLanguage } from './LanguageContext';

/**
 * Format an amount using the somiti currency code + selected app language.
 */
export function formatMoney(amount: number | string | null | undefined, currencyCode = 'USD', symbol = '$', locale = 'en-US'): string {
    const value = Number(amount || 0);
    try {
        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: currencyCode,
            maximumFractionDigits: 2,
        }).format(value);
    } catch {
        return `${symbol}${value.toLocaleString(locale)}`;
    }
}

/**
 * Hook wrapper so screens can format with the selected language locale.
 */
export function useFormatMoney() {
    const { locale } = useLanguage();

    return (amount: number | string | null | undefined, currencyCode = 'USD', symbol = '$') =>
        formatMoney(amount, currencyCode, symbol, locale);
}
