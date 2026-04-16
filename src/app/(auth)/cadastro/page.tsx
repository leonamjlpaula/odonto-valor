'use client';

import { useActionState, useEffect, useState, useTransition } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/presentation/components/ui/button';
import banner from '@/assets/odonto_valor_banner.png';
import { Input } from '@/presentation/components/ui/input';
import { PasswordInput } from '@/presentation/components/ui/password-input';
import { Label } from '@/presentation/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/presentation/components/ui/card';
import { createUser, type CreateUserState } from '@/application/usecases/createUser';

const initialState: CreateUserState = {};

export default function CadastroPage() {
  const [state, action, isPending] = useActionState(createUser, initialState);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmSenha, setConfirmSenha] = useState('');
  const [countdown, setCountdown] = useState(60);
  const [isResending, startResendTransition] = useTransition();
  const [resendSuccess, setResendSuccess] = useState(false);

  useEffect(() => {
    if (!state.success || countdown === 0) return;
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [state.success, countdown]);

  function handleResend() {
    setResendSuccess(false);
    startResendTransition(async () => {
      const supabase = createClient();
      await supabase.auth.resend({ type: 'signup', email });
      setResendSuccess(true);
      setCountdown(60);
    });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <div className="px-6 pt-6">
          <Image src={banner} alt="OdontoValor" className="w-full h-auto rounded-md" priority />
        </div>
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Criar conta</CardTitle>
          <CardDescription className="text-center">
            Cadastre-se para começar a precificar seus procedimentos
          </CardDescription>
        </CardHeader>
        <CardContent>
          {state.success && (
            <div className="p-4 rounded-md bg-green-50 border border-green-200 text-green-800 text-sm space-y-3">
              <p className="font-medium">Conta criada com sucesso!</p>
              <p>
                Enviamos um email de confirmação para <span className="font-medium">{email}</span>.
                Verifique a caixa de entrada (e o spam) e clique no link para ativar sua conta.
              </p>
              <div className="flex items-center gap-2 pt-1">
                {countdown > 0 ? (
                  <span className="text-green-700">Reenviar em {countdown}s</span>
                ) : resendSuccess ? (
                  <span className="font-medium">Email reenviado!</span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={isResending}
                    className="underline font-medium underline-offset-4 hover:opacity-75 disabled:opacity-50"
                  >
                    {isResending ? 'Reenviando…' : 'Reenviar email de confirmação'}
                  </button>
                )}
              </div>
              <p>
                Depois de confirmar,{' '}
                <a href="/login" className="underline font-medium">
                  faça login aqui
                </a>
                .
              </p>
            </div>
          )}

          {!state.success && (
            <form action={action} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome completo</Label>
                <Input
                  id="nome"
                  name="nome"
                  type="text"
                  placeholder="Dr. João Silva"
                  autoComplete="name"
                  required
                  disabled={isPending}
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                />
                {state.errors?.nome && (
                  <p className="text-sm text-destructive">{state.errors.nome[0]}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="joao@consultorio.com"
                  autoComplete="email"
                  required
                  disabled={isPending}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                {state.errors?.email && (
                  <p className="text-sm text-destructive">{state.errors.email[0]}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="senha">Senha</Label>
                <PasswordInput
                  id="senha"
                  name="senha"
                  placeholder="Mínimo 8 caracteres"
                  autoComplete="new-password"
                  required
                  disabled={isPending}
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                />
                {state.errors?.senha && (
                  <p className="text-sm text-destructive">{state.errors.senha[0]}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmSenha">Confirmar senha</Label>
                <PasswordInput
                  id="confirmSenha"
                  name="confirmSenha"
                  placeholder="Repita a senha"
                  autoComplete="new-password"
                  required
                  disabled={isPending}
                  value={confirmSenha}
                  onChange={(e) => setConfirmSenha(e.target.value)}
                />
                {state.errors?.confirmSenha && (
                  <p className="text-sm text-destructive">{state.errors.confirmSenha[0]}</p>
                )}
              </div>

              {state.errors?.general && (
                <p className="text-sm text-destructive">{state.errors.general[0]}</p>
              )}

              <Button type="submit" className="w-full" loading={isPending}>
                Criar conta
              </Button>
            </form>
          )}

          {!state.success && (
            <div className="mt-4 text-center text-sm text-muted-foreground">
              Já tem uma conta?{' '}
              <Link
                href="/login"
                className="text-primary underline-offset-4 hover:underline font-medium"
              >
                Faça login
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
