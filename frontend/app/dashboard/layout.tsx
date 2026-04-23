import { DashboardSidebar } from '@/components/dashboard/sidebar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen">
      <div className="hidden lg:block">
        <DashboardSidebar />
      </div>
      <main className="flex-1 overflow-auto bg-background">{children}</main>
    </div>
  )
}
