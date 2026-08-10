import React, { createContext, useContext, useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { translations, LANGUAGES, type LanguageCode } from './translations';

interface LanguageContextValue {
    language: LanguageCode;
    setLanguage: (lang: LanguageCode) => Promise<void>;
    t: (key: string) => string;
    locale: string;
}

const LanguageContext = createContext<LanguageContextValue>({
    language: 'en',
    setLanguage: async () => {},
    t: (key: string) => key,
    locale: 'en-US',
});

const STORAGE_KEY = 'somiti_language';

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguageState] = useState<LanguageCode>('en');

    useEffect(() => {
        SecureStore.getItemAsync(STORAGE_KEY)
            .then((saved) => {
                if (saved && translations[saved as LanguageCode]) {
                    setLanguageState(saved as LanguageCode);
                }
            })
            .catch(() => {});
    }, []);

    const setLanguage = async (lang: LanguageCode) => {
        setLanguageState(lang);
        try {
            await SecureStore.setItemAsync(STORAGE_KEY, lang);
        } catch {}
    };

    const dict = translations[language];
    const enDict = translations.en;
    const lookup = (obj: Record<string, unknown> | undefined, key: string): unknown =>
        key.split('.').reduce<unknown>((acc, part) => (acc && typeof acc === 'object' ? (acc as Record<string, unknown>)[part] : undefined), obj);
    const t = (key: string) => {
        const value = lookup(dict as Record<string, unknown>, key);
        if (typeof value === 'string') return value;
        const enValue = lookup(enDict as Record<string, unknown>, key);
        if (typeof enValue === 'string') return enValue;
        return key;
    };

    const meta = LANGUAGES.find((l) => l.code === language);

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t, locale: meta?.locale || 'en-US' }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    return useContext(LanguageContext);
}
