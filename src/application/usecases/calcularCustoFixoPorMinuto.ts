import { cache } from 'react'
import { prisma } from '@/lib/db'
import { CustoFixoPorMinuto } from '@/domain/value-objects/CustoFixoPorMinuto'

export const calcularCustoFixoPorMinuto = cache(async function calcularCustoFixoPorMinuto(userId: string): Promise<number> {
  const config = await prisma.custoFixoConfig.findUnique({
    where: { userId },
    include: { items: true },
  })

  if (!config) return 0

  return CustoFixoPorMinuto.calculate(config, config.items)
})

/** Returns percImpostos and percTaxaCartao from the user's config (with defaults). */
export const getPercConfig = cache(async function getPercConfig(
  userId: string
): Promise<{ percImpostos: number; percTaxaCartao: number }> {
  const config = await prisma.custoFixoConfig.findUnique({
    where: { userId },
    select: { percImpostos: true, percTaxaCartao: true },
  })
  return {
    percImpostos: config?.percImpostos ?? 8,
    percTaxaCartao: config?.percTaxaCartao ?? 4,
  }
})
