import React, { useState } from 'react'
import "../auth.form.scss"
import { useNavigate, Link } from "react-router-dom"
import { useAuth } from '../hooks/useAuth'

const Login = () => {
    const navigate = useNavigate()
    const { loading, handleLogin } = useAuth()

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')

        if (!email.trim() || !password.trim()) {
            setError("Please fill in both email and password.")
            return
        }

        try {
            await handleLogin({ email, password })
            navigate("/")
        } catch (err) {
            setError(err.message || "Failed to log in. Please check your credentials.")
        }
    }

    return (
        <main>
            <div className="form-container">
                <h1>Login</h1>

                {error && (
                    <div style={{
                        backgroundColor: 'rgba(239, 68, 68, 0.15)',
                        color: '#f87171',
                        padding: '0.75rem 1rem',
                        borderRadius: '0.5rem',
                        marginBottom: '1rem',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        fontSize: '0.9rem',
                        textAlign: 'center'
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label htmlFor="email">Email</label>
                        <input 
                            onChange={(e) => { setEmail(e.target.value) }}
                            value={email}
                            type="email" id="email" name='email' placeholder='enter email address' required />
                    </div>
                    <div className="input-group">
                        <label htmlFor="password">Password</label>
                        <input 
                            onChange={(e) => { setPassword(e.target.value) }}
                            value={password}
                            type="password" id="password" name='password' placeholder='enter password' required />
                    </div>
                    <button className='button primary-button' disabled={loading}>
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>
                <p>Don't have an account? <Link to={"/register"}>Register</Link> </p>
            </div>
        </main>
    )
}

export default Login
