import {createContext, useContext, useState, useEffect} from 'react';
import { getMe } from './services/auth.api';

export const AuthContext = createContext()

export const AuthProvider = ({ children}) => {

    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)



    return (
        <AuthContext.Provider value={{ user, loading, setUser, setLoading }}> 
            {children}
        </AuthContext.Provider>
    )
}
// user, loading, setUser, setLoading can be accessed in any component