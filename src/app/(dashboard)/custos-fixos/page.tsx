import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { getCustoFixoConfig } from '@/application/usecases/custoFixoActions'
import { CustosFixosForm } from '@/presentation/components/custos-fixos/CustosFixosForm'

export default async function CustosFixosPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/login')

  const userId = session.user.id
  const data = await getCustoFixoConfig(userId)

  if (!data) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Custos Fixos</h1>
        <p className="text-muted-foreground">
          Configuração não encontrada. Por favor, entre em contato com o suporte.
        </p>
      </div>
    )
  }

  return (
    <CustosFixosForm
      userId={userId}
      initialConfig={data.config}
      initialItems={data.items}
    />
  )
}
