import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { listSnapshots } from '@/application/usecases/snapshotActions'
import { HistoricoPage } from '@/presentation/components/historico/HistoricoPage'

export default async function HistoricoRoute() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/login')

  const snapshots = await listSnapshots(session.user.id)

  return <HistoricoPage userId={session.user.id} initialSnapshots={snapshots} />
}
