'use client'

import Link from 'next/link'
import { Button } from '@/presentation/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/presentation/components/ui/card'
import type { DashboardStats, TopProcedimento, BottomVRPOProcedimento } from '@/application/usecases/dashboardActions'

type Props = {
  stats: DashboardStats
  topProcedimentos: TopProcedimento[]
  bottomVRPO: BottomVRPOProcedimento[]
  lastUpdate: Date | null
}

function formatBRL(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

function formatPerc(value: number) {
  return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`
}

export function DashboardPage({ stats, topProcedimentos, bottomVRPO, lastUpdate }: Props) {
  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
  const isStale = lastUpdate !== null && new Date(lastUpdate) < sixMonthsAgo

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Button variant="outline" disabled title="Disponível em breve">
          Salvar Snapshot Atual
        </Button>
      </div>

      {/* Stale warning */}
      {isStale && (
        <div className="rounded-md border border-yellow-300 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
          ⚠️ Os custos fixos não são atualizados há mais de 6 meses. Revise os valores para manter
          sua precificação precisa.{' '}
          <Link href="/custos-fixos" className="font-medium underline underline-offset-2">
            Atualizar agora
          </Link>
        </div>
      )}

      {/* Stats cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link href="/custos-fixos" className="block">
          <Card className="h-full transition-shadow hover:shadow-md">
            <CardHeader className="pb-2">
              <CardDescription>Custo Fixo por Minuto</CardDescription>
              <CardTitle className="text-3xl tabular-nums">
                {formatBRL(stats.custoFixoPorMinuto)}
                <span className="ml-1 text-lg font-normal text-muted-foreground">/ min</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">Clique para editar os custos fixos</p>
            </CardContent>
          </Card>
        </Link>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Custos Fixos Mensais</CardDescription>
            <CardTitle className="text-3xl tabular-nums">
              {formatBRL(stats.totalCustosFixosMensais)}
              <span className="ml-1 text-lg font-normal text-muted-foreground">/ mês</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {lastUpdate
                ? `Atualizado em ${new Date(lastUpdate).toLocaleDateString('pt-BR')}`
                : 'Nenhuma configuração salva'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Procedimentos Cadastrados</CardDescription>
            <CardTitle className="text-3xl tabular-nums">{stats.totalProcedimentos}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {stats.totalMateriais} materiais cadastrados
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tables section */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top procedures */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Procedimentos Mais Caros</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {topProcedimentos.length === 0 ? (
              <p className="px-6 pb-6 text-sm text-muted-foreground">
                Nenhum procedimento calculado ainda.
              </p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs text-muted-foreground">
                    <th className="px-6 py-2 font-medium">Procedimento</th>
                    <th className="px-6 py-2 text-right font-medium">Preço Calculado</th>
                  </tr>
                </thead>
                <tbody>
                  {topProcedimentos.map((p, i) => (
                    <tr key={p.id} className={i < topProcedimentos.length - 1 ? 'border-b' : ''}>
                      <td className="px-6 py-3">
                        <Link
                          href={`/procedimentos/${p.especialidadeSlug}/${p.id}`}
                          className="font-medium hover:underline"
                        >
                          {p.nome}
                        </Link>
                        <p className="text-xs text-muted-foreground">{p.especialidadeNome}</p>
                      </td>
                      <td className="px-6 py-3 text-right tabular-nums">
                        {formatBRL(p.precoFinal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>

        {/* Bottom VRPO procedures */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Mais Abaixo da Tabela VRPO</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {bottomVRPO.length === 0 ? (
              <p className="px-6 pb-6 text-sm text-muted-foreground">
                Nenhum procedimento abaixo da referência VRPO.
              </p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs text-muted-foreground">
                    <th className="px-6 py-2 font-medium">Procedimento</th>
                    <th className="px-6 py-2 text-right font-medium">Meu Preço</th>
                    <th className="px-6 py-2 text-right font-medium">VRPO Ref.</th>
                    <th className="px-6 py-2 text-right font-medium">Dif. %</th>
                  </tr>
                </thead>
                <tbody>
                  {bottomVRPO.map((p, i) => (
                    <tr key={p.id} className={i < bottomVRPO.length - 1 ? 'border-b' : ''}>
                      <td className="px-6 py-3">
                        <Link
                          href={`/procedimentos/${p.especialidadeSlug}/${p.id}`}
                          className="font-medium hover:underline"
                        >
                          {p.nome}
                        </Link>
                        <p className="text-xs text-muted-foreground">{p.especialidadeNome}</p>
                      </td>
                      <td className="px-6 py-3 text-right tabular-nums">
                        {formatBRL(p.precoFinal)}
                      </td>
                      <td className="px-6 py-3 text-right tabular-nums text-muted-foreground">
                        {formatBRL(p.vrpoReferencia)}
                      </td>
                      <td className="px-6 py-3 text-right tabular-nums font-medium text-red-600">
                        {formatPerc(p.diferencaPerc)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-3">
        <Button asChild>
          <Link href="/custos-fixos">Editar Custos Fixos</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/procedimentos/diagnostico">Ver Todos os Procedimentos</Link>
        </Button>
      </div>
    </div>
  )
}
