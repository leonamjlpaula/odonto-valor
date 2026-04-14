import { cache } from 'react';
import { unstable_cache } from 'next/cache';
import { prisma } from '@/lib/db';
import { CustoFixoPorMinuto } from '@/domain/value-objects/CustoFixoPorMinuto';

/**
 * Cost per minute for a user.
 * React cache() deduplicates within a single request.
 * unstable_cache persists across requests and is invalidated on config save.
 */
export const calcularCustoFixoPorMinuto = cache(
  (userId: string): Promise<number> =>
    unstable_cache(
      async () => {
        const config = await prisma.custoFixoConfig.findUnique({
          where: { userId },
          include: { items: true },
        });
        if (!config) return 0;
        return CustoFixoPorMinuto.calculate(config, config.items);
      },
      [`custo-fixo-por-minuto-${userId}`],
      { tags: [`config-${userId}`] }
    )()
);

/** Returns percImpostos and percTaxaCartao from the user's config (with defaults). */
export const getPercConfig = cache(
  (userId: string): Promise<{ percImpostos: number; percTaxaCartao: number }> =>
    unstable_cache(
      async () => {
        const config = await prisma.custoFixoConfig.findUnique({
          where: { userId },
          select: { percImpostos: true, percTaxaCartao: true },
        });
        return {
          percImpostos: config?.percImpostos ?? 8,
          percTaxaCartao: config?.percTaxaCartao ?? 4,
        };
      },
      [`perc-config-${userId}`],
      { tags: [`config-${userId}`] }
    )()
);
