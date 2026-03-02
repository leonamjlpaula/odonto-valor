import { prisma } from '@/lib/db'
import { CustoFixoPorMinuto } from '@/domain/value-objects/CustoFixoPorMinuto'

export async function calcularCustoFixoPorMinuto(userId: string): Promise<number> {
  const config = await prisma.custoFixoConfig.findUnique({
    where: { userId },
    include: { items: true },
  })

  if (!config) return 0

  return CustoFixoPorMinuto.calculate(config, config.items)
}
