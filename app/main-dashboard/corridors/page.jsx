import { MainDashboard } from '@/components/dashboard/main-dashboard'
import { CorridorIntelligence } from '@/components/dashboard/corridor-intelligence'

export const metadata = { title: 'Corridors — Main Dashboard | PRVLG' }
export default function CorridorsPage() { return <MainDashboard activePage="Corridors"><CorridorIntelligence /></MainDashboard> }
