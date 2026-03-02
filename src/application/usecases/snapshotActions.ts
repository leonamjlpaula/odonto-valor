'use server'

import { prisma } from '@/lib/db'
import { gerarSnapshot, type SnapshotDados } from './GerarSnapshot'

const SNAPSHOT_LIMIT = 10

export type SnapshotListItem = {
  id: string
  nome: string
  descricao: string | null
  custoFixoPorMinuto: number
  createdAt: Date
}

export type SnapshotFull = SnapshotListItem & {
  dados: SnapshotDados
}

export type ComparisonItem = {
  codigo: string
  nome: string
  especialidadeNome: string
  precoSnapshot: number
  precoAtual: number
  diferenca: number
  diferencaPerc: number
}

export type SnapshotActionResult = { success: boolean; error?: string }

// ─── createSnapshot ────────────────────────────────────────────────────────────

export async function createSnapshot(
  userId: string,
  nome: string,
  descricao?: string
): Promise<SnapshotActionResult> {
  if (!nome.trim()) return { success: false, error: 'Nome é obrigatório' }

  const count = await prisma.snapshot.count({ where: { userId } })
  if (count >= SNAPSHOT_LIMIT) {
    return {
      success: false,
      error: `Limite de ${SNAPSHOT_LIMIT} snapshots atingido. Exclua um snapshot antes de criar um novo.`,
    }
  }

  const dados = await gerarSnapshot(userId)

  await prisma.snapshot.create({
    data: {
      userId,
      nome: nome.trim(),
      descricao: descricao?.trim() || null,
      dados: dados as object,
      custoFixoPorMinuto: dados.custoFixoPorMinuto,
    },
  })

  return { success: true }
}

// ─── listSnapshots ─────────────────────────────────────────────────────────────

export async function listSnapshots(userId: string): Promise<SnapshotListItem[]> {
  return prisma.snapshot.findMany({
    where: { userId },
    select: {
      id: true,
      nome: true,
      descricao: true,
      custoFixoPorMinuto: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  })
}

// ─── getSnapshot ───────────────────────────────────────────────────────────────

export async function getSnapshot(id: string, userId: string): Promise<SnapshotFull | null> {
  const snapshot = await prisma.snapshot.findFirst({
    where: { id, userId },
  })

  if (!snapshot) return null

  return {
    id: snapshot.id,
    nome: snapshot.nome,
    descricao: snapshot.descricao,
    custoFixoPorMinuto: snapshot.custoFixoPorMinuto,
    createdAt: snapshot.createdAt,
    dados: snapshot.dados as SnapshotDados,
  }
}

// ─── deleteSnapshot ────────────────────────────────────────────────────────────

export async function deleteSnapshot(id: string, userId: string): Promise<SnapshotActionResult> {
  const snapshot = await prisma.snapshot.findFirst({ where: { id, userId } })
  if (!snapshot) return { success: false, error: 'Snapshot não encontrado' }

  await prisma.snapshot.delete({ where: { id } })
  return { success: true }
}

// ─── compareSnapshotWithCurrent ────────────────────────────────────────────────

export async function compareSnapshotWithCurrent(
  snapshotId: string,
  userId: string
): Promise<ComparisonItem[]> {
  const [snapshot, currentData] = await Promise.all([
    getSnapshot(snapshotId, userId),
    gerarSnapshot(userId),
  ])

  if (!snapshot) return []

  const currentMap = new Map(currentData.procedimentos.map((p) => [p.codigo, p]))

  return snapshot.dados.procedimentos.map((snapshotItem) => {
    const current = currentMap.get(snapshotItem.codigo)
    const precoAtual = current?.precoCalculado ?? 0
    const diferenca = precoAtual - snapshotItem.precoCalculado
    const diferencaPerc =
      snapshotItem.precoCalculado > 0 ? (diferenca / snapshotItem.precoCalculado) * 100 : 0

    return {
      codigo: snapshotItem.codigo,
      nome: snapshotItem.nome,
      especialidadeNome: snapshotItem.especialidadeNome,
      precoSnapshot: snapshotItem.precoCalculado,
      precoAtual,
      diferenca,
      diferencaPerc,
    }
  })
}
