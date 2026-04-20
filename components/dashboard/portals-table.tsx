"use client"

import { usePortals } from "@/context/portal-context"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Trash2, ExternalLink, Eye, EyeOff } from "lucide-react"
import { useState } from "react"
import { Empty } from "@/components/ui/empty"

export function PortalsTable() {
  const { portals, isLoading, deletePortal } = usePortals()
  const [visiblePasswords, setVisiblePasswords] = useState<Set<string>>(new Set())

  const togglePasswordVisibility = (id: string) => {
    setVisiblePasswords((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const handleDeletePortal = async (id: string) => {
    try {
      await deletePortal(id)
    } catch (error) {
      console.error("Failed to delete portal:", error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
        Loading portals...
      </div>
    )
  }

  if (portals.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Empty
          title="No portals yet"
          description="Add your first automation portal to get started."
        />
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow className="border-border hover:bg-transparent">
            <TableHead className="text-muted-foreground">Portal Name</TableHead>
            <TableHead className="text-muted-foreground">URL</TableHead>
            <TableHead className="text-muted-foreground">Username</TableHead>
            <TableHead className="text-muted-foreground">Password</TableHead>
            <TableHead className="text-right text-muted-foreground">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {portals.map((portal) => (
            <TableRow key={portal.id} className="border-border">
              <TableCell className="font-medium text-foreground">{portal.name}</TableCell>
              <TableCell>
                <a
                  href={portal.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-accent hover:underline"
                >
                  {portal.url}
                  <ExternalLink className="h-3 w-3" />
                </a>
              </TableCell>
              <TableCell className="text-foreground">{portal.username}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-foreground">
                    {visiblePasswords.has(portal.id) ? portal.password : "••••••••"}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => togglePasswordVisibility(portal.id)}
                    className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                  >
                    {visiblePasswords.has(portal.id) ? (
                      <EyeOff className="h-3.5 w-3.5" />
                    ) : (
                      <Eye className="h-3.5 w-3.5" />
                    )}
                  </Button>
                </div>
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    void handleDeletePortal(portal.id)
                  }}
                  className="h-8 w-8 p-0 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
