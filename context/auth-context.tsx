"use client"

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { apiFetch } from "@/lib/api"

interface User {
  id: number
  name: string
  email: string
  role: string      
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  signup: (name: string, email: string, password: string) => Promise<boolean>
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const router = useRouter()

  useEffect(() => {
    try {
      const token = localStorage.getItem("auth_token")
      const storedUser = localStorage.getItem("auth_user")
      if (!token || !storedUser) {
        return
      }

      const parsedUser = JSON.parse(storedUser) as User
      if (parsedUser?.id && parsedUser?.name && parsedUser?.email) {
        setUser(parsedUser)
      }
    } catch {
      localStorage.removeItem("auth_token")
      localStorage.removeItem("auth_user")
      setUser(null)
    }
  }, [])

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      const data = await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      })

      if (!data?.token || !data?.user) {
        return false
      }

      const nextUser: User = {
        id: Number(data.user.id),
        name: String(data.user.name),
        email: String(data.user.email),
        role: String(data.user.role), 
      }

      localStorage.setItem("auth_token", String(data.token))
      localStorage.setItem("auth_user", JSON.stringify(nextUser))
      setUser(nextUser)
      return true
    } catch {
      return false
    }
  }, [])

  const signup = useCallback(async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      const data = await apiFetch("/auth/register", {
        method: "POST",
        body: JSON.stringify({ name, email, password }),
      })

      if (!data?.token || !data?.user) {
        return false
      }

      const nextUser: User = {
        id: Number(data.user.id),
        name: String(data.user.name),
        email: String(data.user.email),
        role: String(data.user.role), 
      }

      localStorage.setItem("auth_token", String(data.token))
      localStorage.setItem("auth_user", JSON.stringify(nextUser))
      setUser(nextUser)
      return true
    } catch {
      return false
    }
  }, [])

  const logout = useCallback(() => {
    const token = localStorage.getItem("auth_token")
    void apiFetch("/auth/logout", {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    }).catch(() => {
      // Intentionally ignored to avoid blocking client logout.
    })

    localStorage.removeItem("auth_token")
    localStorage.removeItem("auth_user")
    setUser(null)
    router.push("/login")
  }, [router])

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        signup,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
