'use client';

import { usePosthogEvents } from '@/presentation/hooks/usePosthogEvents';
import { Button } from '@/presentation/components/ui/button';

interface Feature {
  id: string;
  title: string;
  description: string;
  demand: 'Alto' | 'Médio' | 'Baixo';
}

const features: Feature[] = [
  {
    id: 'breakeven-por-procedimento',
    title: 'Break-even por procedimento',
    description: 'Quantas consultas de X por mês você precisa fazer para cobrir seus custos fixos.',
    demand: 'Alto',
  },
  {
    id: 'calculadora-pacotes',
    title: 'Calculadora de pacotes e fidelização',
    description: 'Simule descontos para pacotes de procedimentos mantendo a margem saudável.',
    demand: 'Alto',
  },
  {
    id: 'metas-faturamento',
    title: 'Metas de faturamento mensal',
    description:
      'Defina uma meta de receita e veja quantos procedimentos são necessários para atingi-la.',
    demand: 'Médio',
  },
  {
    id: 'notificacao-inflacao',
    title: 'Alertas de revisão por inflação (IPCA)',
    description: 'Receba lembretes periódicos para revisar preços conforme a inflação acumulada.',
    demand: 'Médio',
  },
  {
    id: 'benchmarks-mercado',
    title: 'Benchmarks anonimizados de mercado',
    description:
      'Compare suas margens com outros consultórios da mesma especialidade, de forma anônima.',
    demand: 'Alto',
  },
  {
    id: 'multiplos-consultorios',
    title: 'Múltiplos consultórios',
    description: 'Gerencie a precificação de mais de um consultório ou clínica na mesma conta.',
    demand: 'Médio',
  },
  {
    id: 'relatorio-contador',
    title: 'Relatório para contador (DRE simplificada)',
    description: 'Exporte um demonstrativo de resultado simplificado pronto para seu contador.',
    demand: 'Baixo',
  },
  {
    id: 'integracao-agenda',
    title: 'Integração com agenda',
    description: 'Calcule a ocupação real do consultório automaticamente a partir da sua agenda.',
    demand: 'Alto',
  },
];

const demandColor: Record<Feature['demand'], string> = {
  Alto: 'bg-green-100 text-green-800',
  Médio: 'bg-yellow-100 text-yellow-800',
  Baixo: 'bg-gray-100 text-gray-700',
};

export function EmBrevePage() {
  const events = usePosthogEvents();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Em breve</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Funcionalidades planejadas para o OdontoValor. Vote nas que mais importam para você.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {features.map((feature) => (
          <div key={feature.id} className="rounded-lg border p-4 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <h2 className="font-semibold text-sm leading-snug">{feature.title}</h2>
              <span
                className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${demandColor[feature.demand]}`}
              >
                {feature.demand}
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs"
              onClick={() => events.featureInterestRegistered(feature.id)}
            >
              Me avise quando estiver pronto
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
