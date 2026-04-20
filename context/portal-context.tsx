"use client"

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react"
import { apiFetch, getToken } from "@/lib/api"

export interface Portal {
  id: string
  name: string
  url: string
  username: string
  password: string
  createdAt: Date
}

interface PortalContextType {
  portals: Portal[]
  isLoading: boolean
  addPortal: (portal: Omit<Portal, "id" | "createdAt">) => Promise<void>
  deletePortal: (id: string) => Promise<void>
}

const PortalContext = createContext<PortalContextType | undefined>(undefined)

export function PortalProvider({ children }: { children: ReactNode }) {
  const [portals, setPortals] = useState<Portal[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)

  const mapApiPortal = useCallback((portal: any): Portal => {
    return {
      id: String(portal.id),
      name: String(portal.name),
      url: String(portal.url),
      username: String(portal.username),
      password: String(portal.password),
      createdAt: new Date(portal.created_at),
    }
  }, [])

  const fetchPortals = useCallback(async () => {
    const token = getToken()
    if (!token) {
      setPortals([])
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    try {
      const data = await apiFetch("/portals/index.php", {
        method: "GET",
      })
      const nextPortals: Portal[] = Array.isArray(data?.portals)
        ? data.portals.map(mapApiPortal)
        : []
      setPortals(nextPortals)
    } catch {
      setPortals([])
    } finally {
      setIsLoading(false)
    }
  }, [mapApiPortal])

  useEffect(() => {
    void fetchPortals()
  }, [fetchPortals])

  const addPortal = useCallback(async (portalData: Omit<Portal, "id" | "createdAt">) => {
    const data = await apiFetch("/portals/index.php", {
      method: "POST",
      body: JSON.stringify(portalData),
    })

    if (!data?.portal) {
      throw new Error("Failed to create portal")
    }

    const createdPortal = mapApiPortal(data.portal)
    setPortals((prev) => [createdPortal, ...prev])
  }, [mapApiPortal])

  const deletePortal = useCallback(async (id: string) => {
    await apiFetch("/portals/delete.php", {
      method: "DELETE",
      body: JSON.stringify({ id: Number(id) }),
    })
    setPortals((prev) => prev.filter((p) => p.id !== id))
  }, [])

  return (
    <PortalContext.Provider value={{ portals, isLoading, addPortal, deletePortal }}>
      {children}
    </PortalContext.Provider>
  )
}

export function usePortals() {
  const context = useContext(PortalContext)
  if (context === undefined) {
    throw new Error("usePortals must be used within a PortalProvider")
  }
  return context
}
