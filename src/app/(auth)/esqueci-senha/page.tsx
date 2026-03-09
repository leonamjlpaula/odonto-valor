'use client'

import { useActionState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/presentation/components/ui/button'
import { Input } from '@/presentation/components/ui/input'
import { Label } from '@/presentation/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/presentation/components/ui/card'
import { requestPasswordReset } from '@/application/usecases/passwordResetActions'

type State = { success?: boolean; error?: string } | null

async function action(_prev: State, formData: FormData): Promise<State> {
  const result = await requestPasswordReset(formData)
  if ('error' in result) return { error: result.error }
  return { success: true }
}

export default function EsqueciSenhaPage() {
  const searchParams = useSearchParams()
  const linkInvalido = searchParams.get('erro') === 'link-invalido'
  const [state, formAction, isPending] = useActionState(action, null)

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Esqueci minha senha</CardTitle>
          <CardDescription className="text-center">
            Digite seu email e enviaremos um link para redefinir sua senha.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {linkInvalido && (
            <div className="mb-4 p-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-sm">
              Este link de redefinição é inválido ou já expirou. Solicite um novo abaixo.
            </div>
          )}
          {state?.success ? (
            <div className="space-y-4">
              <div className="p-3 rounded-md bg-green-50 border border-green-200 text-green-700 text-sm">
                Se este email estiver cadastrado, você receberá um link em instantes.
                Verifique também a pasta de spam.
              </div>
              <Button asChild variant="outline" className="w-full">
                <Link href="/login">Voltar para o login</Link>
              </Button>
            </div>
          ) : (
            <form action={formAction} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="joao@consultorio.com"
                  required
                  disabled={isPending}
                />
              </div>

              {state?.error && (
                <p className="text-sm text-destructive">{state.error}</p>
              )}

              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? 'Enviando...' : 'Enviar link de redefinição'}
              </Button>

              <div className="text-center text-sm text-muted-foreground">
                <Link href="/login" className="text-primary underline-offset-4 hover:underline">
                  Voltar para o login
                </Link>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
