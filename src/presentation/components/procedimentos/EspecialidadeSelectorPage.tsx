'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { CheckSquare, Square } from 'lucide-react';
import { saveEspecialidadesSelecionadas } from '@/application/usecases/custoFixoActions';
import type { Especialidade } from '@prisma/client';
import { Button } from '@/presentation/components/ui/button';
import { cn } from '@/lib/utils';

interface Props {
  userId: string;
  especialidades: Especialidade[];
}

export function EspecialidadeSelectorPage({ userId, especialidades }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [error, setError] = useState('');

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    setError('');
  }

  function handleContinue() {
    if (selected.size === 0) {
      setError('Selecione pelo menos uma especialidade para continuar.');
      return;
    }
    startTransition(async () => {
      const result = await saveEspecialidadesSelecionadas(userId, Array.from(selected));
      if ('success' in result) {
        const first = especialidades.find((e) => selected.has(e.id));
        router.push(first ? `/procedimentos/${first.codigo}` : '/procedimentos/diagnostico');
      }
    });
  }

  return (
    <div className="max-w-lg mx-auto py-12 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Quais especialidades você pratica?</h1>
        <p className="text-muted-foreground mt-2">
          Selecione as especialidades que você atende. Você verá apenas os procedimentos relevantes
          para o seu consultório.
        </p>
      </div>

      <div className="space-y-2">
        {especialidades.map((esp) => {
          const isSelected = selected.has(esp.id);
          return (
            <button
              key={esp.id}
              type="button"
              onClick={() => toggle(esp.id)}
              className={cn(
                'w-full flex items-center gap-3 px-4 py-3 rounded-lg border text-left text-sm transition-colors',
                isSelected
                  ? 'border-primary bg-primary/5 text-foreground'
                  : 'border-border hover:bg-muted/30 text-muted-foreground hover:text-foreground'
              )}
            >
              {isSelected ? (
                <CheckSquare className="h-4 w-4 shrink-0 text-primary" />
              ) : (
                <Square className="h-4 w-4 shrink-0" />
              )}
              <span className="flex-1 font-medium">{esp.nome}</span>
            </button>
          );
        })}
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex items-center gap-4 flex-wrap">
        <Button onClick={handleContinue} disabled={isPending || selected.size === 0} size="lg">
          {isPending
            ? 'Salvando...'
            : `Continuar com ${selected.size} especialidade${selected.size !== 1 ? 's' : ''}`}
        </Button>
        <Button variant="ghost" onClick={() => router.push('/procedimentos/diagnostico')}>
          Ver todas as especialidades
        </Button>
      </div>
    </div>
  );
}
