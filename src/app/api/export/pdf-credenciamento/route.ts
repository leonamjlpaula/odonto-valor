import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/db'
import { CustoFixoPorMinuto } from '@/domain/value-objects/CustoFixoPorMinuto'
import { calcularPrecoProcedimento } from '@/application/usecases/calcularPrecoProcedimento'
import type { ProcedimentoWithMateriais } from '@/application/interfaces/IProcedimentoRepository'
import {
  CredenciamentoPdfService,
  type CredenciamentoCustoBreakdown,
  type CredenciamentoEspecialidade,
} from '@/infrastructure/services/CredenciamentoPdfService'

export async function GET(_request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })

  const userId = user.id
  const userName = user.user_metadata?.nome ?? user.email ?? 'Usuário'

  const [configComItems, procedimentosRaw] = await Promise.all([
    prisma.custoFixoConfig.findUnique({
      where: { userId },
      include: { items: { orderBy: { ordem: 'asc' } } },
    }),
    prisma.procedimento.findMany({
      where: { userId },
      include: {
        especialidade: true,
        materiais: { include: { material: true }, orderBy: { ordem: 'asc' } },
      },
      orderBy: [{ especialidade: { nome: 'asc' } }, { codigo: 'asc' }],
    }) as Promise<ProcedimentoWithMateriais[]>,
  ])

  if (!configComItems) {
    return new Response('Custos fixos não configurados', { status: 400 })
  }

  // ── Calculate cost/min and breakdown ──────────────────────────────────────

  const bd = CustoFixoPorMinuto.calculateBreakdown(configComItems, configComItems.items)
  const custoFixoPorMinuto = bd.porMinuto

  const {
    diasUteis,
    horasTrabalho,
    investimentoEquipamentos,
    anosDepreciacao,
    anosRetorno,
    numeroCadeiras,
    percOciosidade,
  } = configComItems

  const minutosUteis = diasUteis * horasTrabalho * 60 * (1 - percOciosidade / 100)
  const minutosAnuais = minutosUteis * 11
  const cadeiras = Math.max(1, numeroCadeiras)
  const totalItens = configComItems.items.reduce((sum, item) => sum + item.valor, 0)

  const depreciacaoMensal = minutosUteis > 0
    ? (investimentoEquipamentos / (anosDepreciacao * minutosAnuais)) * minutosUteis
    : 0

  const taxaRetornoMensal = minutosUteis > 0
    ? (investimentoEquipamentos / (anosRetorno * minutosAnuais)) * minutosUteis
    : 0

  const breakdown: CredenciamentoCustoBreakdown = {
    totalItens,
    depreciacaoMensal,
    remuneracaoMensal: bd.proLaboreMensal,
    taxaRetornoMensal,
    totalMensal: bd.comProLabore,
    minutosUteis,
    porMinuto: custoFixoPorMinuto,
  }

  // ── Fetch VRPO references ─────────────────────────────────────────────────

  const codigos = procedimentosRaw.map((p) => p.codigo)
  const vrpoRefs = await prisma.vRPOReferencia.findMany({ where: { codigo: { in: codigos } } })
  const vrpoMap = new Map(vrpoRefs.map((v) => [v.codigo, v.valorReferencia]))

  // ── Group procedures by specialty ─────────────────────────────────────────

  const especialidadeMap = new Map<string, CredenciamentoEspecialidade>()

  for (const p of procedimentosRaw) {
    const espNome = p.especialidade.nome
    if (!especialidadeMap.has(espNome)) {
      especialidadeMap.set(espNome, { nome: espNome, procedimentos: [] })
    }
    const preco = calcularPrecoProcedimento(
      p,
      custoFixoPorMinuto,
      configComItems.percImpostos,
      configComItems.percTaxaCartao,
    )
    especialidadeMap.get(espNome)!.procedimentos.push({
      codigo: p.codigo,
      nome: p.nome,
      tempoMinutos: p.tempoMinutos,
      custoVariavel: preco.custoVariavel,
      precoFinal: preco.precoFinal,
      vrpoReferencia: vrpoMap.get(p.codigo) ?? null,
    })
  }

  const especialidades: CredenciamentoEspecialidade[] = Array.from(especialidadeMap.values())

  // ── Generate PDF ──────────────────────────────────────────────────────────

  const generatedAt = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })

  const service = new CredenciamentoPdfService()
  const pdfBuffer = await service.generate({
    userName,
    generatedAt,
    configInfo: {
      diasUteis,
      horasTrabalho,
      numeroCadeiras: cadeiras,
      percOciosidade,
      investimentoEquipamentos,
      anosDepreciacao,
      salarioBase: configComItems.salarioBase,
      anosRetorno,
    },
    custoItems: configComItems.items.map((item) => ({ nome: item.nome, valor: item.valor })),
    breakdown,
    especialidades,
  })

  // ── Build filename and return ─────────────────────────────────────────────

  const dateStr = new Date().toISOString().split('T')[0]
  const nameSlug = userName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
  const filename = `credenciamento-${nameSlug}-${dateStr}.pdf`

  return new Response(new Uint8Array(pdfBuffer), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
