import { MainDashboard } from '@/components/dashboard/main-dashboard'
import { CollectionPage } from '@/components/dashboard/collection-page'
export const metadata = { title: 'Collection — Main Dashboard | PRVLG' }
export default function Page() { return <MainDashboard activePage="Collection"><CollectionPage /></MainDashboard> }
