// Read the backend URL from localStorage.
const storedUrl = localStorage.getItem('backend_url');

// If a URL is stored, use it. Otherwise, default to localhost:8000.
// This allows the backend URL to be configured at runtime from the login screen.
export const API_BASE_URL = storedUrl || 'http://localhost:8000';
