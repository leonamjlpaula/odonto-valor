import Link from 'next/link';
import { Button } from '@/presentation/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/presentation/components/ui/card';
import {
  getTopProcedimentos,
  getProcedimentosNoVermelho,
} from '@/application/usecases/dashboardActions';

function formatBRL(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

export async function TablesSection({ userId }: { userId: string }) {
  const [topProcedimentos, procedimentosNoVermelho] = await Promise.all([
    getTopProcedimentos(userId, 5),
    getProcedimentosNoVermelho(userId, 5),
  ]);

  return (
    <>
      <div className="grid gap-6 lg:grid-cols-2">
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

        <Card>
          <CardHeader>
            <CardTitle className="text-base text-red-700">Procedimentos no Vermelho</CardTitle>
            <CardDescription>Margem abaixo de 10% — requer atenção</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {procedimentosNoVermelho.length === 0 ? (
              <p className="px-6 pb-6 text-sm text-muted-foreground">
                Nenhum procedimento com margem abaixo de 10%. Configure o preço de venda nos
                procedimentos para monitorar.
              </p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs text-muted-foreground">
                    <th className="px-6 py-2 font-medium">Procedimento</th>
                    <th className="px-6 py-2 text-right font-medium">Margem</th>
                    <th className="px-6 py-2 text-right font-medium">Mín. 30%</th>
                  </tr>
                </thead>
                <tbody>
                  {procedimentosNoVermelho.map((p, i) => (
                    <tr
                      key={p.id}
                      className={i < procedimentosNoVermelho.length - 1 ? 'border-b' : ''}
                    >
                      <td className="px-6 py-3">
                        <Link
                          href={`/procedimentos/${p.especialidadeSlug}/${p.id}`}
                          className="font-medium hover:underline"
                        >
                          {p.nome}
                        </Link>
                        <p className="text-xs text-muted-foreground">{p.especialidadeNome}</p>
                      </td>
                      <td className="px-6 py-3 text-right tabular-nums font-medium text-red-600">
                        {(p.margemLucro * 100).toFixed(1)}%
                      </td>
                      <td className="px-6 py-3 text-right tabular-nums text-muted-foreground">
                        {formatBRL(p.precoMinimoParaMargem30)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button asChild>
          <Link href="/custos-fixos">Editar Custos Fixos</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/procedimentos/diagnostico">Ver Todos os Procedimentos</Link>
        </Button>
      </div>
    </>
  );
}
