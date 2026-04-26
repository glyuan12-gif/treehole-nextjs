'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { api } from '@/lib/api'

export interface User {
  id: string
  veinId: string
  nickname: string
  role: string
  mbti: string
  avatarStyle: string
  avatarEmoji: string
  avatarColor: string
  allowFind: boolean
  createdAt: string
  updatedAt: string
}

interface RegisterData {
  veinId: string
  password: string
  nickname: string
  role: string
  mbti?: string
  avatarStyle?: string
  avatarEmoji?: string
  avatarColor?: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
  register: (data: RegisterData) => Promise<{ veinId: string; token: string } | null>
  login: (veinId: string, password: string) => Promise<{ veinId: string; token: string } | null>
  logout: () => void
  updateProfile: (data: Partial<User>) => Promise<boolean>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const refreshUser = useCallback(async () => {
    try {
      const userData = await api.getMe()
      setUser(userData)
    } catch {
      // Token might be invalid
      setToken(null)
      setUser(null)
      localStorage.removeItem('treehole_token')
    }
  }, [])

  useEffect(() => {
    const savedToken = localStorage.getItem('treehole_token')
    if (savedToken) {
      setToken(savedToken)
      api.setToken(savedToken)
      // Fetch user info
      fetch('/api/user/me', {
        headers: { Authorization: `Bearer ${savedToken}` }
      })
        .then(res => {
          if (!res.ok) throw new Error('Failed')
          return res.json()
        })
        .then(userData => {
          setUser(userData)
          setIsLoading(false)
        })
        .catch(() => {
          setToken(null)
          setUser(null)
          localStorage.removeItem('treehole_token')
          setIsLoading(false)
        })
    } else {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (token) {
      localStorage.setItem('treehole_token', token)
      api.setToken(token)
    } else {
      localStorage.removeItem('treehole_token')
      api.setToken(null)
    }
  }, [token])

  const register = async (data: RegisterData) => {
    try {
      const result = await api.register(data)
      setToken(result.token)
      await refreshUser()
      return result
    } catch (err) {
      console.error('Register failed:', err)
      return null
    }
  }

  const login = async (veinId: string, password: string) => {
    try {
      const result = await api.login(veinId, password)
      setToken(result.token)
      await refreshUser()
      return result
    } catch (err) {
      console.error('Login failed:', err)
      return null
    }
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('treehole_token')
  }

  const updateProfile = async (data: Partial<User>) => {
    try {
      const updatedUser = await api.updateMe(data)
      setUser(updatedUser)
      return true
    } catch (err) {
      console.error('Update profile failed:', err)
      return false
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user && !!token,
        register,
        login,
        logout,
        updateProfile,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
