import { MainDashboard } from '@/components/dashboard/main-dashboard'
import { CampaignPage } from '@/components/dashboard/campaign-page'
export const metadata = { title: 'Campaign — Main Dashboard | PRVLG' }
export default function Page() { return <MainDashboard activePage="Campaign"><CampaignPage /></MainDashboard> }
