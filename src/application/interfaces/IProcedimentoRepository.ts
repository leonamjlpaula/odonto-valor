import type { Procedimento, Especialidade, ProcedimentoMaterial, Material } from '@prisma/client'

export type ProcedimentoWithMateriais = Procedimento & {
  especialidade: Especialidade
  materiais: (ProcedimentoMaterial & { material: Material })[]
}

export interface IProcedimentoRepository {
  listByUserAndEspecialidade(userId: string, especialidadeId: string): Promise<ProcedimentoWithMateriais[]>
  getDetail(id: string, userId: string): Promise<ProcedimentoWithMateriais | null>
}
