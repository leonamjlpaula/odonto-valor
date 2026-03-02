'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import * as Popover from '@radix-ui/react-popover'
import { HelpCircle, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import type {
  ComparativoVRPOData,
  ComparativoSituacao,
} from '@/application/usecases/comparativoActions'

// ─── Formatters ───────────────────────────────────────────────────────────────

function formatBRL(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

function formatPerc(value: number) {
  return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`
}

// ─── Types ─────────────────────────────────────────────────────────────────────

type SituacaoFilter = 'todos' | ComparativoSituacao

// ─── Component ────────────────────────────────────────────────────────────────

type Props = {
  data: ComparativoVRPOData
}

export function ComparativoVRPOPage({ data }: Props) {
  const { items, especialidades, totalAbaixo, totalAcima, totalSemReferencia } = data

  const [situacaoFilter, setSituacaoFilter] = useState<SituacaoFilter>('todos')
  const [especialidadeFilter, setEspecialidadeFilter] = useState<string>('todas')

  const filtered = useMemo(() => {
    return items.filter((item) => {
      if (situacaoFilter !== 'todos' && item.situacao !== situacaoFilter) return false
      if (especialidadeFilter !== 'todas' && item.especialidadeSlug !== especialidadeFilter)
        return false
      return true
    })
  }, [items, situacaoFilter, especialidadeFilter])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Comparativo VRPO</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Compare seus preços calculados com a tabela de referência VRPO.
        </p>
      </div>

      {/* Summary stats */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => setSituacaoFilter('abaixo')}
          className={cn(
            'rounded-full border px-4 py-1.5 text-sm font-medium transition-colors',
            situacaoFilter === 'abaixo'
              ? 'border-red-500 bg-red-50 text-red-700'
              : 'border-red-200 bg-red-50 text-red-700 hover:bg-red-100'
          )}
        >
          {totalAbaixo} abaixo da VRPO
        </button>
        <button
          onClick={() => setSituacaoFilter('acima')}
          className={cn(
            'rounded-full border px-4 py-1.5 text-sm font-medium transition-colors',
            situacaoFilter === 'acima'
              ? 'border-green-500 bg-green-50 text-green-700'
              : 'border-green-200 bg-green-50 text-green-700 hover:bg-green-100'
          )}
        >
          {totalAcima} acima da VRPO
        </button>
        <button
          onClick={() => setSituacaoFilter('sem_referencia')}
          className={cn(
            'rounded-full border px-4 py-1.5 text-sm font-medium transition-colors',
            situacaoFilter === 'sem_referencia'
              ? 'border-gray-500 bg-gray-100 text-gray-700'
              : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'
          )}
        >
          {totalSemReferencia} sem referência VRPO
        </button>
        {situacaoFilter !== 'todos' && (
          <button
            onClick={() => setSituacaoFilter('todos')}
            className="rounded-full border border-muted px-4 py-1.5 text-sm text-muted-foreground hover:bg-muted/50"
          >
            Ver todos
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <label htmlFor="filter-situacao" className="text-sm font-medium">
            Situação:
          </label>
          <select
            id="filter-situacao"
            value={situacaoFilter}
            onChange={(e) => setSituacaoFilter(e.target.value as SituacaoFilter)}
            className="rounded-md border border-input bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="todos">Todos</option>
            <option value="abaixo">Abaixo da VRPO</option>
            <option value="acima">Acima da VRPO</option>
            <option value="sem_referencia">Sem referência</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="filter-especialidade" className="text-sm font-medium">
            Especialidade:
          </label>
          <select
            id="filter-especialidade"
            value={especialidadeFilter}
            onChange={(e) => setEspecialidadeFilter(e.target.value)}
            className="rounded-md border border-input bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="todas">Todas</option>
            {especialidades.map((e) => (
              <option key={e.id} value={e.codigo}>
                {e.nome}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50 text-left text-xs font-medium text-muted-foreground">
                <th className="px-4 py-3">Código</th>
                <th className="px-4 py-3">Procedimento</th>
                <th className="px-4 py-3">Especialidade</th>
                <th className="px-4 py-3 text-right">Meu Preço</th>
                <th className="px-4 py-3 text-right">
                  <span className="inline-flex items-center gap-1">
                    VRPO Ref.
                    <VRPOPopover />
                  </span>
                </th>
                <th className="px-4 py-3 text-right">Diferença R$</th>
                <th className="px-4 py-3 text-right">Diferença %</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                    Nenhum procedimento encontrado com os filtros selecionados.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => {
                  const rowClass =
                    item.situacao === 'abaixo'
                      ? 'bg-red-50/60 hover:bg-red-50'
                      : item.situacao === 'acima'
                        ? 'bg-green-50/60 hover:bg-green-50'
                        : 'hover:bg-muted/30'

                  return (
                    <tr key={item.id} className={cn('border-b last:border-0', rowClass)}>
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                        {item.codigo}
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/procedimentos/${item.especialidadeSlug}/${item.id}`}
                          className="font-medium hover:underline"
                        >
                          {item.nome}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {item.especialidadeNome}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">
                        {formatBRL(item.meuPreco)}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">
                        {item.vrpoReferencia !== null ? formatBRL(item.vrpoReferencia) : '—'}
                      </td>
                      <td
                        className={cn(
                          'px-4 py-3 text-right tabular-nums',
                          item.diferencaReais === null
                            ? 'text-muted-foreground'
                            : item.diferencaReais >= 0
                              ? 'text-green-700'
                              : 'text-red-700'
                        )}
                      >
                        {item.diferencaReais !== null ? formatBRL(item.diferencaReais) : '—'}
                      </td>
                      <td
                        className={cn(
                          'px-4 py-3 text-right tabular-nums font-medium',
                          item.diferencaPerc === null
                            ? 'text-muted-foreground'
                            : item.diferencaPerc >= 0
                              ? 'text-green-700'
                              : 'text-red-700'
                        )}
                      >
                        {item.diferencaPerc !== null ? formatPerc(item.diferencaPerc) : '—'}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Row count */}
      {filtered.length > 0 && (
        <p className="text-xs text-muted-foreground">
          Exibindo {filtered.length} de {items.length} procedimentos
        </p>
      )}
    </div>
  )
}

// ─── VRPOPopover ──────────────────────────────────────────────────────────────

function VRPOPopover() {
  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button
          type="button"
          className="inline-flex items-center text-muted-foreground hover:text-foreground focus:outline-none"
          aria-label="O que é VRPO?"
        >
          <HelpCircle className="h-3.5 w-3.5" />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          side="top"
          align="center"
          sideOffset={6}
          className="z-50 w-72 rounded-md border bg-popover p-4 text-sm text-popover-foreground shadow-md"
        >
          <div className="flex items-start justify-between gap-2">
            <p className="font-semibold">O que é VRPO?</p>
            <Popover.Close className="text-muted-foreground hover:text-foreground">
              <X className="h-3.5 w-3.5" />
            </Popover.Close>
          </div>
          <p className="mt-2 leading-relaxed text-muted-foreground">
            VRPO (Valores Referenciais para Procedimentos Odontológicos) é a tabela de referência
            publicada pelo CFO que orienta a precificação mínima dos procedimentos odontológicos.
            Cobrar abaixo desta referência pode indicar que seus custos estão sendo subvalorizados.
          </p>
          <Popover.Arrow className="fill-border" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}
