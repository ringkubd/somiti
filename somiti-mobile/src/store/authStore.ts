import client from '../api/client';
import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';

interface AuthState {
    token: string | null;
    user: any | null;
    isLoading: boolean;
    login: (phone: string, password: string) => Promise<void>;
    register: (name: string, email: string, phone: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    loadToken: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
    token: null,
    user: null,
    isLoading: true,

    loadToken: async () => {
        const token = await SecureStore.getItemAsync('auth_token');
        if (token) {
            try {
                const { data } = await client.get('/auth/me');
                set({ token, user: data, isLoading: false });
            } catch {
                await SecureStore.deleteItemAsync('auth_token');
                set({ token: null, user: null, isLoading: false });
            }
        } else {
            set({ isLoading: false });
        }
    },

    login: async (phone, password) => {
        const { data } = await client.post('/auth/login', { phone, password });
        await SecureStore.setItemAsync('auth_token', data.token);
        set({ token: data.token, user: data.user });
    },

    register: async (name, email, phone, password) => {
        const payload: Record<string, string> = {
            name,
            password,
            password_confirmation: password,
        };
        if (email) payload.email = email;
        if (phone) payload.phone = phone;
        const { data } = await client.post('/auth/register', payload);
        await SecureStore.setItemAsync('auth_token', data.token);
        set({ token: data.token, user: data.user });
    },

    logout: async () => {
        try { await client.post('/auth/logout'); } catch {}
        await SecureStore.deleteItemAsync('auth_token');
        set({ token: null, user: null });
    },
}));
