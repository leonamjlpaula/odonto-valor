import Link from 'next/link';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/presentation/components/ui/card';
import {
  getDashboardStats,
  contarProcedimentosNoVermelho,
} from '@/application/usecases/dashboardActions';
import { margemColor } from '@/application/usecases/calcularPrecoProcedimento';
import { TermTooltip } from '@/presentation/components/ui/TermTooltip';

function formatBRL(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

export async function StatsSection({ userId }: { userId: string }) {
  const [stats, totalProcedimentosNoVermelho] = await Promise.all([
    getDashboardStats(userId),
    contarProcedimentosNoVermelho(userId),
  ]);

  const hasAlertas =
    totalProcedimentosNoVermelho > 0 ||
    stats.custosDesatualizados ||
    stats.ociosidadeNaoConfigurada;

  const corMargemMedia = margemColor(stats.margemMedia);

  return (
    <>
      {hasAlertas && (
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-foreground">Atenção necessária</h2>
          {totalProcedimentosNoVermelho > 0 && (
            <div className="rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">
              🔴 {totalProcedimentosNoVermelho} procedimento
              {totalProcedimentosNoVermelho > 1 ? 's' : ''} com margem abaixo de 10%.{' '}
              <Link
                href="/procedimentos/diagnostico"
                className="font-medium underline underline-offset-2"
              >
                Ver procedimentos
              </Link>
            </div>
          )}
          {stats.custosDesatualizados && (
            <div className="rounded-md border border-yellow-300 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
              ⚠️ Os custos fixos não são atualizados há mais de 6 meses. Revise os valores para
              manter sua precificação precisa.{' '}
              <Link href="/custos-fixos" className="font-medium underline underline-offset-2">
                Atualizar agora
              </Link>
            </div>
          )}
          {stats.ociosidadeNaoConfigurada && (
            <div className="rounded-md border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
              💡 Sua taxa de <TermTooltip term="ociosidade">ociosidade</TermTooltip> está em 0%.
              Clínicas típicas ficam com 20% do tempo ocioso — configurar esse valor torna o custo
              por minuto mais realista.{' '}
              <Link href="/custos-fixos" className="font-medium underline underline-offset-2">
                Configurar agora
              </Link>
            </div>
          )}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link href="/procedimentos/diagnostico" className="block">
          <Card className="h-full transition-shadow hover:shadow-md">
            <CardHeader className="pb-2">
              <CardDescription>Procedimentos no Vermelho</CardDescription>
              <CardTitle className="text-3xl tabular-nums">
                {totalProcedimentosNoVermelho > 0 ? (
                  <span className="text-red-600">{totalProcedimentosNoVermelho}</span>
                ) : (
                  <span className="text-green-600">0</span>
                )}
                <span className="ml-1 text-lg font-normal text-muted-foreground">
                  / {stats.totalProcedimentosComPreco}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                {totalProcedimentosNoVermelho > 0
                  ? 'Margem abaixo de 10% — clique para ver'
                  : 'Todos os procedimentos com preço estão saudáveis'}
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/procedimentos" className="block">
          <Card className="h-full transition-shadow hover:shadow-md">
            <CardHeader className="pb-2">
              <CardDescription>Margem Média</CardDescription>
              <CardTitle className="text-3xl tabular-nums">
                {stats.margemMedia !== null ? (
                  <span
                    className={
                      corMargemMedia === 'green'
                        ? 'text-green-600'
                        : corMargemMedia === 'yellow'
                          ? 'text-yellow-600'
                          : 'text-red-600'
                    }
                  >
                    {(stats.margemMedia * 100).toFixed(1)}%
                  </span>
                ) : (
                  <span className="text-muted-foreground text-2xl">—</span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                {stats.margemMedia !== null
                  ? 'Média dos procedimentos com preço de venda'
                  : 'Configure preços de venda nos procedimentos'}
              </p>
            </CardContent>
          </Card>
        </Link>

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
      </div>

      {stats.breakEven.comProLabore > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Pontos de Equilíbrio Mensal</CardTitle>
            <CardDescription>
              Estimativa com ocupação 100% — quanto você precisa faturar para cobrir cada nível de
              custo.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between rounded-lg border border-orange-200 bg-orange-50 px-4 py-3">
              <div>
                <p className="text-sm font-medium text-orange-900">
                  Para pagar os custos do consultório
                </p>
                <p className="text-xs text-orange-700 mt-0.5">
                  Itens fixos + <TermTooltip term="depreciacao">depreciação</TermTooltip> + retorno
                  (sem <TermTooltip term="proLabore">pró-labore</TermTooltip>)
                </p>
              </div>
              <span className="text-lg font-bold tabular-nums text-orange-900 ml-4 shrink-0">
                {formatBRL(stats.breakEven.semProLabore)}
                <span className="text-sm font-normal">/mês</span>
              </span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-green-200 bg-green-50 px-4 py-3">
              <div>
                <p className="text-sm font-medium text-green-900">
                  Para se pagar (custos + pró-labore)
                </p>
                <p className="text-xs text-green-700 mt-0.5">
                  Inclui pró-labore de {formatBRL(stats.breakEven.proLaboreMensal)}/mês — acima
                  disso é lucro
                </p>
              </div>
              <span className="text-lg font-bold tabular-nums text-green-900 ml-4 shrink-0">
                {formatBRL(stats.breakEven.comProLabore)}
                <span className="text-sm font-normal">/mês</span>
              </span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-purple-200 bg-purple-50 px-4 py-3">
              <div>
                <p className="text-sm font-medium text-purple-900">Faturamento mínimo semanal</p>
                <p className="text-xs text-purple-700 mt-0.5">
                  <TermTooltip term="breakEven">Break-even</TermTooltip> mensal (sem pró-labore) ÷ 4
                  semanas
                </p>
              </div>
              <span className="text-lg font-bold tabular-nums text-purple-900 ml-4 shrink-0">
                {formatBRL(stats.breakEven.semProLabore / 4)}
                <span className="text-sm font-normal">/sem</span>
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}
