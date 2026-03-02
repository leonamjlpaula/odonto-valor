import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getComparativoVRPO } from '@/application/usecases/comparativoActions'
import { ComparativoVRPOPage } from '@/presentation/components/comparativo-vrpo/ComparativoVRPOPage'

export default async function ComparativoVRPORoute() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/login')

  const data = await getComparativoVRPO(session.user.id)

  return <ComparativoVRPOPage data={data} />
}
