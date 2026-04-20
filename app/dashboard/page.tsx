"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { DashboardHeader } from "@/components/dashboard/header"
import { AddPortalModal } from "@/components/dashboard/add-portal-modal"
import { PortalsTable } from "@/components/dashboard/portals-table"

export default function DashboardPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, router])

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="flex h-screen bg-background">
      <DashboardSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <DashboardHeader onAddClick={() => setIsModalOpen(true)} />
        <main className="flex flex-1 flex-col overflow-auto p-6">
          <PortalsTable />
        </main>
      </div>
      <AddPortalModal open={isModalOpen} onOpenChange={setIsModalOpen} />
    </div>
  )
}
