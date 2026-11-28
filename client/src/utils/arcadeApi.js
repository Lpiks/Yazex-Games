const API_URL = import.meta.env.VITE_ARCADE_API_URL || 'http://localhost:5001/api';

export const arcadeFetch = async (path, options = {}) => {
    const res = await fetch(`${API_URL}${path}`, {
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            ...(options.headers || {})
        },
        ...options
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
        throw new Error(data.error || 'Request failed');
    }
    return data;
};

export const SHOP_URL = import.meta.env.VITE_SHOP_URL || 'http://localhost:5173';
