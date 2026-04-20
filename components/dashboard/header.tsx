"use client"

import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

interface DashboardHeaderProps {
  onAddClick: () => void
}

export function DashboardHeader({ onAddClick }: DashboardHeaderProps) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-card px-6">
      <h1 className="text-xl font-semibold text-foreground">Automation Portals</h1>
      <Button onClick={onAddClick} className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90">
        <Plus className="h-4 w-4" />
        Add Portal
      </Button>
    </header>
  )
}
