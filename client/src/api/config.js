// Production serves the API from the same origin: Firebase Hosting rewrites /api
// to Cloud Run. In development Vite proxies /api to the local server.
const configuredApiUrl = import.meta.env.VITE_API_URL || '/api';

export const baseUrl = configuredApiUrl.replace(/\/+$/, '');
