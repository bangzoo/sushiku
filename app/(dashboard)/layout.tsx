import BottomNav from '@/components/layout/BottomNav'
import OfflineIndicator from '@/components/shared/OfflineIndicator'
import InstallPrompt from '@/components/InstallPrompt'
import StrukSheet from '@/components/kasir/StrukSheet'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <OfflineIndicator />
      <main className="page-container">
        {children}
      </main>
      <BottomNav />
      <InstallPrompt />
      <StrukSheet />
    </>
  )
}
