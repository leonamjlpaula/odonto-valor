import { redirect } from 'next/navigation'
import { getAuthUserId } from '@/lib/supabase/server'
import { prisma } from '@/lib/db'
import {
  getDashboardStats,
  getTopProcedimentos,
  getProcedimentosNoVermelho,
  contarProcedimentosNoVermelho,
} from '@/application/usecases/dashboardActions'
import { DashboardPage } from '@/presentation/components/dashboard/DashboardPage'

export default async function DashboardRoute() {
  const userId = await getAuthUserId()
  if (!userId) redirect('/login')

  const [stats, topProcedimentos, procedimentosNoVermelho, profile, totalProcedimentosNoVermelho] =
    await Promise.all([
      getDashboardStats(userId),
      getTopProcedimentos(userId, 5),
      getProcedimentosNoVermelho(userId, 5),
      prisma.user.findUnique({
        where: { id: userId },
        select: { onboardingCompleted: true, perfilConsultorio: true },
      }),
      contarProcedimentosNoVermelho(userId),
    ])

  return (
    <DashboardPage
      userId={userId}
      stats={stats}
      topProcedimentos={topProcedimentos}
      procedimentosNoVermelho={procedimentosNoVermelho}
      lastUpdate={stats.lastUpdate}
      onboardingCompleted={profile?.onboardingCompleted ?? true}
      perfilConsultorio={profile?.perfilConsultorio ?? null}
      totalProcedimentosNoVermelho={totalProcedimentosNoVermelho}
    />
  )
}
