"use client"

import { useState } from "react"
import { usePortals } from "@/context/portal-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field"

interface AddPortalModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddPortalModal({ open, onOpenChange }: AddPortalModalProps) {
  const { addPortal } = usePortals()
  const [name, setName] = useState("")
  const [url, setUrl] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!name || !url || !username || !password) {
      setError("Please fill in all fields")
      return
    }

    try {
      await addPortal({ name, url, username, password })
      setName("")
      setUrl("")
      setUsername("")
      setPassword("")
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add portal")
    }
  }

  const handleClose = () => {
    setName("")
    setUrl("")
    setUsername("")
    setPassword("")
    setError("")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="border-border bg-card sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground">Add New Portal</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Enter the details for your automation portal.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="portal-name">Portal Name</FieldLabel>
              <Input
                id="portal-name"
                type="text"
                placeholder="My Portal"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-input border-border text-foreground placeholder:text-muted-foreground"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="portal-url">Portal URL</FieldLabel>
              <Input
                id="portal-url"
                type="url"
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="bg-input border-border text-foreground placeholder:text-muted-foreground"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="portal-username">Username</FieldLabel>
              <Input
                id="portal-username"
                type="text"
                placeholder="admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-input border-border text-foreground placeholder:text-muted-foreground"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="portal-password">Password</FieldLabel>
              <Input
                id="portal-password"
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-input border-border text-foreground placeholder:text-muted-foreground"
              />
            </Field>
          </FieldGroup>

          {error && (
            <p className="mt-4 text-sm text-destructive">{error}</p>
          )}

          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="border-border bg-transparent text-foreground hover:bg-secondary"
            >
              Cancel
            </Button>
            <Button type="submit" className="bg-accent text-accent-foreground hover:bg-accent/90">
              Add Portal
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
