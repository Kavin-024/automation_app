import { PortalProvider } from "@/context/portal-context"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <PortalProvider>{children}</PortalProvider>
}
