import { MainDashboard } from '@/components/dashboard/main-dashboard'
import { AudienceRecords } from '@/components/dashboard/audience-records'

export const metadata = { title: 'Audience — Main Dashboard | PRVLG' }
export default function AudiencePage() { return <MainDashboard activePage="Audience"><AudienceRecords /></MainDashboard> }
