import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_URL = 'https://fnfsomiti.bdesmart.com/api';

const client = axios.create({
    baseURL: API_URL,
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
});

client.interceptors.request.use(async (config) => {
    const token = await SecureStore.getItemAsync('auth_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

client.interceptors.response.use(
    (res) => res,
    async (err) => {
        if (err.response?.status === 401) {
            await SecureStore.deleteItemAsync('auth_token');
        }
        return Promise.reject(err);
    }
);

export default client;
