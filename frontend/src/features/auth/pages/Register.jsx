import React, { useState } from 'react'
import "../auth.form.scss"
import { useNavigate, Link } from "react-router-dom"
import { useAuth } from '../hooks/useAuth'

const Register = () => {
    const navigate = useNavigate()

    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')

    const { loading, handleRegister } = useAuth()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')

        if (!username.trim() || !email.trim() || !password.trim()) {
            setError("Please fill in all fields.")
            return
        }

        try {
            await handleRegister({ username, email, password })
            navigate("/")
        } catch (err) {
            setError(err.message || "Registration failed. Please try again.")
        }
    }

    return (
        <main>
            <div className="form-container">
                <h1>Register</h1>

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
                        <label htmlFor="username">Username</label>
                        <input
                            onChange={(e) => { setUsername(e.target.value) }}
                            value={username}
                            type="text" id="username" name='username' placeholder='enter username' required />
                    </div>

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
                        {loading ? 'Registering...' : 'Register'}
                    </button>
                </form>

                <p>Already have an account? <Link to={"/login"}>Login</Link> </p>
            </div>
        </main>
    )
}

export default Register
