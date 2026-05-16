'use client';

import { useActionState } from 'react';
import { sendSupportEmail, type SuporteState } from '@/application/usecases/suporteActions';
import { Button } from '@/presentation/components/ui/button';
import { Label } from '@/presentation/components/ui/label';

interface SuportePageProps {
  nome: string;
  email: string;
  whatsappNumber: string | null;
}

const initialState: SuporteState = {};

export function SuportePage({ nome, email, whatsappNumber }: SuportePageProps) {
  const [state, action, isPending] = useActionState(sendSupportEmail, initialState);

  return (
    <div className="max-w-lg space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Suporte</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Tem algum problema, dúvida ou sugestão? Fale conosco.
        </p>
      </div>

      {state.success ? (
        <div className="p-4 rounded-md bg-green-50 border border-green-200 text-green-800 space-y-1">
          <p className="font-semibold">Mensagem enviada!</p>
          <p className="text-sm">Respondemos em até 24 horas pelo email cadastrado.</p>
        </div>
      ) : (
        <form action={action} className="space-y-4">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Nome</p>
            <p className="text-sm font-medium">{nome}</p>
          </div>

          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Email de resposta</p>
            <p className="text-sm font-medium">{email}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="categoria">Categoria</Label>
            <select
              id="categoria"
              name="categoria"
              required
              disabled={isPending}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">Selecione uma categoria</option>
              <option value="problema">Problema técnico</option>
              <option value="duvida">Dúvida</option>
              <option value="sugestao">Sugestão</option>
              <option value="funcionalidade">Solicitar nova funcionalidade</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="mensagem">Mensagem</Label>
            <textarea
              id="mensagem"
              name="mensagem"
              rows={5}
              required
              disabled={isPending}
              placeholder="Descreva sua dúvida, problema ou sugestão..."
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
            />
            {state.errors?.mensagem && (
              <p className="text-sm text-destructive">{state.errors.mensagem[0]}</p>
            )}
          </div>

          {state.errors?.general && (
            <p className="text-sm text-destructive">{state.errors.general[0]}</p>
          )}

          <Button type="submit" className="w-full" loading={isPending}>
            Enviar mensagem
          </Button>
        </form>
      )}

      {whatsappNumber && (
        <div className="rounded-lg border p-4 space-y-2">
          <p className="text-sm font-medium">Prefere o WhatsApp?</p>
          <a
            href={`https://wa.me/${whatsappNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-primary underline-offset-4 hover:underline"
          >
            Abrir conversa no WhatsApp
          </a>
          <p className="text-xs text-muted-foreground">Atendimento em horário comercial</p>
        </div>
      )}
    </div>
  );
}
