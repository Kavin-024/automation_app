"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { useAuth } from "@/context/auth-context"
import { apiFetch } from "@/lib/api"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

type UserRole = "user" | "admin"

interface AdminUser {
  id: number
  name: string
  email: string
  role: UserRole
  created_at: string
  portal_count: number
}

interface AdminPortal {
  id: number
  name: string
  url: string
  username: string
  password: string
  created_at: string
  owner_id: number
  owner_name: string
  owner_email: string
}

export default function AdminPage() {
  const { isAuthenticated, isAuthLoading, user } = useAuth()
  const router = useRouter()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updatingUserId, setUpdatingUserId] = useState<number | null>(null)
  const [maintenanceMode, setMaintenanceMode] = useState(false)
  const [newSignupEnabled, setNewSignupEnabled] = useState(true)
  const [portals, setPortals] = useState<AdminPortal[]>([])
  const [isPortalsLoading, setIsPortalsLoading] = useState(true)

  const loadUsers = useCallback(async () => {
    if (!isAuthenticated || user?.role !== "admin") {
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      const data = await apiFetch("/admin/users.php")
      const nextUsers = Array.isArray(data?.users) ? data.users : []
      setUsers(
        nextUsers.map((entry: any) => ({
          id: Number(entry.id),
          name: String(entry.name),
          email: String(entry.email),
          role: entry.role === "admin" ? "admin" : "user",
          created_at: String(entry.created_at),
          portal_count: Number(entry.portal_count ?? 0),
        })),
      )
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : "Unable to load users")
    } finally {
      setIsLoading(false)
    }
  }, [isAuthenticated, user?.role])

  useEffect(() => {
    if (isAuthLoading) {
      return
    }

    if (!isAuthenticated) {
      router.push("/login")
      return
    }

    if (user?.role !== "admin") {
      router.push("/dashboard")
    }
  }, [isAuthenticated, isAuthLoading, router, user?.role])

  useEffect(() => {
    void loadUsers()
  }, [loadUsers])

  const loadPortals = useCallback(async () => {
    if (!isAuthenticated || user?.role !== "admin") {
      return
    }

    try {
      setIsPortalsLoading(true)
      const data = await apiFetch("/admin/portals.php")
      const nextPortals = Array.isArray(data?.portals) ? data.portals : []
      setPortals(
        nextPortals.map((entry: any) => ({
          id: Number(entry.id),
          name: String(entry.name),
          url: String(entry.url),
          username: String(entry.username),
          password: String(entry.password ?? ""),
          created_at: String(entry.created_at),
          owner_id: Number(entry.owner_id),
          owner_name: String(entry.owner_name),
          owner_email: String(entry.owner_email),
        })),
      )
    } catch {
      setPortals([])
    } finally {
      setIsPortalsLoading(false)
    }
  }, [isAuthenticated, user?.role])

  useEffect(() => {
    void loadPortals()
  }, [loadPortals])

  const handleRoleToggle = useCallback(
    async (target: AdminUser, makeAdmin: boolean) => {
      const nextRole: UserRole = makeAdmin ? "admin" : "user"
      const previousUsers = users
      setUpdatingUserId(target.id)
      setError(null)

      setUsers((current) =>
        current.map((entry) => (entry.id === target.id ? { ...entry, role: nextRole } : entry)),
      )

      try {
        await apiFetch("/admin/users.php", {
          method: "POST",
          body: JSON.stringify({
            user_id: target.id,
            role: nextRole,
          }),
        })
      } catch (updateError) {
        setUsers(previousUsers)
        setError(updateError instanceof Error ? updateError.message : "Unable to update role")
      } finally {
        setUpdatingUserId(null)
      }
    },
    [users],
  )

  const adminCount = useMemo(() => users.filter((entry) => entry.role === "admin").length, [users])

  if (isAuthLoading || !isAuthenticated || user?.role !== "admin") {
    return null
  }

  return (
    <div className="flex h-screen bg-background">
      <DashboardSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 items-center border-b border-border bg-card px-6">
          <h1 className="text-lg font-semibold">Admin Panel</h1>
        </header>
        <main className="flex flex-1 flex-col gap-4 overflow-auto p-6">
          <section className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Total Users</CardTitle>
                <CardDescription>All registered accounts</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-semibold">{users.length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Admin Users</CardTitle>
                <CardDescription>Accounts with elevated access</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-semibold">{adminCount}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Managed Portals</CardTitle>
                <CardDescription>Total linked portals by users</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-semibold">
                  {users.reduce((total, entry) => total + entry.portal_count, 0)}
                </p>
              </CardContent>
            </Card>
          </section>

          <Card>
            <CardHeader className="flex items-center justify-between gap-3">
              <div>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Promote or demote users to control dashboard access</CardDescription>
              </div>
              <Button variant="outline" onClick={() => void loadUsers()} disabled={isLoading}>
                Refresh
              </Button>
            </CardHeader>
            <CardContent>
              {error ? <p className="mb-3 text-sm text-destructive">{error}</p> : null}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Portals</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Admin Access</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-muted-foreground">
                        Loading users...
                      </TableCell>
                    </TableRow>
                  ) : users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-muted-foreground">
                        No users found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((entry) => {
                      const isSelf = entry.id === user.id
                      const isUpdatingCurrent = updatingUserId === entry.id
                      return (
                        <TableRow key={entry.id}>
                          <TableCell className="font-medium">{entry.name}</TableCell>
                          <TableCell>{entry.email}</TableCell>
                          <TableCell>
                            <Badge variant={entry.role === "admin" ? "default" : "secondary"}>
                              {entry.role}
                            </Badge>
                          </TableCell>
                          <TableCell>{entry.portal_count}</TableCell>
                          <TableCell>{new Date(entry.created_at).toLocaleDateString()}</TableCell>
                          <TableCell className="text-right">
                            <div className="inline-flex items-center gap-2">
                              <Switch
                                checked={entry.role === "admin"}
                                disabled={isSelf || isUpdatingCurrent}
                                onCheckedChange={(checked) => void handleRoleToggle(entry, checked)}
                              />
                              <span className="text-xs text-muted-foreground">
                                {isSelf ? "Current user" : isUpdatingCurrent ? "Updating..." : ""}
                              </span>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <section className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Application Config</CardTitle>
                <CardDescription>Operational controls for the platform</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between rounded-md border p-3">
                  <div>
                    <p className="text-sm font-medium">Maintenance mode</p>
                    <p className="text-xs text-muted-foreground">Display maintenance notice to users</p>
                  </div>
                  <Switch checked={maintenanceMode} onCheckedChange={setMaintenanceMode} />
                </div>
                <div className="flex items-center justify-between rounded-md border p-3">
                  <div>
                    <p className="text-sm font-medium">Allow new signups</p>
                    <p className="text-xs text-muted-foreground">Enable or disable account creation</p>
                  </div>
                  <Switch checked={newSignupEnabled} onCheckedChange={setNewSignupEnabled} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Admin Notes</CardTitle>
                <CardDescription>Recommended next hardening steps</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>- Move DB and JWT secrets to environment variables.</p>
                <p>- Add audit logs for role and account changes.</p>
                <p>- Persist app config toggles in a backend settings table.</p>
              </CardContent>
            </Card>
          </section>

          <Card>
            <CardHeader className="flex items-center justify-between gap-3">
              <div>
                <CardTitle>All User Portals</CardTitle>
                <CardDescription>Cross-account view of every saved portal</CardDescription>
              </div>
              <Button variant="outline" onClick={() => void loadPortals()} disabled={isPortalsLoading}>
                Refresh Portals
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Portal</TableHead>
                    <TableHead>URL</TableHead>
                    <TableHead>Username</TableHead>
                    <TableHead>Password</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isPortalsLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-muted-foreground">
                        Loading portals...
                      </TableCell>
                    </TableRow>
                  ) : portals.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-muted-foreground">
                        No portals found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    portals.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell className="font-medium">{entry.name}</TableCell>
                        <TableCell>{entry.url}</TableCell>
                        <TableCell>{entry.username}</TableCell>
                        <TableCell>{entry.password}</TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span>{entry.owner_name}</span>
                            <span className="text-xs text-muted-foreground">{entry.owner_email}</span>
                          </div>
                        </TableCell>
                        <TableCell>{new Date(entry.created_at).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}
