import { MainDashboard } from '@/components/dashboard/main-dashboard'
import { JournalPage } from '@/components/dashboard/journal-page'
export const metadata = { title: 'Journal — Main Dashboard | PRVLG' }
export default function Page() { return <MainDashboard activePage="Journal"><JournalPage /></MainDashboard> }
