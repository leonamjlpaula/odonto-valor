import { prisma } from '@/lib/db'
import type {
  ICustoFixoRepository,
  CustoFixoWithItems,
  UpsertCustoFixoData,
} from '@/application/interfaces/ICustoFixoRepository'

export class PrismaCustoFixoRepository implements ICustoFixoRepository {
  async getByUserId(userId: string): Promise<CustoFixoWithItems | null> {
    return prisma.custoFixoConfig.findUnique({
      where: { userId },
      include: { items: { orderBy: { ordem: 'asc' } } },
    })
  }

  async upsert(userId: string, data: UpsertCustoFixoData): Promise<CustoFixoWithItems> {
    const { items, ...configData } = data

    // Get existing config to determine if we need to create or update
    const existing = await prisma.custoFixoConfig.findUnique({
      where: { userId },
      include: { items: true },
    })

    if (!existing) {
      // Create new config with items
      return prisma.custoFixoConfig.create({
        data: {
          userId,
          ...configData,
          items: items
            ? {
                create: items.map((item) => ({
                  nome: item.nome,
                  valor: item.valor,
                  ordem: item.ordem,
                  isCustom: item.isCustom,
                })),
              }
            : undefined,
        },
        include: { items: { orderBy: { ordem: 'asc' } } },
      })
    }

    // Update config and sync items
    if (items !== undefined) {
      // Delete all existing items and recreate — simplest upsert strategy
      await prisma.custoFixoItem.deleteMany({ where: { configId: existing.id } })
      await prisma.custoFixoItem.createMany({
        data: items.map((item) => ({
          configId: existing.id,
          nome: item.nome,
          valor: item.valor,
          ordem: item.ordem,
          isCustom: item.isCustom,
        })),
      })
    }

    return prisma.custoFixoConfig.update({
      where: { userId },
      data: configData,
      include: { items: { orderBy: { ordem: 'asc' } } },
    })
  }
}
