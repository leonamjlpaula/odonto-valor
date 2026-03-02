import { prisma } from '@/lib/db'
import { calcularCustoFixoPorMinuto } from './calcularCustoFixoPorMinuto'
import { calcularPrecoProcedimento } from './calcularPrecoProcedimento'
import type { ProcedimentoWithMateriais } from '@/application/interfaces/IProcedimentoRepository'

export type SnapshotItem = {
  procedimentoId: string
  codigo: string
  nome: string
  especialidadeNome: string
  precoCalculado: number
}

export type SnapshotDados = {
  custoFixoPorMinuto: number
  procedimentos: SnapshotItem[]
}

export async function gerarSnapshot(userId: string): Promise<SnapshotDados> {
  const [procedimentos, custoFixoPorMinuto] = await Promise.all([
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
    calcularCustoFixoPorMinuto(userId),
  ])

  const snapshotProcedimentos: SnapshotItem[] = procedimentos.map((p) => ({
    procedimentoId: p.id,
    codigo: p.codigo,
    nome: p.nome,
    especialidadeNome: p.especialidade.nome,
    precoCalculado: calcularPrecoProcedimento(p, custoFixoPorMinuto).precoFinal,
  }))

  return {
    custoFixoPorMinuto,
    procedimentos: snapshotProcedimentos,
  }
}
