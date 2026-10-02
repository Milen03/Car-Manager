// Production serves the API from the same origin: Vercel rewrites /api to the
// Railway server (see vercel.json). In development Vite proxies /api to the local
// server.
const configuredApiUrl = import.meta.env.VITE_API_URL || '/api';

export const baseUrl = configuredApiUrl.replace(/\/+$/, '');
