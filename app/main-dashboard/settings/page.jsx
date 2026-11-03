import { MainDashboard } from '@/components/dashboard/main-dashboard'
import { SettingsPage } from '@/components/dashboard/settings-page'

export const metadata = { title: 'Settings — Main Dashboard | PRVLG' }
export default function Page() { return <MainDashboard activePage="Settings"><SettingsPage /></MainDashboard> }
