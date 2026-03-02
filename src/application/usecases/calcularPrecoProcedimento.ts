import type { ProcedimentoWithMateriais } from '@/application/interfaces/IProcedimentoRepository'

export type PrecoCalculado = {
  custoVariavel: number
  custoFixoTotal: number
  precoFinal: number
}

/**
 * Parse numeric value from consumo string.
 * Examples: "1 par" → 1, "2 tubetes" → 2, "0,5ml" → 0.5, "cobertura" → 1
 */
export function parseConsumoNumerico(consumo: string): number {
  // Replace Brazilian decimal comma with period
  const normalized = consumo.replace(',', '.')
  const match = normalized.match(/^(\d+(?:\.\d+)?)/)
  return match ? parseFloat(match[1]) : 1
}

/**
 * Calculate procedure price using VRPO methodology:
 * - custoVariavel: Σ (material.preco / pma.divisor) × consumoNumerico
 * - custoFixoTotal: procedimento.tempoMinutos × custoFixoPorMinuto
 * - precoFinal: custoFixoTotal + custoVariavel
 */
export function calcularPrecoProcedimento(
  procedimento: ProcedimentoWithMateriais,
  custoFixoPorMinuto: number
): PrecoCalculado {
  const custoVariavel = procedimento.materiais.reduce((sum, pma) => {
    const consumoNumerico = parseConsumoNumerico(pma.consumo)
    const custoPorUnidade = pma.material.preco / pma.divisor
    return sum + custoPorUnidade * consumoNumerico
  }, 0)

  const custoFixoTotal = procedimento.tempoMinutos * custoFixoPorMinuto
  const precoFinal = custoFixoTotal + custoVariavel

  return { custoVariavel, custoFixoTotal, precoFinal }
}
