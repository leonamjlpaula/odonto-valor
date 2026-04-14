import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { getAuthUserId } from '@/lib/supabase/server'
import { prisma } from '@/lib/db'
import { Skeleton } from '@/presentation/components/ui/skeleton'
import { DashboardShell } from '@/presentation/components/dashboard/DashboardShell'
import { StatsSection } from '@/presentation/components/dashboard/StatsSection'
import { TablesSection } from '@/presentation/components/dashboard/TablesSection'

function StatsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-lg border bg-card p-4 space-y-2">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-8 w-36" />
            <Skeleton className="h-3 w-20" />
          </div>
        ))}
      </div>
      <div className="rounded-lg border bg-card p-4 space-y-3">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-14 w-full rounded-lg" />
        <Skeleton className="h-14 w-full rounded-lg" />
        <Skeleton className="h-14 w-full rounded-lg" />
      </div>
    </div>
  )
}

function TablesSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {Array.from({ length: 2 }).map((_, i) => (
        <div key={i} className="rounded-lg border bg-card p-4 space-y-3">
          <Skeleton className="h-4 w-40" />
          {Array.from({ length: 5 }).map((_, j) => (
            <div key={j} className="flex items-center justify-between py-1">
              <div className="space-y-1">
                <Skeleton className="h-3 w-36" />
                <Skeleton className="h-2.5 w-24" />
              </div>
              <Skeleton className="h-3 w-20" />
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

export default async function DashboardRoute() {
  const userId = await getAuthUserId()
  if (!userId) redirect('/login')

  const profile = await prisma.user.findUnique({
    where: { id: userId },
    select: { onboardingCompleted: true, perfilConsultorio: true },
  })

  return (
    <div className="space-y-6">
      <DashboardShell
        userId={userId}
        onboardingCompleted={profile?.onboardingCompleted ?? true}
        perfilConsultorio={profile?.perfilConsultorio ?? null}
      />
      <Suspense fallback={<StatsSkeleton />}>
        <StatsSection userId={userId} />
      </Suspense>
      <Suspense fallback={<TablesSkeleton />}>
        <TablesSection userId={userId} />
      </Suspense>
    </div>
  )
}
