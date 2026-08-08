import { useContext , useEffect} from "react";
import { AuthContext } from "../auth.context";
import { login, register, logout, getMe} from "../services/auth.api.js"; // import functions who calls APIs to backend

export const useAuth = () => {

    const context  = useContext(AuthContext)
    const { user, setUser, loading, setLoading } = context //destructure means took data from contextApi  

    const handleLogin = async ({ email, password }) => {
        setLoading(true)
        try{
            const data = await login({ email, password })
            if (data && data.user) {
                setUser(data.user) 
            } else {
                setUser(null)
            }
        } catch(err){
            setUser(null)
        } finally {
            setLoading(false)
        }
    }
    
    const handleRegister = async ({ username, email, password }) => {
        setLoading(true)
        try {
            const data = await register({ username, email, password })
            if (data && data.user) {
                setUser(data.user)
            } else {
                setUser(null)
            }
        }  catch(err){
            setUser(null)
        } finally {
            setLoading(false)
        }
    }
    const handleLogout = async () => {
        setLoading(true)
        try {
        const data = await logout()
        setUser(null) 
        } catch(err){

        } finally {
            setLoading(false)
        }
    }

        useEffect(() => {
        const getAndSetUser = async() => {
            try{
                const data = await getMe()
                if (data && data.user) {
                    setUser(data.user)
                } else {
                    setUser(null)
                }
            } catch(err) {
                setUser(null)
            } finally {
                setLoading(false)
            }
        }
        getAndSetUser()
    }, [])

    return { user, loading, handleRegister, handleLogin, handleLogout }


}
