'use server'

import { prisma } from '@/lib/db'
import { calcularCustoFixoPorMinuto } from './calcularCustoFixoPorMinuto'
import { getEspecialidades, getVrpoRefs } from '@/lib/referenceData'
import { calcularPrecoProcedimento } from './calcularPrecoProcedimento'
import type { ProcedimentoWithMateriais } from '@/application/interfaces/IProcedimentoRepository'

// ─── Types ─────────────────────────────────────────────────────────────────────

export type ComparativoSituacao = 'abaixo' | 'acima' | 'sem_referencia'

export type ComparativoItem = {
  id: string
  codigo: string
  nome: string
  especialidadeNome: string
  especialidadeSlug: string
  meuPreco: number
  vrpoReferencia: number | null
  diferencaReais: number | null
  diferencaPerc: number | null
  situacao: ComparativoSituacao
}

export type ComparativoEspecialidade = {
  id: string
  nome: string
  codigo: string
}

export type ComparativoVRPOData = {
  items: ComparativoItem[]
  especialidades: ComparativoEspecialidade[]
  totalAbaixo: number
  totalAcima: number
  totalSemReferencia: number
}

// ─── getComparativoVRPO ────────────────────────────────────────────────────────

export async function getComparativoVRPO(userId: string): Promise<ComparativoVRPOData> {
  const [procedimentos, custoFixoPorMinuto, especialidades, vrpoRefsRaw] = await Promise.all([
    prisma.procedimento.findMany({
      where: { userId },
      select: {
        id: true,
        codigo: true,
        nome: true,
        tempoMinutos: true,
        custoLaboratorio: true,
        especialidade: { select: { nome: true, codigo: true } },
        materiais: {
          select: {
            consumo: true,
            divisor: true,
            material: { select: { preco: true } },
          },
          orderBy: { ordem: 'asc' },
        },
      },
      orderBy: { codigo: 'asc' },
    }) as Promise<ProcedimentoWithMateriais[]>,
    calcularCustoFixoPorMinuto(userId),
    getEspecialidades(),
    getVrpoRefs(),
  ])

  const vrpoMap = new Map(vrpoRefsRaw.map((v) => [v.codigo, v.valorReferencia]))

  const items: ComparativoItem[] = procedimentos.map((p) => {
    const { precoFinal } = calcularPrecoProcedimento(p, custoFixoPorMinuto)
    const vrpo = vrpoMap.get(p.codigo) ?? null

    let diferencaReais: number | null = null
    let diferencaPerc: number | null = null
    let situacao: ComparativoSituacao = 'sem_referencia'

    if (vrpo !== null) {
      diferencaReais = precoFinal - vrpo
      diferencaPerc = ((precoFinal - vrpo) / vrpo) * 100
      situacao = precoFinal >= vrpo ? 'acima' : 'abaixo'
    }

    return {
      id: p.id,
      codigo: p.codigo,
      nome: p.nome,
      especialidadeNome: p.especialidade.nome,
      especialidadeSlug: p.especialidade.codigo,
      meuPreco: precoFinal,
      vrpoReferencia: vrpo,
      diferencaReais,
      diferencaPerc,
      situacao,
    }
  })

  // Default sort: most negative diferencaPerc first; null (sem_referencia) goes last
  items.sort((a, b) => {
    if (a.diferencaPerc === null && b.diferencaPerc === null) return 0
    if (a.diferencaPerc === null) return 1
    if (b.diferencaPerc === null) return -1
    return a.diferencaPerc - b.diferencaPerc
  })

  const totalAbaixo = items.filter((i) => i.situacao === 'abaixo').length
  const totalAcima = items.filter((i) => i.situacao === 'acima').length
  const totalSemReferencia = items.filter((i) => i.situacao === 'sem_referencia').length

  return {
    items,
    especialidades: especialidades.map((e) => ({ id: e.id, nome: e.nome, codigo: e.codigo })),
    totalAbaixo,
    totalAcima,
    totalSemReferencia,
  }
}
