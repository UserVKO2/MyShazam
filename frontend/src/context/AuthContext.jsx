import { createContext, useContext, useEffect, useState } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const token = localStorage.getItem('token')

        if (!token) {
            setLoading(false)
            return
        }

        api.get('/user')
            .then((response) => {
                setUser(response.data)
            })
            .catch(() => {
                localStorage.removeItem('token')
                localStorage.removeItem('user')
                setUser(null)
            })
            .finally(() => {
                setLoading(false)
            })
    }, [])

    async function login(token, userData) {
        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(userData))

        setUser(userData)
    }

    async function logout() {
        try {
            await api.post('/logout')
        } finally {
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            setUser(null)
        }
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                login,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    return useContext(AuthContext)
}