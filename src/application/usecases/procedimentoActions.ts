'use server'

import { prisma } from '@/lib/db'
import { PrismaProcedimentoRepository } from '@/infrastructure/repositories/PrismaProcedimentoRepository'
import { calcularCustoFixoPorMinuto } from './calcularCustoFixoPorMinuto'
import { calcularPrecoProcedimento } from './calcularPrecoProcedimento'
import type { ProcedimentoWithMateriais } from '@/application/interfaces/IProcedimentoRepository'
import type { PrecoCalculado } from './calcularPrecoProcedimento'

const repository = new PrismaProcedimentoRepository()

export type ProcedimentoComPreco = {
  procedimento: ProcedimentoWithMateriais
  precoCalculado: PrecoCalculado
  vrpoReferencia: number | null
}

// ─── getProcedimentosByEspecialidade ──────────────────────────────────────────

export async function getProcedimentosByEspecialidade(
  userId: string,
  especialidadeSlug: string
): Promise<ProcedimentoComPreco[]> {
  const especialidade = await prisma.especialidade.findUnique({
    where: { codigo: especialidadeSlug },
  })
  if (!especialidade) return []

  const procedimentos = await repository.listByUserAndEspecialidade(userId, especialidade.id)
  const custoFixoPorMinuto = await calcularCustoFixoPorMinuto(userId)

  // Fetch VRPO references for all procedure codes in a single query
  const codigos = procedimentos.map((p) => p.codigo)
  const vrpoRefs = await prisma.vRPOReferencia.findMany({
    where: { codigo: { in: codigos } },
  })
  const vrpoMap = new Map(vrpoRefs.map((v) => [v.codigo, v.valorReferencia]))

  return procedimentos.map((procedimento) => ({
    procedimento,
    precoCalculado: calcularPrecoProcedimento(procedimento, custoFixoPorMinuto),
    vrpoReferencia: vrpoMap.get(procedimento.codigo) ?? null,
  }))
}

// ─── searchProcedimentos ───────────────────────────────────────────────────────

export async function searchProcedimentos(
  userId: string,
  query: string
): Promise<ProcedimentoComPreco[]> {
  if (!query.trim()) return []

  const procedimentos = (await prisma.procedimento.findMany({
    where: {
      userId,
      OR: [
        { nome: { contains: query, mode: 'insensitive' } },
        { codigo: { contains: query, mode: 'insensitive' } },
      ],
    },
    include: {
      especialidade: true,
      materiais: {
        include: { material: true },
        orderBy: { ordem: 'asc' },
      },
    },
    orderBy: { codigo: 'asc' },
  })) as ProcedimentoWithMateriais[]

  const custoFixoPorMinuto = await calcularCustoFixoPorMinuto(userId)

  const codigos = procedimentos.map((p) => p.codigo)
  const vrpoRefs = await prisma.vRPOReferencia.findMany({
    where: { codigo: { in: codigos } },
  })
  const vrpoMap = new Map(vrpoRefs.map((v) => [v.codigo, v.valorReferencia]))

  return procedimentos.map((procedimento) => ({
    procedimento,
    precoCalculado: calcularPrecoProcedimento(procedimento, custoFixoPorMinuto),
    vrpoReferencia: vrpoMap.get(procedimento.codigo) ?? null,
  }))
}
