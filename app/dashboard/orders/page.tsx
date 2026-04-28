"use client"
import { useEffect, useState } from "react"
import { useAuth } from "@/context/auth-context"
import { useRouter } from "next/navigation"

const API_BASE = (process.env.NEXT_PUBLIC_API_BASE || "https://app.bpoautoaccept.online/api").replace(/\/$/, "")

interface AdminRow {
  id: number
  order_id: string
  address: string
  client: string
  assigned: string
  due: string
  inspection: string
  item: string
  created_at: string
  mail_sent: string
}

interface UserRow {
  order_id: string
  client: string
  address: string
  due: string
  status: string
  created_at: string
}

type Row = AdminRow | UserRow

export default function OrdersPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [search, setSearch] = useState("")

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }
    fetchOrders()
  }, [user])

  const fetchOrders = async () => {
    setLoading(true)
    setError("")
    try {
      const token = localStorage.getItem("auth_token")
      const res = await fetch(`${API_BASE}/orders/index.php`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.message || "Failed to fetch")
      setRows(data.rows)
    } catch (err: any) {
      setError(err.message || "Failed to load orders")
    } finally {
      setLoading(false)
    }
  }

  const isAdmin = user?.role === "admin"

  const adminColumns = ["ID", "Order ID", "Client", "Address", "Assigned", "Due", "Inspection", "Item", "Created At", "Mail Sent"]
  const userColumns = ["Order ID", "Client", "Address", "Due", "Status", "Created At"]

  const columns = isAdmin ? adminColumns : userColumns

  const filteredRows = rows.filter((row) =>
    Object.values(row).some((val) =>
      String(val).toLowerCase().includes(search.toLowerCase())
    )
  )

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Orders / Tracking</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isAdmin ? "Admin view — all columns visible" : "Showing your order data"}
          </p>
        </div>
        <button
          onClick={fetchOrders}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Refresh
        </button>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search orders..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-sm rounded-md border border-border bg-input px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      )}

      {/* Table */}
      {!loading && !error && (
        <>
          <div className="rounded-lg border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    {columns.map((col) => (
                      <th
                        key={col}
                        className="px-4 py-3 text-left font-medium text-muted-foreground whitespace-nowrap"
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredRows.length === 0 ? (
                    <tr>
                      <td
                        colSpan={columns.length}
                        className="px-4 py-8 text-center text-muted-foreground"
                      >
                        No orders found
                      </td>
                    </tr>
                  ) : (
                    filteredRows.map((row, i) => (
                      <tr key={i} className="hover:bg-muted/50 transition-colors">
                        {isAdmin ? (
                          <>
                            <td className="px-4 py-3 text-foreground">{(row as AdminRow).id}</td>
                            <td className="px-4 py-3 text-foreground font-medium">{(row as AdminRow).order_id}</td>
                            <td className="px-4 py-3 text-foreground">{(row as AdminRow).client}</td>
                            <td className="px-4 py-3 text-foreground">{(row as AdminRow).address}</td>
                            <td className="px-4 py-3 text-foreground">{(row as AdminRow).assigned}</td>
                            <td className="px-4 py-3 text-foreground">{(row as AdminRow).due}</td>
                            <td className="px-4 py-3">
                              <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                                {(row as AdminRow).inspection}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-foreground">{(row as AdminRow).item}</td>
                            <td className="px-4 py-3 text-muted-foreground">{(row as AdminRow).created_at}</td>
                            <td className="px-4 py-3">
                              <span className={`rounded-full px-2 py-1 text-xs font-medium ${
                                (row as AdminRow).mail_sent === '1'
                                  ? 'bg-green-500/10 text-green-500'
                                  : 'bg-yellow-500/10 text-yellow-500'
                              }`}>
                                {(row as AdminRow).mail_sent === '1' ? 'Sent' : 'Pending'}
                              </span>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="px-4 py-3 text-foreground font-medium">{(row as UserRow).order_id}</td>
                            <td className="px-4 py-3 text-foreground">{(row as UserRow).client}</td>
                            <td className="px-4 py-3 text-foreground">{(row as UserRow).address}</td>
                            <td className="px-4 py-3 text-foreground">{(row as UserRow).due}</td>
                            <td className="px-4 py-3">
                              <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                                {(row as UserRow).status}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-muted-foreground">{(row as UserRow).created_at}</td>
                          </>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Showing {filteredRows.length} of {rows.length} records
          </p>
        </>
      )}
    </div>
  )
}
