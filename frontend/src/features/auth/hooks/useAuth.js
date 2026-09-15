import { useContext } from "react";
import { AuthContext } from "../auth.context";
import { login, register, logout } from "../services/auth.api.js";

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider")
    }

    const { user, setUser, loading, setLoading, authError, setAuthError } = context

    const handleLogin = async ({ email, password }) => {
        setLoading(true)
        if (setAuthError) setAuthError(null)
        try {
            const data = await login({ email, password })
            if (data && data.user) {
                setUser(data.user)
                return data.user
            } else {
                throw new Error("Invalid response from server.")
            }
        } catch (err) {
            setUser(null)
            if (setAuthError) setAuthError(err.message)
            throw err
        } finally {
            setLoading(false)
        }
    }
    
    const handleRegister = async ({ username, email, password }) => {
        setLoading(true)
        if (setAuthError) setAuthError(null)
        try {
            const data = await register({ username, email, password })
            if (data && data.user) {
                setUser(data.user)
                return data.user
            } else {
                throw new Error("Invalid response from server.")
            }
        } catch (err) {
            setUser(null)
            if (setAuthError) setAuthError(err.message)
            throw err
        } finally {
            setLoading(false)
        }
    }

    const handleLogout = async () => {
        setLoading(true)
        try {
            await logout()
            setUser(null) 
        } catch (err) {
            console.error("Logout failed:", err.message)
            setUser(null)
        } finally {
            setLoading(false)
        }
    }

    return { user, loading, authError, handleRegister, handleLogin, handleLogout }
}
