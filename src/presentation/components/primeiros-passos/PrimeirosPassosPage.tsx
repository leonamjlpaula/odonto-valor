'use client'

import Link from 'next/link'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/presentation/components/ui/card'
import { Button } from '@/presentation/components/ui/button'
import { Badge } from '@/presentation/components/ui/badge'
import {
  DollarSign,
  Package,
  ClipboardList,
  BarChart2,
  Sliders,
  Clock,
  Download,
  ArrowRight,
  TrendingUp,
} from 'lucide-react'

const configuracaoSteps = [
  {
    number: 1,
    icon: DollarSign,
    title: 'Configure seus Custos Fixos',
    description:
      'Aluguel, salários, contas, depreciação de equipamentos — o sistema calcula o custo exato por minuto usando a metodologia CNCC com 11 meses de trabalho por ano.',
    href: '/custos-fixos',
    tip: 'Inclua o número de cadeiras e sua taxa de ociosidade para maior precisão.',
  },
  {
    number: 2,
    icon: Package,
    title: 'Atualize os preços dos materiais',
    description:
      'Coloque os preços atuais dos insumos do seu consultório. O sistema já vem com 134 materiais pré-cadastrados — basta confirmar os valores.',
    href: '/materiais',
    tip: 'Revise pelo menos os materiais dos procedimentos que você mais realiza.',
  },
  {
    number: 3,
    icon: ClipboardList,
    title: 'Defina seu preço de venda',
    description:
      'Com os custos configurados, cadastre o preço que você cobra por cada procedimento. O sistema calcula a margem de lucro automaticamente e alerta quando está abaixo de 30%.',
    href: '/procedimentos/diagnostico',
    tip: 'Margem verde ≥ 30% · amarelo 10–29% · vermelho < 10%.',
  },
]

const analiseSteps = [
  {
    number: 4,
    icon: BarChart2,
    title: 'Compare com a tabela VRPO',
    description:
      'Veja quais dos seus procedimentos estão abaixo do valor de referência nacional. Use essa diferença como margem de negociação com convênios.',
    href: '/comparativo-vrpo',
  },
  {
    number: 5,
    icon: Sliders,
    title: 'Simule cenários',
    description:
      'Ajuste custo fixo total, número de cadeiras, ociosidade, impostos e taxa de cartão em tempo real — sem alterar nada permanentemente. Ideal para tomar decisões antes de agir.',
    href: '/simulador',
    isNew: true,
  },
]

const ferramentas = [
  {
    icon: Clock,
    title: 'Registre sua precificação',
    description:
      'Salva um histórico com todos os preços e custos do momento atual. Útil para comparar com versões futuras após reajustes.',
    href: '/historico',
    label: 'Ir para Histórico',
  },
  {
    icon: Download,
    title: 'Exporte para convênios',
    description:
      'Gere um PDF ou planilha Excel com a tabela completa de preços, incluindo a memória de cálculo pela metodologia CNCC.',
    href: '/exportar',
    label: 'Ir para Exportar',
  },
]

export function PrimeirosPassosPage() {
  return (
    <div className="space-y-10 max-w-4xl">
      {/* Hero */}
      <div className="space-y-3">
        <h1 className="text-2xl font-bold tracking-tight">Primeiros Passos</h1>
        <p className="text-muted-foreground leading-relaxed max-w-2xl">
          Configure o OdontoValor em poucos passos e descubra se cada procedimento está gerando lucro
          real — com base nos seus custos reais e na metodologia oficial da CNCC.
        </p>
      </div>

      {/* Formula */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Como funciona o cálculo</CardTitle>
          <CardDescription>Fórmula simplificada baseada na metodologia VRPO/CNCC</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-stretch gap-2 text-center">
            <div className="flex-1 rounded-lg border bg-muted/50 p-4 space-y-1">
              <p className="text-sm font-semibold">Tempo (min)</p>
              <p className="text-xs text-muted-foreground">duração do procedimento</p>
            </div>
            <div className="flex items-center justify-center text-lg font-bold text-muted-foreground px-1">×</div>
            <div className="flex-1 rounded-lg border bg-muted/50 p-4 space-y-1">
              <p className="text-sm font-semibold">Custo Fixo/min</p>
              <p className="text-xs text-muted-foreground">custo do consultório por minuto</p>
            </div>
            <div className="flex items-center justify-center text-lg font-bold text-muted-foreground px-1">+</div>
            <div className="flex-1 rounded-lg border bg-muted/50 p-4 space-y-1">
              <p className="text-sm font-semibold">Custo Variável</p>
              <p className="text-xs text-muted-foreground">materiais usados no procedimento</p>
            </div>
            <div className="flex items-center justify-center text-lg font-bold text-muted-foreground px-1">=</div>
            <div className="flex-1 rounded-lg border border-primary bg-primary/5 p-4 space-y-1">
              <p className="text-sm font-semibold text-primary">Preço de Custo</p>
              <p className="text-xs text-muted-foreground">base para calcular sua margem</p>
            </div>
          </div>

          <div className="mt-4 flex items-start gap-2 rounded-md bg-muted/50 px-4 py-3 text-sm text-muted-foreground">
            <TrendingUp className="h-4 w-4 shrink-0 mt-0.5 text-primary" aria-hidden="true" />
            <span>
              A <strong className="text-foreground">margem de lucro</strong> é calculada sobre o
              preço de venda que você pratica, descontando impostos (ISS/Simples) e taxa de
              cartão. Meta: <strong className="text-foreground">30% ou mais</strong>.
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Configuração base */}
      <section aria-labelledby="config-heading">
        <h2 id="config-heading" className="text-base font-semibold mb-4 text-foreground">
          1. Configure a base do sistema
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {configuracaoSteps.map((step) => {
            const Icon = step.icon
            return (
              <Card key={step.number} className="flex flex-col">
                <CardHeader className="pb-3">
                  <div className="flex items-start gap-3">
                    <span
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold"
                      aria-label={`Passo ${step.number}`}
                    >
                      {step.number}
                    </span>
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                        <CardTitle className="text-sm leading-tight">{step.title}</CardTitle>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col flex-1 space-y-3">
                  <p className="text-sm text-muted-foreground flex-1">{step.description}</p>
                  {step.tip && (
                    <p className="text-xs text-muted-foreground border-l-2 border-primary/40 pl-2 italic">
                      {step.tip}
                    </p>
                  )}
                  <Button asChild size="sm" variant="outline" className="w-fit">
                    <Link href={step.href}>
                      Ir para <ArrowRight className="ml-1 h-3 w-3" aria-hidden="true" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </section>

      {/* Análise e simulação */}
      <section aria-labelledby="analise-heading">
        <h2 id="analise-heading" className="text-base font-semibold mb-4 text-foreground">
          2. Analise e simule
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {analiseSteps.map((step) => {
            const Icon = step.icon
            return (
              <Card key={step.number} className="flex flex-col">
                <CardHeader className="pb-3">
                  <div className="flex items-start gap-3">
                    <span
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold"
                      aria-label={`Passo ${step.number}`}
                    >
                      {step.number}
                    </span>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                        <CardTitle className="text-sm leading-tight">{step.title}</CardTitle>
                      </div>
                      {step.isNew && (
                        <Badge variant="default" className="text-xs">Novo</Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col flex-1 space-y-3">
                  <p className="text-sm text-muted-foreground flex-1">{step.description}</p>
                  <Button asChild size="sm" variant="outline" className="w-fit">
                    <Link href={step.href}>
                      Ir para <ArrowRight className="ml-1 h-3 w-3" aria-hidden="true" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </section>

      {/* Ferramentas avançadas */}
      <section aria-labelledby="ferramentas-heading">
        <h2 id="ferramentas-heading" className="text-base font-semibold mb-4 text-foreground">
          Ferramentas complementares
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {ferramentas.map((item) => {
            const Icon = item.icon
            return (
              <Card key={item.href} className="flex flex-col">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    <CardTitle className="text-sm">{item.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col flex-1 space-y-3">
                  <CardDescription className="flex-1 text-sm">{item.description}</CardDescription>
                  <Button asChild size="sm" variant="outline" className="w-fit">
                    <Link href={item.href}>{item.label}</Link>
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </section>
    </div>
  )
}
