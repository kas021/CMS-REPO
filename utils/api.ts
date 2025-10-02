const DEFAULT_BACKEND_URL = 'http://localhost:8000';

export const getApiBaseUrl = (): string => {
    if (typeof window === 'undefined') {
        return DEFAULT_BACKEND_URL;
    }

    const storedUrl = window.localStorage.getItem('backend_url');
    if (storedUrl && storedUrl.trim().length > 0) {
        return storedUrl.trim();
    }

    return DEFAULT_BACKEND_URL;
};

export const API_BASE_URL = getApiBaseUrl();
