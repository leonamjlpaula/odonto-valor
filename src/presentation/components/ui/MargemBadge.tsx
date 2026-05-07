import { CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { margemColor } from '@/application/usecases/calcularPrecoProcedimento';

function formatBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

interface MargemBadgeProps {
  margemLucro: number | null;
  precoMinimoParaMargem30: number;
}

export function MargemBadge({ margemLucro, precoMinimoParaMargem30 }: MargemBadgeProps) {
  const color = margemColor(margemLucro);

  if (color === null) {
    return (
      <span className="text-xs text-muted-foreground whitespace-nowrap">
        Mín: {formatBRL(precoMinimoParaMargem30)}
      </span>
    );
  }

  const pct = (margemLucro! * 100).toFixed(1);

  const config = {
    green: {
      colorClass: 'bg-green-100 text-green-800 border-green-200',
      Icon: CheckCircle,
      ariaLabel: 'Margem saudável',
    },
    yellow: {
      colorClass: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      Icon: AlertCircle,
      ariaLabel: 'Margem de atenção',
    },
    red: {
      colorClass: 'bg-red-100 text-red-800 border-red-200',
      Icon: XCircle,
      ariaLabel: 'Margem crítica',
    },
  }[color];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border tabular-nums',
        config.colorClass
      )}
      aria-label={`${config.ariaLabel}: ${pct}%`}
    >
      <config.Icon className="h-3 w-3 shrink-0" aria-hidden="true" />
      {pct}%
    </span>
  );
}
