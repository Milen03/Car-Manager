export const UNAUTHORIZED_EVENT = 'auth:unauthorized'

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

    const response = await fetch(url,options)
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