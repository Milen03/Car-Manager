import request from './request'; // Make sure to import your request module
const baseUrl = 'http://localhost:3000/api';

export const useRegister = () => {

    const register = async (username, email, password) => {
        try {
            const result = await request.post(`${baseUrl}/register`, { username, email, password })
            return result
        } catch (err) {
            alert("Registration failed: " + err.message);
        }
    }

    return {
        register
    }
}

export const useLogin = () => {
    const login = async (email,password) => {
        try {
            const result = await request.post(`${baseUrl}/login`, { email, password })
            return result
        }catch (err){
            alert("Login failed: " + err.message);
        }
    }
    return {
        login
    }
}

export const useLogout = () => {
    const logout = async () => {
        try {
            const result = await request.post(`${baseUrl}/logout`)
            return result
        }catch (err){
            alert("Logout failed: " + err.message);
        }   
    }
    return {
        logout
    }
}   

