import { redirect } from 'next/navigation'
import { getAuthUserId } from '@/lib/supabase/server'
import { getSimuladorData } from '@/application/usecases/simuladorActions'
import { SimuladorPage } from '@/presentation/components/simulador/SimuladorPage'

export default async function SimuladorRoute() {
  const userId = await getAuthUserId()
  if (!userId) redirect('/login')

  const data = await getSimuladorData(userId)

  if (!data) {
    redirect('/custos-fixos')
  }

  return (
    <SimuladorPage
      config={data.config}
      totalItens={data.totalItens}
      custoFixoPorMinutoAtual={data.custoFixoPorMinutoAtual}
      procedimentos={data.procedimentos}
    />
  )
}
