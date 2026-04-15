import React from 'react';
import { Document, Page, View, Text, StyleSheet, renderToBuffer } from '@react-pdf/renderer';

// ─── Types ────────────────────────────────────────────────────────────────────

export type CredenciamentoCustoBreakdown = {
  /** Sum of CustoFixoItem.valor (monthly) */
  totalItens: number;
  /** Depreciation per month */
  depreciacaoMensal: number;
  /** Professional remuneration per month (salary + charges) */
  remuneracaoMensal: number;
  /** Return on investment per month */
  taxaRetornoMensal: number;
  /** Total monthly break-even (sum of above + remuneracao) */
  totalMensal: number;
  /** Useful minutes per month */
  minutosUteis: number;
  /** Cost per minute */
  porMinuto: number;
};

export type CredenciamentoConfigInfo = {
  diasUteis: number;
  horasTrabalho: number;
  numeroCadeiras: number;
  percOciosidade: number;
  investimentoEquipamentos: number;
  anosDepreciacao: number;
  salarioBase: number;
  anosRetorno: number;
};

export type CredenciamentoCustoItem = {
  nome: string;
  valor: number;
};

export type CredenciamentoProcedimento = {
  codigo: string;
  nome: string;
  tempoMinutos: number;
  custoVariavel: number;
  precoFinal: number;
  vrpoReferencia: number | null;
};

export type CredenciamentoEspecialidade = {
  nome: string;
  procedimentos: CredenciamentoProcedimento[];
};

export type CredenciamentoDocumentData = {
  userName: string;
  generatedAt: string;
  configInfo: CredenciamentoConfigInfo;
  custoItems: CredenciamentoCustoItem[];
  breakdown: CredenciamentoCustoBreakdown;
  especialidades: CredenciamentoEspecialidade[];
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

const formatNum = (value: number, decimals = 0) => value.toFixed(decimals).replace('.', ',');

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  page: { padding: 36, fontSize: 8.5, fontFamily: 'Helvetica', color: '#1a1a1a' },

  // Header
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 18 },
  title: { fontSize: 14, fontFamily: 'Helvetica-Bold', marginBottom: 2 },
  subtitle: { fontSize: 9, color: '#555555' },
  headerRight: { alignItems: 'flex-end' },
  dateText: { fontSize: 8, color: '#777777' },

  // Section
  sectionHeader: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 9.5,
    marginTop: 12,
    marginBottom: 4,
    paddingBottom: 3,
    borderBottomWidth: 1,
    borderBottomColor: '#d1d5db',
    color: '#111827',
  },

  // Tables
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    paddingVertical: 3,
    paddingHorizontal: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: '#9ca3af',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 2.5,
    paddingHorizontal: 4,
    borderBottomWidth: 0.3,
    borderBottomColor: '#e5e7eb',
  },
  tableRowAlt: { backgroundColor: '#f9fafb' },
  headerCell: { fontFamily: 'Helvetica-Bold', fontSize: 7.5 },
  cell: { fontSize: 8 },

  // Config table columns
  colConfigLabel: { width: '40%' },
  colConfigValue: { width: '60%', color: '#374151' },

  // Custo items columns
  colItemNome: { width: '65%', paddingRight: 4 },
  colItemValor: { width: '35%', textAlign: 'right' },

  // Breakdown columns
  colBreakNome: { width: '55%', paddingRight: 4 },
  colBreakMensal: { width: '25%', textAlign: 'right' },
  colBreakMinuto: { width: '20%', textAlign: 'right' },

  // Procedures columns
  colCodigo: { width: '9%' },
  colNome: { width: '35%', paddingRight: 4 },
  colTempo: { width: '8%', textAlign: 'right' },
  colCustoVar: { width: '14%', textAlign: 'right' },
  colPreco: { width: '14%', textAlign: 'right' },
  colVrpo: { width: '14%', textAlign: 'right' },
  colDiff: { width: '6%', textAlign: 'right' },

  // Specialty header
  especialidadeHeader: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 8,
    backgroundColor: '#e5e7eb',
    paddingVertical: 3,
    paddingHorizontal: 4,
    marginTop: 2,
  },

  // Methodology box
  methodologyBox: {
    backgroundColor: '#f0f9ff',
    borderWidth: 0.5,
    borderColor: '#bae6fd',
    borderRadius: 3,
    padding: 8,
    marginTop: 8,
  },
  methodologyTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 8.5,
    marginBottom: 3,
    color: '#0369a1',
  },
  methodologyText: { fontSize: 7.5, color: '#374151', lineHeight: 1.5 },

  // Total row
  totalRow: {
    flexDirection: 'row',
    paddingVertical: 3,
    paddingHorizontal: 4,
    borderTopWidth: 1,
    borderTopColor: '#9ca3af',
    backgroundColor: '#f3f4f6',
  },
  totalText: { fontFamily: 'Helvetica-Bold', fontSize: 8.5 },

  // Highlight value
  highlight: { fontFamily: 'Helvetica-Bold', fontSize: 11, color: '#1d4ed8' },
});

// ─── Document Component ───────────────────────────────────────────────────────

type DocProps = CredenciamentoDocumentData;

function CredenciamentoDocument({
  userName,
  generatedAt,
  configInfo,
  custoItems,
  breakdown,
  especialidades,
}: DocProps) {
  const minutosUteis = breakdown.minutosUteis;

  return (
    <Document>
      {/* ── Página 1: Configuração + Memória de Cálculo ───────────────────── */}
      <Page size="A4" style={s.page}>
        {/* Header */}
        <View style={s.headerRow}>
          <View>
            <Text style={s.title}>Memória de Cálculo — Credenciamento</Text>
            <Text style={s.subtitle}>{userName}</Text>
          </View>
          <View style={s.headerRight}>
            <Text style={[s.subtitle, { fontFamily: 'Helvetica-Bold' }]}>OdontoValor</Text>
            <Text style={s.dateText}>Gerado em {generatedAt}</Text>
          </View>
        </View>

        {/* Configuração do Consultório */}
        <Text style={s.sectionHeader}>1. Configuração do Consultório</Text>
        <View>
          {[
            ['Dias úteis por mês', `${configInfo.diasUteis} dias`],
            ['Horas de trabalho por dia', `${configInfo.horasTrabalho}h`],
            ['Número de cadeiras ativas', String(configInfo.numeroCadeiras)],
            ['Taxa de ociosidade', `${formatNum(configInfo.percOciosidade)}%`],
            ['→ Minutos úteis por mês', `${formatNum(minutosUteis, 0)} min`],
            ['Investimento em equipamentos', formatCurrency(configInfo.investimentoEquipamentos)],
            ['Prazo de depreciação', `${configInfo.anosDepreciacao} anos`],
            ['Prazo de retorno', `${configInfo.anosRetorno} anos`],
          ].map(([label, value], i) => (
            <View key={label} style={[s.tableRow, i % 2 === 1 ? s.tableRowAlt : {}]}>
              <Text style={[s.cell, s.colConfigLabel]}>{label}</Text>
              <Text style={[s.cell, s.colConfigValue]}>{value}</Text>
            </View>
          ))}
        </View>

        {/* Itens de Custo Fixo Mensal */}
        <Text style={s.sectionHeader}>2. Itens de Custo Fixo Mensal</Text>
        <View style={s.tableHeaderRow}>
          <Text style={[s.headerCell, s.colItemNome]}>Item</Text>
          <Text style={[s.headerCell, s.colItemValor]}>Valor/mês</Text>
        </View>
        {custoItems.map((item, i) => (
          <View key={item.nome} style={[s.tableRow, i % 2 === 1 ? s.tableRowAlt : {}]}>
            <Text style={[s.cell, s.colItemNome]}>{item.nome}</Text>
            <Text style={[s.cell, s.colItemValor]}>{formatCurrency(item.valor)}</Text>
          </View>
        ))}
        <View style={s.totalRow}>
          <Text style={[s.totalText, s.colItemNome]}>Total itens de custo fixo</Text>
          <Text style={[s.totalText, s.colItemValor]}>{formatCurrency(breakdown.totalItens)}</Text>
        </View>

        {/* Composição do Custo por Minuto */}
        <Text style={s.sectionHeader}>3. Composição do Custo por Minuto</Text>
        <View style={s.tableHeaderRow}>
          <Text style={[s.headerCell, s.colBreakNome]}>Componente</Text>
          <Text style={[s.headerCell, s.colBreakMensal]}>Mensal</Text>
          <Text style={[s.headerCell, s.colBreakMinuto]}>Por minuto</Text>
        </View>
        {(
          [
            [
              'Custo fixo base (itens ÷ cadeiras)',
              breakdown.totalItens / configInfo.numeroCadeiras,
              breakdown.totalItens / configInfo.numeroCadeiras / minutosUteis,
            ],
            [
              'Depreciação de equipamentos',
              breakdown.depreciacaoMensal,
              breakdown.depreciacaoMensal / minutosUteis,
            ],
            [
              'Remuneração profissional (pró-labore + encargos)',
              breakdown.remuneracaoMensal,
              breakdown.remuneracaoMensal / minutosUteis,
            ],
            [
              'Taxa de retorno sobre investimento',
              breakdown.taxaRetornoMensal,
              breakdown.taxaRetornoMensal / minutosUteis,
            ],
          ] as [string, number, number][]
        ).map(([nome, mensal, porMin], i) => (
          <View key={nome} style={[s.tableRow, i % 2 === 1 ? s.tableRowAlt : {}]}>
            <Text style={[s.cell, s.colBreakNome]}>{nome}</Text>
            <Text style={[s.cell, s.colBreakMensal]}>{formatCurrency(mensal)}</Text>
            <Text style={[s.cell, s.colBreakMinuto]}>{formatCurrency(porMin)}</Text>
          </View>
        ))}
        <View style={s.totalRow}>
          <Text style={[s.totalText, s.colBreakNome]}>Custo fixo por minuto</Text>
          <Text style={[s.totalText, s.colBreakMensal]}>
            {formatCurrency(breakdown.totalMensal)}
          </Text>
          <Text style={[s.highlight, s.colBreakMinuto]}>{formatCurrency(breakdown.porMinuto)}</Text>
        </View>

        {/* Metodologia */}
        <View style={s.methodologyBox}>
          <Text style={s.methodologyTitle}>Metodologia CNCC/VRPO</Text>
          <Text style={s.methodologyText}>
            Este cálculo segue a metodologia da Comissão Nacional de Convênios e Credenciamentos
            (CNCC) do CFO, conforme definida na Valoração Relativa dos Procedimentos Odontológicos
            (VRPO). Os parâmetros aplicados incluem: (i) 11 meses de trabalho por ano (1 mês de
            férias), conforme CNCC; (ii) depreciação e taxa de retorno calculadas sobre os 11 meses
            anuais de produção; (iii) remuneração profissional com encargos trabalhistas (fundo de
            reserva, insalubridade, imprevistos, férias + adicional e 13º salário); e (iv) divisão
            dos custos fixos pelo número de cadeiras operantes. O custo por minuto resultante serve
            como base para o cálculo de preço de cada procedimento, compatível com as exigências de
            credenciamento junto a operadoras de planos odontológicos.
          </Text>
        </View>
      </Page>

      {/* ── Página 2+: Tabela de Preços por Especialidade ────────────────── */}
      <Page size="A4" orientation="landscape" style={s.page}>
        <View style={s.headerRow}>
          <View>
            <Text style={s.title}>Tabela de Preços por Especialidade</Text>
            <Text style={s.subtitle}>{userName}</Text>
          </View>
          <View style={s.headerRight}>
            <Text style={[s.subtitle, { fontFamily: 'Helvetica-Bold' }]}>OdontoValor</Text>
            <Text style={s.dateText}>
              Custo/min: {formatCurrency(breakdown.porMinuto)}/min · Gerado em {generatedAt}
            </Text>
          </View>
        </View>

        <View style={s.tableHeaderRow}>
          <Text style={[s.headerCell, s.colCodigo]}>Código</Text>
          <Text style={[s.headerCell, s.colNome]}>Procedimento</Text>
          <Text style={[s.headerCell, s.colTempo]}>min</Text>
          <Text style={[s.headerCell, s.colCustoVar]}>Custo Var.</Text>
          <Text style={[s.headerCell, s.colPreco]}>Preço Calc.</Text>
          <Text style={[s.headerCell, s.colVrpo]}>VRPO Ref.</Text>
          <Text style={[s.headerCell, s.colDiff]}>Δ%</Text>
        </View>

        {especialidades.map((esp) => (
          <View key={esp.nome}>
            <Text style={s.especialidadeHeader}>{esp.nome}</Text>
            {esp.procedimentos.map((p, i) => {
              const diff =
                p.vrpoReferencia && p.vrpoReferencia > 0
                  ? ((p.precoFinal - p.vrpoReferencia) / p.vrpoReferencia) * 100
                  : null;

              return (
                <View key={p.codigo} style={[s.tableRow, i % 2 === 1 ? s.tableRowAlt : {}]}>
                  <Text style={[s.cell, s.colCodigo]}>{p.codigo}</Text>
                  <Text style={[s.cell, s.colNome]}>{p.nome}</Text>
                  <Text style={[s.cell, s.colTempo]}>{p.tempoMinutos}</Text>
                  <Text style={[s.cell, s.colCustoVar]}>{formatCurrency(p.custoVariavel)}</Text>
                  <Text style={[s.cell, s.colPreco]}>{formatCurrency(p.precoFinal)}</Text>
                  <Text style={[s.cell, s.colVrpo]}>
                    {p.vrpoReferencia ? formatCurrency(p.vrpoReferencia) : '—'}
                  </Text>
                  <Text
                    style={[
                      s.cell,
                      s.colDiff,
                      diff !== null
                        ? { color: diff >= 0 ? '#15803d' : '#dc2626' }
                        : { color: '#9ca3af' },
                    ]}
                  >
                    {diff !== null ? `${diff > 0 ? '+' : ''}${formatNum(diff, 1)}%` : '—'}
                  </Text>
                </View>
              );
            })}
          </View>
        ))}
      </Page>
    </Document>
  );
}

// ─── Service ──────────────────────────────────────────────────────────────────

export class CredenciamentoPdfService {
  async generate(data: CredenciamentoDocumentData): Promise<Buffer> {
    return renderToBuffer(<CredenciamentoDocument {...data} />);
  }
}
