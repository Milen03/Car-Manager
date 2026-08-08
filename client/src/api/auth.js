import { useContext } from 'react';
import request from '../utils/request';
import { userContext } from '../contexts/UserContext.jsx';
const baseUrl = 'http://localhost:3000/api';

export const useRegister = () => {
    const { userLoginHandeler } = useContext(userContext)

    const register = async (username, email, password) => {
        try {
            const result = await request.post(`${baseUrl}/register`, { username, email, password })
            userLoginHandeler(result)
            return result
        } catch (error) {
            alert("Registration failed: " + error.message);
        }
    }

    return {
        register
    }
}

export const useLogin = () => {
    const { userLoginHandeler } = useContext(userContext)

    const login = async (email,password) => {
        try {
            const result = await request.post(`${baseUrl}/login`, { email, password })
            userLoginHandeler(result)
            return result
        }catch (error){
            alert("Login failed: " + error.message);
        }
    }
    return {
        login
    }
}

export const useLogout = () => {
    const { userLogoutHandeler } = useContext(userContext)

    const logout = async () => {
        try {
            const result = await request.post(`${baseUrl}/logout`)
            userLogoutHandeler()
            return result
        }catch (error){
            alert("Logout failed: " + error.message);
        }   
    }
    return {
        logout
    }
}   

