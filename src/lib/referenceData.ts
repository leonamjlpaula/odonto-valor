import { unstable_cache } from 'next/cache';
import { prisma } from './db';

/**
 * Global reference tables (seeded, never mutated in production).
 * Cached for 24h — no tag invalidation needed.
 */

export const getEspecialidades = unstable_cache(
  () => prisma.especialidade.findMany({ orderBy: { faixaInicio: 'asc' } }),
  ['especialidades'],
  { revalidate: 86400 }
);

export const getVrpoRefs = unstable_cache(
  () => prisma.vRPOReferencia.findMany(),
  ['vrpo-referencias'],
  { revalidate: 86400 }
);
