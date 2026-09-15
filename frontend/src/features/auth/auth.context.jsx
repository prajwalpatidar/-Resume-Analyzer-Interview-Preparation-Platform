import { createContext, useState, useEffect } from 'react';
import { getMe } from './services/auth.api';

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const [authError, setAuthError] = useState(null)

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const data = await getMe()
                if (data && data.user) {
                    setUser(data.user)
                } else {
                    setUser(null)
                }
            } catch (err) {
                setUser(null)
            } finally {
                setLoading(false)
            }
        }

        fetchUser()
    }, [])

    return (
        <AuthContext.Provider value={{ user, loading, setUser, setLoading, authError, setAuthError }}>
            {children}
        </AuthContext.Provider>
    )
}
// user, loading, setUser, setLoading can be accessed in any component