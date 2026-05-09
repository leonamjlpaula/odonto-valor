'use client';

import { useState, useTransition } from 'react';
import { MaterialCombobox } from '@/presentation/components/ui/material-combobox';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Edit2, Trash2, Plus, Check, X, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { Material } from '@prisma/client';
import type { ProcedimentoComPreco } from '@/application/usecases/procedimentoActions';
import {
  updateProcedimentoTempo,
  updatePrecoVenda,
  updateCustoLaboratorio,
  addMaterialToProcedimento,
  removeMaterialFromProcedimento,
  updateProcedimentoMaterial,
  deleteProcedimento,
} from '@/application/usecases/procedimentoActions';
import { margemColor } from '@/application/usecases/calcularPrecoProcedimento';
import { parseBR } from '@/lib/utils';
import { useToast } from '@/presentation/hooks/use-toast';
import { Button } from '@/presentation/components/ui/button';
import { Input } from '@/presentation/components/ui/input';
import { CurrencyInput } from '@/presentation/components/ui/CurrencyInput';
import { Label } from '@/presentation/components/ui/label';
import { Badge } from '@/presentation/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/presentation/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/presentation/components/ui/dialog';
import { cn } from '@/lib/utils';

function formatBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

function formatPerc(value: number): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
}

interface Props {
  userId: string;
  especialidadeSlug: string;
  detail: ProcedimentoComPreco;
  materiais: Material[];
}

function calcPreviewMargem(
  precoVendaStr: string,
  custoBreakEven: number,
  percTotal: number
): number | null {
  if (!precoVendaStr.trim()) return null;
  const pv = parseBR(precoVendaStr);
  if (isNaN(pv) || pv <= 0) return null;
  return (pv - custoBreakEven - (pv * percTotal) / 100) / pv;
}

export function ProcedimentoDetailPage({ userId, especialidadeSlug, detail, materiais }: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const { procedimento, precoCalculado, vrpoReferencia, percTotal } = detail;
  const diferencaPerc =
    vrpoReferencia !== null
      ? ((precoCalculado.precoFinal - vrpoReferencia) / vrpoReferencia) * 100
      : null;

  // ─── precoVenda editing ───────────────────────────────────────────────────
  const [editingPreco, setEditingPreco] = useState(false);
  const [precoValue, setPrecoValue] = useState(
    procedimento.precoVenda != null ? String(procedimento.precoVenda).replace('.', ',') : ''
  );
  const previewMargem = editingPreco
    ? calcPreviewMargem(precoValue, precoCalculado.precoFinal, percTotal)
    : null;
  const previewColor = margemColor(previewMargem);

  function handleSavePreco() {
    const valor = precoValue.trim() === '' ? null : parseBR(precoValue);
    if (valor !== null && (isNaN(valor) || valor < 0)) {
      toast({
        title: 'Preço inválido',
        description: 'Informe um valor positivo.',
        variant: 'destructive',
      });
      return;
    }
    startTransition(async () => {
      const result = await updatePrecoVenda(procedimento.id, userId, valor);
      if (result.success) {
        setEditingPreco(false);
        toast({ title: 'Preço de venda atualizado!' });
        router.refresh();
      } else {
        toast({ title: 'Erro', description: result.error, variant: 'destructive' });
      }
    });
  }

  // ─── custoLaboratorio editing ─────────────────────────────────────────────
  const [editingLab, setEditingLab] = useState(false);
  const [labValue, setLabValue] = useState(
    procedimento.custoLaboratorio != null && procedimento.custoLaboratorio > 0
      ? String(procedimento.custoLaboratorio).replace('.', ',')
      : ''
  );

  function handleSaveLab() {
    const valor = labValue.trim() === '' ? null : parseBR(labValue);
    if (valor !== null && (isNaN(valor) || valor < 0)) {
      toast({
        title: 'Valor inválido',
        description: 'Informe um valor positivo.',
        variant: 'destructive',
      });
      return;
    }
    startTransition(async () => {
      const result = await updateCustoLaboratorio(procedimento.id, userId, valor);
      if (result.success) {
        setEditingLab(false);
        toast({ title: 'Custo de laboratório atualizado!' });
        router.refresh();
      } else {
        toast({ title: 'Erro', description: result.error, variant: 'destructive' });
      }
    });
  }

  // ─── Tempo editing ────────────────────────────────────────────────────────
  const [editingTempo, setEditingTempo] = useState(false);
  const [tempoValue, setTempoValue] = useState(String(procedimento.tempoMinutos));

  function handleSaveTempo() {
    const tempo = parseBR(tempoValue);
    if (isNaN(tempo) || tempo <= 0) {
      toast({
        title: 'Tempo inválido',
        description: 'Informe um valor maior que zero.',
        variant: 'destructive',
      });
      return;
    }
    startTransition(async () => {
      const result = await updateProcedimentoTempo(procedimento.id, userId, tempo);
      if (result.success) {
        setEditingTempo(false);
        toast({ title: 'Tempo atualizado com sucesso!' });
        router.refresh();
      } else {
        toast({ title: 'Erro', description: result.error, variant: 'destructive' });
      }
    });
  }

  // ─── Material row editing ─────────────────────────────────────────────────
  const [editingPmaId, setEditingPmaId] = useState<string | null>(null);
  const [editConsumo, setEditConsumo] = useState('');
  const [editDivisor, setEditDivisor] = useState('');

  function startEditMaterial(pmaId: string, consumo: number, divisor: number) {
    setEditingPmaId(pmaId);
    setEditConsumo(String(consumo));
    setEditDivisor(String(divisor));
  }

  function cancelEditMaterial() {
    setEditingPmaId(null);
    setEditConsumo('');
    setEditDivisor('');
  }

  function handleSaveMaterial(pmaId: string) {
    const consumo = parseBR(editConsumo);
    if (isNaN(consumo) || consumo <= 0) {
      toast({
        title: 'Consumo inválido',
        description: 'Informe um valor maior que zero.',
        variant: 'destructive',
      });
      return;
    }
    const divisor = parseBR(editDivisor);
    if (isNaN(divisor) || divisor <= 0) {
      toast({
        title: 'Usos/embalagem inválido',
        description: 'Informe um valor maior que zero.',
        variant: 'destructive',
      });
      return;
    }
    startTransition(async () => {
      const result = await updateProcedimentoMaterial(pmaId, userId, consumo, divisor);
      if (result.success) {
        cancelEditMaterial();
        toast({ title: 'Material atualizado!' });
        router.refresh();
      } else {
        toast({ title: 'Erro', description: result.error, variant: 'destructive' });
      }
    });
  }

  function handleRemoveMaterial(pmaId: string, materialNome: string) {
    startTransition(async () => {
      const result = await removeMaterialFromProcedimento(pmaId, userId);
      if (result.success) {
        toast({ title: `${materialNome} removido!` });
        router.refresh();
      } else {
        toast({ title: 'Erro', description: result.error, variant: 'destructive' });
      }
    });
  }

  // ─── Add material form ────────────────────────────────────────────────────
  const [showAddMaterial, setShowAddMaterial] = useState(false);
  const [selectedMatId, setSelectedMatId] = useState('');
  const [addConsumo, setAddConsumo] = useState('1');
  const [addMatInfo, setAddMatInfo] = useState<{ unidade: string; divisorPadrao: number } | null>(
    null
  );
  const [comboboxKey, setComboboxKey] = useState(0);

  function resetAddForm() {
    setSelectedMatId('');
    setAddConsumo('1');
    setAddMatInfo(null);
    setComboboxKey((k) => k + 1);
  }

  function handleAddMaterial() {
    if (!selectedMatId) {
      toast({ title: 'Selecione um material', variant: 'destructive' });
      return;
    }
    const consumo = parseBR(addConsumo);
    const divisor = addMatInfo?.divisorPadrao ?? 1;
    if (isNaN(consumo) || consumo <= 0) {
      toast({
        title: 'Consumo inválido',
        description: 'Informe um valor maior que zero.',
        variant: 'destructive',
      });
      return;
    }
    startTransition(async () => {
      const result = await addMaterialToProcedimento(
        procedimento.id,
        userId,
        selectedMatId,
        consumo,
        divisor
      );
      if (result.success) {
        setShowAddMaterial(false);
        resetAddForm();
        toast({ title: 'Material adicionado!' });
        router.refresh();
      } else {
        toast({ title: 'Erro', description: result.error, variant: 'destructive' });
      }
    });
  }

  // ─── Delete procedure ─────────────────────────────────────────────────────
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  function handleDeleteProcedimento() {
    startTransition(async () => {
      const result = await deleteProcedimento(procedimento.id, userId);
      if (result.success) {
        toast({ title: 'Procedimento excluído!' });
        router.push(`/procedimentos/${especialidadeSlug}`);
      } else {
        toast({ title: 'Erro', description: result.error, variant: 'destructive' });
        setShowDeleteDialog(false);
      }
    });
  }

  // ─── Derived display values ───────────────────────────────────────────────
  const color = margemColor(precoCalculado.margemLucro);
  const especialidadeNome = procedimento.especialidade.nome;

  const margemBgClass =
    color === 'green'
      ? 'border-green-200 bg-green-50'
      : color === 'yellow'
        ? 'border-yellow-200 bg-yellow-50'
        : color === 'red'
          ? 'border-red-200 bg-red-50'
          : '';
  const margemTextClass =
    color === 'green'
      ? 'text-green-800'
      : color === 'yellow'
        ? 'text-yellow-800'
        : color === 'red'
          ? 'text-red-800'
          : 'text-muted-foreground';
  const MargemIcon = color === 'green' ? TrendingUp : color === 'red' ? TrendingDown : Minus;

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav
        className="flex items-center gap-1.5 text-sm text-muted-foreground"
        aria-label="Navegação"
      >
        <Link href="/procedimentos" className="hover:text-foreground transition-colors">
          Procedimentos
        </Link>
        <span>/</span>
        <Link
          href={`/procedimentos/${especialidadeSlug}`}
          className="hover:text-foreground transition-colors"
        >
          {especialidadeNome}
        </Link>
        <span>/</span>
        <span className="text-foreground font-medium truncate max-w-[200px]">
          {procedimento.nome}
        </span>
      </nav>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="space-y-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold">{procedimento.nome}</h1>
            <Badge variant="secondary">{procedimento.especialidade.nome}</Badge>
            {procedimento.isCustom && <Badge variant="outline">Customizado</Badge>}
          </div>
          <p className="text-sm font-mono text-muted-foreground">Código: {procedimento.codigo}</p>
        </div>
        {procedimento.isCustom && (
          <Button variant="destructive" size="sm" onClick={() => setShowDeleteDialog(true)}>
            <Trash2 className="h-4 w-4 mr-2" />
            Excluir Procedimento
          </Button>
        )}
      </div>

      {/* ── Financial metrics — visual hierarchy ─────────────────────────── */}

      {/* PRIMARY — Custo de produção (break-even) */}
      <Card className="border-primary/30 bg-primary/5">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Seu custo de produção
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          <p className="text-3xl font-bold tabular-nums text-primary">
            {formatBRL(precoCalculado.precoFinal)}
          </p>
          <p className="text-xs text-muted-foreground">
            materiais{' '}
            <span className="font-medium text-foreground tabular-nums">
              {formatBRL(precoCalculado.custoVariavel)}
            </span>{' '}
            + operacional{' '}
            <span className="font-medium text-foreground tabular-nums">
              {formatBRL(precoCalculado.custoFixoTotal)}
            </span>
          </p>
        </CardContent>
      </Card>

      {/* SECONDARY — Preço mínimo para 30% de lucro */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Preço mínimo para 30% de lucro
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          <p className="text-2xl font-bold tabular-nums">
            {formatBRL(precoCalculado.precoMinimoParaMargem30)}
          </p>
          <p className="text-xs text-muted-foreground">após impostos e taxa de cartão</p>
        </CardContent>
      </Card>

      {/* TERTIARY — breakdown + conditional margin card */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {/* Materiais */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Materiais</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold tabular-nums">
              {formatBRL(precoCalculado.custoVariavel)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {procedimento.custoLaboratorio != null && procedimento.custoLaboratorio > 0
                ? 'materiais + laboratório'
                : 'materiais utilizados'}
            </p>
          </CardContent>
        </Card>

        {/* Operacional */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Operacional</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold tabular-nums">
              {formatBRL(precoCalculado.custoFixoTotal)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {procedimento.tempoMinutos} min × custo/min
            </p>
          </CardContent>
        </Card>

        {/* Margem atual — only when precoVenda is set */}
        {precoCalculado.margemLucro !== null ? (
          <Card className={cn(margemBgClass)}>
            <CardHeader className="pb-2">
              <CardTitle
                className={cn('text-sm font-medium flex items-center gap-1.5', margemTextClass)}
              >
                <MargemIcon className="h-3.5 w-3.5" />
                Sua margem atual
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className={cn('text-xl font-bold tabular-nums', margemTextClass)}>
                {(precoCalculado.margemLucro * 100).toFixed(1)}%
              </p>
              <p className={cn('text-xs mt-1', margemTextClass)}>
                {color === 'green'
                  ? 'Acima de 30% — ótimo!'
                  : color === 'yellow'
                    ? 'Entre 10% e 30%'
                    : 'Abaixo de 10% — atenção'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-dashed">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Margem atual
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg text-muted-foreground">—</p>
              <p className="text-xs text-muted-foreground mt-1">Defina o preço de venda</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* VRPO — referência de convênio */}
      {vrpoReferencia !== null && (
        <div className="rounded-lg border px-4 py-3 flex items-center justify-between gap-4 flex-wrap text-sm">
          <div>
            <span className="text-muted-foreground">Referência de convênio (VRPO): </span>
            <span className="font-semibold tabular-nums">{formatBRL(vrpoReferencia)}</span>
          </div>
          {diferencaPerc !== null && (
            <span
              className={cn(
                'font-medium tabular-nums',
                diferencaPerc >= 0 ? 'text-green-600' : 'text-red-600'
              )}
            >
              Seu custo está {formatPerc(diferencaPerc)} em relação à tabela
            </span>
          )}
        </div>
      )}

      {/* Preço de venda */}
      <div className="border rounded-lg p-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="font-semibold">Preço de Venda</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              {editingPreco ? (
                'Quanto você cobra por este procedimento'
              ) : procedimento.precoVenda != null ? (
                <span className="text-foreground font-medium">
                  {formatBRL(procedimento.precoVenda)}
                </span>
              ) : (
                'Não configurado — defina para ver sua margem real'
              )}
            </p>
          </div>
          {editingPreco ? (
            <div className="flex flex-col items-end gap-1.5">
              <div className="flex items-center gap-2">
                <CurrencyInput
                  value={precoValue}
                  onChange={(v) => setPrecoValue(v)}
                  className="w-28"
                  placeholder="ex: 280,00"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSavePreco();
                    if (e.key === 'Escape') {
                      setEditingPreco(false);
                      setPrecoValue(
                        procedimento.precoVenda != null
                          ? String(procedimento.precoVenda).replace('.', ',')
                          : ''
                      );
                    }
                  }}
                  autoFocus
                />
                <Button size="icon" variant="ghost" onClick={handleSavePreco} disabled={isPending}>
                  <Check className="h-4 w-4 text-green-600" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => {
                    setEditingPreco(false);
                    setPrecoValue(
                      procedimento.precoVenda != null
                        ? String(procedimento.precoVenda).replace('.', ',')
                        : ''
                    );
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              {previewMargem !== null && (
                <span
                  className={cn(
                    'text-xs font-medium tabular-nums',
                    previewColor === 'green'
                      ? 'text-green-700'
                      : previewColor === 'yellow'
                        ? 'text-yellow-700'
                        : 'text-red-700'
                  )}
                >
                  Margem: {(previewMargem * 100).toFixed(1)}%
                  {previewColor === 'green'
                    ? ' ✓'
                    : previewColor === 'yellow'
                      ? ' — atenção'
                      : ' — abaixo do mínimo'}
                </span>
              )}
            </div>
          ) : (
            <Button variant="outline" size="sm" onClick={() => setEditingPreco(true)}>
              <Edit2 className="h-4 w-4 mr-2" />
              {procedimento.precoVenda != null ? 'Editar Preço' : 'Definir Preço'}
            </Button>
          )}
        </div>
      </div>

      {/* Tempo de execução */}
      <div className="border rounded-lg p-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="font-semibold">Tempo de Execução</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              {editingTempo ? (
                'Edite o tempo de execução em minutos'
              ) : (
                <span className="text-foreground font-medium">
                  {procedimento.tempoMinutos} minutos
                </span>
              )}
            </p>
          </div>
          {editingTempo ? (
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={tempoValue}
                onChange={(e) => setTempoValue(e.target.value)}
                className="w-24"
                min={1}
                step={1}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveTempo();
                  if (e.key === 'Escape') {
                    setEditingTempo(false);
                    setTempoValue(String(procedimento.tempoMinutos));
                  }
                }}
                autoFocus
              />
              <span className="text-sm text-muted-foreground">min</span>
              <Button size="icon" variant="ghost" onClick={handleSaveTempo} disabled={isPending}>
                <Check className="h-4 w-4 text-green-600" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => {
                  setEditingTempo(false);
                  setTempoValue(String(procedimento.tempoMinutos));
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button variant="outline" size="sm" onClick={() => setEditingTempo(true)}>
              <Edit2 className="h-4 w-4 mr-2" />
              Editar Tempo
            </Button>
          )}
        </div>
      </div>

      {/* Custo de laboratório */}
      <div className="border rounded-lg p-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="font-semibold">Custo de Laboratório</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              {editingLab ? (
                'Valor cobrado pelo laboratório (próteses, facetas, ortodontia)'
              ) : procedimento.custoLaboratorio != null && procedimento.custoLaboratorio > 0 ? (
                <span className="text-foreground font-medium">
                  {formatBRL(procedimento.custoLaboratorio)}
                </span>
              ) : (
                'Não configurado — deixe em branco se não aplicável'
              )}
            </p>
          </div>
          {editingLab ? (
            <div className="flex items-center gap-2">
              <CurrencyInput
                value={labValue}
                onChange={(v) => setLabValue(v)}
                className="w-28"
                placeholder="ex: 350,00"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveLab();
                  if (e.key === 'Escape') {
                    setEditingLab(false);
                    setLabValue(
                      procedimento.custoLaboratorio != null && procedimento.custoLaboratorio > 0
                        ? String(procedimento.custoLaboratorio).replace('.', ',')
                        : ''
                    );
                  }
                }}
                autoFocus
              />
              <Button size="icon" variant="ghost" onClick={handleSaveLab} disabled={isPending}>
                <Check className="h-4 w-4 text-green-600" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => {
                  setEditingLab(false);
                  setLabValue(
                    procedimento.custoLaboratorio != null && procedimento.custoLaboratorio > 0
                      ? String(procedimento.custoLaboratorio).replace('.', ',')
                      : ''
                  );
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button variant="outline" size="sm" onClick={() => setEditingLab(true)}>
              <Edit2 className="h-4 w-4 mr-2" />
              {procedimento.custoLaboratorio != null && procedimento.custoLaboratorio > 0
                ? 'Editar'
                : 'Definir'}
            </Button>
          )}
        </div>
      </div>

      {/* Materials table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Materiais Utilizados</h2>
          {!showAddMaterial && (
            <Button variant="outline" size="sm" onClick={() => setShowAddMaterial(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Material
            </Button>
          )}
        </div>

        <div className="border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground w-10">Nº</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                    Material
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                    Embalagem
                  </th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">
                    Consumo
                  </th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">
                    Divisor (usos/embalagem)
                  </th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">Preço</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">
                    Custo/Uso
                  </th>
                  <th className="px-4 py-3 w-24"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {procedimento.materiais.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-muted-foreground">
                      Nenhum material cadastrado para este procedimento.
                    </td>
                  </tr>
                ) : (
                  procedimento.materiais.map((pma, index) => {
                    const custoPorcao = (pma.material.preco / pma.divisor) * pma.consumo;
                    const isEditing = editingPmaId === pma.id;

                    return (
                      <tr key={pma.id} className="hover:bg-muted/20 transition-colors">
                        <td className="px-4 py-3 text-muted-foreground">{index + 1}</td>
                        <td className="px-4 py-3 font-medium">{pma.material.nome}</td>
                        <td className="px-4 py-3 text-muted-foreground text-xs">
                          {pma.material.unidade}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {isEditing ? (
                            <Input
                              type="number"
                              value={editConsumo}
                              onChange={(e) => setEditConsumo(e.target.value)}
                              className="w-20 ml-auto text-right"
                              min={0.01}
                              step={0.01}
                            />
                          ) : (
                            <span className="tabular-nums">{pma.consumo}</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {isEditing ? (
                            <Input
                              type="number"
                              value={editDivisor}
                              onChange={(e) => setEditDivisor(e.target.value)}
                              className="w-20 ml-auto text-right"
                              min={0.01}
                              step={1}
                            />
                          ) : (
                            <span className="tabular-nums text-muted-foreground">
                              {pma.divisor}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums">
                          {formatBRL(pma.material.preco)}
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums font-medium">
                          {formatBRL(custoPorcao)}
                        </td>
                        <td className="px-4 py-3">
                          {isEditing ? (
                            <div className="flex items-center gap-1 justify-end">
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7"
                                onClick={() => handleSaveMaterial(pma.id)}
                                disabled={isPending}
                              >
                                <Check className="h-3.5 w-3.5 text-green-600" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7"
                                onClick={cancelEditMaterial}
                              >
                                <X className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 justify-end">
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7"
                                onClick={() => startEditMaterial(pma.id, pma.consumo, pma.divisor)}
                              >
                                <Edit2 className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7 text-destructive hover:text-destructive"
                                onClick={() => handleRemoveMaterial(pma.id, pma.material.nome)}
                                disabled={isPending}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add material form */}
        {showAddMaterial && (
          <div className="border rounded-lg p-4 space-y-4 bg-muted/20">
            <h3 className="font-medium">Adicionar Material</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Material</Label>
                <MaterialCombobox
                  key={comboboxKey}
                  options={materiais}
                  onSelect={(id, divisorPadrao, unidade) => {
                    setSelectedMatId(id);
                    setAddMatInfo({ divisorPadrao, unidade });
                  }}
                  onClear={() => {
                    setSelectedMatId('');
                    setAddMatInfo(null);
                  }}
                  placeholder="Buscar material..."
                  disabled={isPending}
                />
              </div>
              {addMatInfo && (
                <div className="flex gap-4 text-sm text-muted-foreground">
                  <span>
                    Unidade: <strong className="text-foreground">{addMatInfo.unidade}</strong>
                  </span>
                  <span>
                    Usos/embalagem:{' '}
                    <strong className="text-foreground">{addMatInfo.divisorPadrao}</strong>
                  </span>
                </div>
              )}
              <div className="space-y-2">
                <Label>Quantidade utilizada por procedimento</Label>
                <Input
                  type="number"
                  placeholder="ex: 1"
                  value={addConsumo}
                  onChange={(e) => setAddConsumo(e.target.value)}
                  min={0.01}
                  step={0.01}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAddMaterial} disabled={isPending}>
                <Plus className="h-4 w-4 mr-2" />
                {isPending ? 'Adicionando...' : 'Adicionar'}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddMaterial(false);
                  resetAddForm();
                }}
              >
                Cancelar
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Delete procedure confirmation dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir Procedimento</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Tem certeza que deseja excluir o procedimento <strong>{procedimento.nome}</strong>? Esta
            ação não pode ser desfeita.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteProcedimento} disabled={isPending}>
              {isPending ? 'Excluindo...' : 'Excluir'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
