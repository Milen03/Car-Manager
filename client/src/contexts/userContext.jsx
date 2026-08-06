import { createContext } from 'react';

export const userContext = createContext({
     _id: '',
    email: '',
    username: '',
    accessToken:'',
    userLoginHandeler: () => null ,
    userLogoutHandeler: () => null,
})
export const UserProvider = userContext.Provider    