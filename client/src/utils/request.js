import { handleDemoRequest } from '../demo/demoApi.js'
import { baseUrl } from '../api/config.js'

export const UNAUTHORIZED_EVENT = 'auth:unauthorized'

const isDemo = import.meta.env.VITE_DEMO === 'true'

// The demo build answers API calls in the browser instead of over the network.
const demoFetch = async (method, url, data) => {
    const { status, body } = await handleDemoRequest(method, url.slice(baseUrl.length), data)
    return {
        ok: status >= 200 && status < 300,
        status,
        headers: { get: () => 'application/json' },
        json: async () => body,
    }
}

const request = async (method, url, data, options = {})=>{

    options.credentials = 'same-origin' // the API is served from the same origin as the app

    if (method !== 'GET') {
        options.method = method
    }

    if(data){
        options={
            ...options,
            headers:{
                'Content-Type': 'application/json',
                ...options.headers,
            },
            body:JSON.stringify(data)
        }
    }

    const response = isDemo ? await demoFetch(method, url, data) : await fetch(url,options)
    const responseContentType = response.headers.get('Content-Type')
    if(!responseContentType){
        return
    }

    if(!response.ok){
        if (response.status === 401) {
            // The server rejected the session cookie (expired, logged out elsewhere),
            // so drop the stored user and let the protected routes redirect to login.
            window.dispatchEvent(new Event(UNAUTHORIZED_EVENT))
        }

        const result = await response.json()

        throw result
    }

    const result = await response.json()
    return result
}

export default {
    get: request.bind(null, 'GET'),
    post: request.bind(null, 'POST'),
    put: request.bind(null, 'PUT'),
    delete: request.bind(null, 'DELETE'),
    baseRequest: request,
}