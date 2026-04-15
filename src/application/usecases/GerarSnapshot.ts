import { prisma } from '@/lib/db';
import { calcularCustoFixoPorMinuto } from './calcularCustoFixoPorMinuto';
import { calcularPrecoProcedimento } from './calcularPrecoProcedimento';
import type { ProcedimentoWithMateriais } from '@/application/interfaces/IProcedimentoRepository';

export type SnapshotItem = {
  procedimentoId: string;
  codigo: string;
  nome: string;
  especialidadeNome: string;
  precoCalculado: number;
};

export type SnapshotCustoFixoItem = {
  nome: string;
  valor: number;
};

export type SnapshotDados = {
  custoFixoPorMinuto: number;
  /** Items de custo fixo no momento do snapshot (Fase 5+). Ausente em snapshots antigos. */
  custoFixoItems?: SnapshotCustoFixoItem[];
  procedimentos: SnapshotItem[];
};

export async function gerarSnapshot(userId: string): Promise<SnapshotDados> {
  const [procedimentos, configComItems, custoFixoPorMinuto] = await Promise.all([
    prisma.procedimento.findMany({
      where: { userId },
      include: {
        especialidade: true,
        materiais: {
          include: { material: true },
          orderBy: { ordem: 'asc' },
        },
      },
    }) as Promise<ProcedimentoWithMateriais[]>,
    prisma.custoFixoConfig.findUnique({
      where: { userId },
      include: { items: { orderBy: { ordem: 'asc' } } },
    }),
    calcularCustoFixoPorMinuto(userId),
  ]);

  const snapshotProcedimentos: SnapshotItem[] = procedimentos.map((p) => ({
    procedimentoId: p.id,
    codigo: p.codigo,
    nome: p.nome,
    especialidadeNome: p.especialidade.nome,
    precoCalculado: calcularPrecoProcedimento(p, custoFixoPorMinuto).precoFinal,
  }));

  const custoFixoItems: SnapshotCustoFixoItem[] | undefined = configComItems
    ? configComItems.items.map((item) => ({ nome: item.nome, valor: item.valor }))
    : undefined;

  return {
    custoFixoPorMinuto,
    custoFixoItems,
    procedimentos: snapshotProcedimentos,
  };
}
