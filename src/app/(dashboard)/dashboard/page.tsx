import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import {
  getDashboardStats,
  getTopProcedimentos,
  getBottomProcedimentosVRPO,
  getLastUpdateInfo,
} from '@/application/usecases/dashboardActions'
import { DashboardPage } from '@/presentation/components/dashboard/DashboardPage'

export default async function DashboardRoute() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/login')

  const userId = session.user.id

  const [stats, topProcedimentos, bottomVRPO, lastUpdate] = await Promise.all([
    getDashboardStats(userId),
    getTopProcedimentos(userId, 5),
    getBottomProcedimentosVRPO(userId, 5),
    getLastUpdateInfo(userId),
  ])

  return (
    <DashboardPage
      stats={stats}
      topProcedimentos={topProcedimentos}
      bottomVRPO={bottomVRPO}
      lastUpdate={lastUpdate}
    />
  )
}
