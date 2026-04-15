import { prisma } from '@/lib/db';
import type {
  IProcedimentoRepository,
  ProcedimentoWithMateriais,
} from '@/application/interfaces/IProcedimentoRepository';

export class PrismaProcedimentoRepository implements IProcedimentoRepository {
  async listByUserAndEspecialidade(
    userId: string,
    especialidadeId: string
  ): Promise<ProcedimentoWithMateriais[]> {
    return prisma.procedimento.findMany({
      where: { userId, especialidadeId },
      include: {
        especialidade: true,
        materiais: {
          include: { material: true },
          orderBy: { ordem: 'asc' },
        },
      },
      orderBy: { codigo: 'asc' },
    });
  }

  async getDetail(id: string, userId: string): Promise<ProcedimentoWithMateriais | null> {
    return prisma.procedimento.findFirst({
      where: { id, userId },
      include: {
        especialidade: true,
        materiais: {
          include: { material: true },
          orderBy: { ordem: 'asc' },
        },
      },
    });
  }
}
