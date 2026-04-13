'use server'

import { prisma } from '@/lib/db'
import { CustoFixoPorMinuto } from '@/domain/value-objects/CustoFixoPorMinuto'
import { calcularPrecoProcedimento } from './calcularPrecoProcedimento'
import type { ProcedimentoWithMateriais } from '@/application/interfaces/IProcedimentoRepository'

export type SimuladorProcedimento = {
  id: string
  codigo: string
  nome: string
  especialidadeNome: string
  tempoMinutos: number
  custoVariavel: number
  precoVenda: number | null
}

export type SimuladorConfig = {
  diasUteis: number
  horasTrabalho: number
  investimentoEquipamentos: number
  anosDepreciacao: number
  salarioBase: number
  percFundoReserva: number
  percInsalubridade: number
  percImprevistos: number
  anosRetorno: number
  numeroCadeiras: number
  percOciosidade: number
  percImpostos: number
  percTaxaCartao: number
}

export type SimuladorData = {
  config: SimuladorConfig
  totalItens: number
  custoFixoPorMinutoAtual: number
  procedimentos: SimuladorProcedimento[]
}

export async function getSimuladorData(userId: string): Promise<SimuladorData | null> {
  const [configComItems, procedimentos] = await Promise.all([
    prisma.custoFixoConfig.findUnique({
      where: { userId },
      include: { items: true },
    }),
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
  ])

  if (!configComItems) return null

  const totalItens = configComItems.items.reduce((sum, item) => sum + item.valor, 0)
  const custoFixoPorMinutoAtual = CustoFixoPorMinuto.calculate(configComItems, configComItems.items)

  const procedimentosSimulados: SimuladorProcedimento[] = procedimentos.map((p) => {
    const preco = calcularPrecoProcedimento(
      p,
      custoFixoPorMinutoAtual,
      configComItems.percImpostos,
      configComItems.percTaxaCartao,
    )
    return {
      id: p.id,
      codigo: p.codigo,
      nome: p.nome,
      especialidadeNome: p.especialidade.nome,
      tempoMinutos: p.tempoMinutos,
      custoVariavel: preco.custoVariavel,
      precoVenda: p.precoVenda ?? null,
    }
  })

  const config: SimuladorConfig = {
    diasUteis: configComItems.diasUteis,
    horasTrabalho: configComItems.horasTrabalho,
    investimentoEquipamentos: configComItems.investimentoEquipamentos,
    anosDepreciacao: configComItems.anosDepreciacao,
    salarioBase: configComItems.salarioBase,
    percFundoReserva: configComItems.percFundoReserva,
    percInsalubridade: configComItems.percInsalubridade,
    percImprevistos: configComItems.percImprevistos,
    anosRetorno: configComItems.anosRetorno,
    numeroCadeiras: configComItems.numeroCadeiras,
    percOciosidade: configComItems.percOciosidade,
    percImpostos: configComItems.percImpostos,
    percTaxaCartao: configComItems.percTaxaCartao,
  }

  return { config, totalItens, custoFixoPorMinutoAtual, procedimentos: procedimentosSimulados }
}
