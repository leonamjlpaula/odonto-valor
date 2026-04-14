'use client';

import { useState, useMemo } from 'react';
import { RotateCcw, TrendingDown, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/presentation/components/ui/button';
import { Input } from '@/presentation/components/ui/input';
import { Label } from '@/presentation/components/ui/label';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/presentation/components/ui/card';
import { Badge } from '@/presentation/components/ui/badge';
import type {
  SimuladorConfig,
  SimuladorProcedimento,
} from '@/application/usecases/simuladorActions';

// ─── Formatters ───────────────────────────────────────────────────────────────

function formatBRL(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

function formatPerc(value: number) {
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
}

// ─── Client-side formula (mirrors CustoFixoPorMinuto.ts — CNCC, 11 meses/ano) ─

/**
 * Calculates cost per minute using the CNCC formula.
 * Mirrors the authoritative formula in CustoFixoPorMinuto.ts.
 * Uses totalItens as a scalar (sum of all fixed cost items).
 */
function calcMinuto(
  config: SimuladorConfig,
  totalItens: number,
  numeroCadeiras: number,
  percOciosidade: number
): number {
  const minutosUteis = config.diasUteis * config.horasTrabalho * 60 * (1 - percOciosidade / 100);
  if (minutosUteis <= 0) return 0;
  const cadeiras = Math.max(1, numeroCadeiras);
  const minutosAnuais = minutosUteis * 11;

  const custoFixoBase = totalItens / (minutosUteis * cadeiras);
  const depreciacao = config.investimentoEquipamentos / (config.anosDepreciacao * minutosAnuais);
  const proLaboreMensal =
    config.salarioBase *
    (1 +
      config.percFundoReserva / 100 +
      config.percInsalubridade / 100 +
      config.percImprevistos / 100 +
      4 / 36 +
      1 / 12);
  const remuneracao = proLaboreMensal / minutosUteis;
  const taxaRetorno = config.investimentoEquipamentos / (config.anosRetorno * minutosAnuais);

  return custoFixoBase + depreciacao + remuneracao + taxaRetorno;
}

function calcMargem(
  precoVenda: number,
  custoBreakEven: number,
  percImpostos: number,
  percTaxaCartao: number
): number {
  const percTotal = percImpostos + percTaxaCartao;
  return (precoVenda - custoBreakEven - (precoVenda * percTotal) / 100) / precoVenda;
}

function margemLabel(margem: number): string {
  const pct = margem * 100;
  if (pct >= 30) return 'verde';
  if (pct >= 10) return 'amarelo';
  return 'vermelho';
}

// ─── Types ────────────────────────────────────────────────────────────────────

type Params = {
  totalItens: number;
  numeroCadeiras: number;
  percOciosidade: number;
  percImpostos: number;
  percTaxaCartao: number;
};

type ProcResultado = {
  id: string;
  codigo: string;
  nome: string;
  especialidadeNome: string;
  tempoMinutos: number;
  precoVenda: number | null;
  custoVariavel: number;
  // baseline (salvo)
  breakEvenSalvo: number;
  margemSalva: number | null;
  // simulado
  breakEvenSim: number;
  margemSim: number | null;
  deltaBreakEven: number;
  deltaMargem: number | null;
};

// ─── Component ────────────────────────────────────────────────────────────────

type Props = {
  config: SimuladorConfig;
  totalItens: number;
  custoFixoPorMinutoAtual: number;
  procedimentos: SimuladorProcedimento[];
};

export function SimuladorPage({
  config,
  totalItens,
  custoFixoPorMinutoAtual,
  procedimentos,
}: Props) {
  const [params, setParams] = useState<Params>({
    totalItens,
    numeroCadeiras: config.numeroCadeiras,
    percOciosidade: config.percOciosidade,
    percImpostos: config.percImpostos,
    percTaxaCartao: config.percTaxaCartao,
  });

  // Track input strings separately to allow free-form editing
  const [inputValues, setInputValues] = useState({
    totalItens: totalItens.toFixed(2).replace('.', ','),
    numeroCadeiras: String(config.numeroCadeiras),
    percOciosidade: String(config.percOciosidade),
    percImpostos: String(config.percImpostos),
    percTaxaCartao: String(config.percTaxaCartao),
  });

  const isDirty =
    params.totalItens !== totalItens ||
    params.numeroCadeiras !== config.numeroCadeiras ||
    params.percOciosidade !== config.percOciosidade ||
    params.percImpostos !== config.percImpostos ||
    params.percTaxaCartao !== config.percTaxaCartao;

  function restore() {
    setParams({
      totalItens,
      numeroCadeiras: config.numeroCadeiras,
      percOciosidade: config.percOciosidade,
      percImpostos: config.percImpostos,
      percTaxaCartao: config.percTaxaCartao,
    });
    setInputValues({
      totalItens: totalItens.toFixed(2).replace('.', ','),
      numeroCadeiras: String(config.numeroCadeiras),
      percOciosidade: String(config.percOciosidade),
      percImpostos: String(config.percImpostos),
      percTaxaCartao: String(config.percTaxaCartao),
    });
  }

  function handleNumericInput(
    field: keyof Params,
    inputField: keyof typeof inputValues,
    raw: string
  ) {
    setInputValues((prev) => ({ ...prev, [inputField]: raw }));
    const parsed = parseFloat(raw.replace(',', '.'));
    if (!isNaN(parsed) && parsed >= 0) {
      setParams((prev) => ({ ...prev, [field]: parsed }));
    }
  }

  // ── Calculations ──────────────────────────────────────────────────────────

  const custoMinSim = useMemo(
    () => calcMinuto(config, params.totalItens, params.numeroCadeiras, params.percOciosidade),
    [config, params.totalItens, params.numeroCadeiras, params.percOciosidade]
  );

  const resultados: ProcResultado[] = useMemo(() => {
    return procedimentos.map((p) => {
      const breakEvenSalvo = p.tempoMinutos * custoFixoPorMinutoAtual + p.custoVariavel;
      const breakEvenSim = p.tempoMinutos * custoMinSim + p.custoVariavel;

      const margemSalva =
        p.precoVenda !== null
          ? calcMargem(p.precoVenda, breakEvenSalvo, config.percImpostos, config.percTaxaCartao)
          : null;

      const margemSim =
        p.precoVenda !== null
          ? calcMargem(p.precoVenda, breakEvenSim, params.percImpostos, params.percTaxaCartao)
          : null;

      return {
        ...p,
        breakEvenSalvo,
        margemSalva,
        breakEvenSim,
        margemSim,
        deltaBreakEven: breakEvenSim - breakEvenSalvo,
        deltaMargem: margemSim !== null && margemSalva !== null ? margemSim - margemSalva : null,
      };
    });
  }, [
    procedimentos,
    custoMinSim,
    custoFixoPorMinutoAtual,
    config.percImpostos,
    config.percTaxaCartao,
    params.percImpostos,
    params.percTaxaCartao,
  ]);

  const comPreco = resultados.filter((p) => p.precoVenda !== null);
  const noVermelhoSalvo = comPreco.filter(
    (p) => p.margemSalva !== null && p.margemSalva * 100 < 10
  ).length;
  const noVermelhoSim = comPreco.filter(
    (p) => p.margemSim !== null && p.margemSim * 100 < 10
  ).length;
  const deltaVermelho = noVermelhoSim - noVermelhoSalvo;
  const deltaCustoMin = custoMinSim - custoFixoPorMinutoAtual;

  // Show procedures sorted by worst margin impact (biggest drops first)
  const sorted = [...resultados]
    .filter((p) => p.precoVenda !== null)
    .sort((a, b) => (a.deltaMargem ?? 0) - (b.deltaMargem ?? 0));

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Simulador de Cenários</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Ajuste os parâmetros e veja o impacto em tempo real. Nenhum valor é salvo aqui.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* ── Painel de controles ───────────────────────────────────────── */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Parâmetros do Cenário</CardTitle>
              <CardDescription className="text-xs">
                Valores atuais salvos como referência
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="sim-totalItens" className="text-sm">
                  Custo fixo mensal (R$)
                </Label>
                <p className="text-xs text-muted-foreground">Salvo: {formatBRL(totalItens)}</p>
                <Input
                  id="sim-totalItens"
                  value={inputValues.totalItens}
                  onChange={(e) => handleNumericInput('totalItens', 'totalItens', e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="sim-cadeiras" className="text-sm">
                  Número de cadeiras
                </Label>
                <p className="text-xs text-muted-foreground">Salvo: {config.numeroCadeiras}</p>
                <Input
                  id="sim-cadeiras"
                  type="number"
                  min={1}
                  step={1}
                  value={inputValues.numeroCadeiras}
                  onChange={(e) =>
                    handleNumericInput('numeroCadeiras', 'numeroCadeiras', e.target.value)
                  }
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="sim-ociosidade" className="text-sm">
                  Taxa de ociosidade (%)
                </Label>
                <p className="text-xs text-muted-foreground">
                  Salvo: {config.percOciosidade}% — típico: 20%
                </p>
                <div className="flex gap-2 items-center">
                  <input
                    id="sim-ociosidade"
                    type="range"
                    min={0}
                    max={50}
                    step={1}
                    value={params.percOciosidade}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      setParams((prev) => ({ ...prev, percOciosidade: v }));
                      setInputValues((prev) => ({ ...prev, percOciosidade: String(v) }));
                    }}
                    className="flex-1 accent-primary"
                  />
                  <Input
                    className="w-16 text-center"
                    value={inputValues.percOciosidade}
                    onChange={(e) =>
                      handleNumericInput('percOciosidade', 'percOciosidade', e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="sim-impostos" className="text-sm">
                  % Impostos (ISS / Simples)
                </Label>
                <p className="text-xs text-muted-foreground">Salvo: {config.percImpostos}%</p>
                <Input
                  id="sim-impostos"
                  type="number"
                  min={0}
                  max={30}
                  step={0.1}
                  value={inputValues.percImpostos}
                  onChange={(e) =>
                    handleNumericInput('percImpostos', 'percImpostos', e.target.value)
                  }
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="sim-cartao" className="text-sm">
                  % Taxa de cartão
                </Label>
                <p className="text-xs text-muted-foreground">Salvo: {config.percTaxaCartao}%</p>
                <Input
                  id="sim-cartao"
                  type="number"
                  min={0}
                  max={10}
                  step={0.1}
                  value={inputValues.percTaxaCartao}
                  onChange={(e) =>
                    handleNumericInput('percTaxaCartao', 'percTaxaCartao', e.target.value)
                  }
                />
              </div>

              <Button
                variant="outline"
                size="sm"
                className="w-full gap-2"
                disabled={!isDirty}
                onClick={restore}
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Restaurar valores salvos
              </Button>
            </CardContent>
          </Card>

          {isDirty && (
            <p className="text-xs text-amber-600 dark:text-amber-400 text-center">
              Cenário simulado — nenhum valor está sendo alterado no sistema
            </p>
          )}
        </div>

        {/* ── Área principal ────────────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-4">
          {/* Summary cards */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="pt-4 pb-4">
                <p className="text-xs text-muted-foreground mb-1">Custo por minuto</p>
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="text-xl font-bold">
                    {formatBRL(custoMinSim)}
                    <span className="text-sm font-normal">/min</span>
                  </span>
                  <DeltaChip
                    value={deltaCustoMin}
                    label={`${deltaCustoMin > 0 ? '+' : ''}${formatBRL(Math.abs(deltaCustoMin))}/min`}
                    higherIsBetter={false}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Salvo: {formatBRL(custoFixoPorMinutoAtual)}/min
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4 pb-4">
                <p className="text-xs text-muted-foreground mb-1">Procedimentos no vermelho</p>
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="text-xl font-bold">{noVermelhoSim}</span>
                  {deltaVermelho !== 0 && (
                    <DeltaChip
                      value={deltaVermelho}
                      label={`${deltaVermelho > 0 ? '+' : ''}${deltaVermelho}`}
                      higherIsBetter={false}
                    />
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Salvo: {noVermelhoSalvo} · Com preço: {comPreco.length}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Procedure table */}
          {sorted.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground text-sm">
                Nenhum procedimento com preço de venda configurado. Configure o preço de venda nos
                procedimentos para ver o impacto na margem.
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Margem por procedimento — impacto do cenário
                </CardTitle>
                <CardDescription className="text-xs">
                  Ordenado pelos maiores impactos negativos na margem
                </CardDescription>
              </CardHeader>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-xs text-muted-foreground">
                      <th className="text-left px-4 py-2 font-medium">Procedimento</th>
                      <th className="text-right px-4 py-2 font-medium">Margem</th>
                      <th className="text-right px-4 py-2 font-medium">Δ Margem</th>
                      <th className="text-right px-4 py-2 font-medium hidden sm:table-cell">
                        Break-even
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sorted.map((p) => (
                      <tr key={p.id} className="border-b last:border-0 hover:bg-muted/30">
                        <td className="px-4 py-2">
                          <div className="font-medium leading-tight">{p.nome}</div>
                          <div className="text-xs text-muted-foreground">
                            {p.codigo} · {p.especialidadeNome}
                          </div>
                        </td>
                        <td className="px-4 py-2 text-right">
                          {p.margemSim !== null && <MargemBadge margem={p.margemSim} />}
                        </td>
                        <td className="px-4 py-2 text-right">
                          {p.deltaMargem !== null && (
                            <DeltaChip
                              value={p.deltaMargem * 100}
                              label={formatPerc(p.deltaMargem * 100)}
                              higherIsBetter={true}
                            />
                          )}
                        </td>
                        <td className="px-4 py-2 text-right hidden sm:table-cell text-muted-foreground text-xs">
                          {formatBRL(p.breakEvenSim)}
                          {p.deltaBreakEven !== 0 && (
                            <span
                              className={cn(
                                'ml-1',
                                p.deltaBreakEven > 0 ? 'text-red-500' : 'text-green-600'
                              )}
                            >
                              ({p.deltaBreakEven > 0 ? '+' : ''}
                              {formatBRL(p.deltaBreakEven)})
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function MargemBadge({ margem }: { margem: number }) {
  const pct = margem * 100;
  const label = margemLabel(margem);
  return (
    <Badge
      className={cn(
        'text-white text-xs',
        label === 'verde' && 'bg-green-600',
        label === 'amarelo' && 'bg-yellow-500',
        label === 'vermelho' && 'bg-red-600'
      )}
    >
      {pct.toFixed(1)}%
    </Badge>
  );
}

type DeltaChipProps = {
  value: number;
  label: string;
  higherIsBetter: boolean;
};

function DeltaChip({ value, label, higherIsBetter }: DeltaChipProps) {
  if (value === 0) return null;

  const positive = value > 0;
  const isGood = higherIsBetter ? positive : !positive;
  const Icon = positive ? TrendingUp : TrendingDown;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-0.5 text-xs font-medium',
        isGood ? 'text-green-600' : 'text-red-500'
      )}
    >
      <Icon className="h-3 w-3" />
      {label}
    </span>
  );
}
