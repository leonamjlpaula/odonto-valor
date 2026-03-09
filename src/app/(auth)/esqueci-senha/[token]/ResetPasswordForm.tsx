'use client'

import { useActionState } from 'react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Button } from '@/presentation/components/ui/button'
import { Label } from '@/presentation/components/ui/label'
import { PasswordInput } from '@/presentation/components/ui/password-input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/presentation/components/ui/card'
import { resetPassword } from '@/application/usecases/passwordResetActions'

type State = { success?: boolean; error?: string } | null

export default function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter()

  async function action(_prev: State, formData: FormData): Promise<State> {
    const result = await resetPassword(token, formData)
    if ('error' in result) return { error: result.error }
    return { success: true }
  }

  const [state, formAction, isPending] = useActionState(action, null)

  useEffect(() => {
    if (state?.success) {
      const timer = setTimeout(() => {
        router.push('/login?success=Senha redefinida com sucesso. Faça login.')
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [state?.success, router])

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">Nova senha</CardTitle>
        <CardDescription className="text-center">
          Escolha uma senha segura com no mínimo 8 caracteres.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {state?.success ? (
          <div className="p-3 rounded-md bg-green-50 border border-green-200 text-green-700 text-sm">
            Senha redefinida com sucesso! Redirecionando para o login...
          </div>
        ) : (
          <form action={formAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Nova senha</Label>
              <PasswordInput
                id="password"
                name="password"
                placeholder="Mínimo 8 caracteres"
                required
                disabled={isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar nova senha</Label>
              <PasswordInput
                id="confirmPassword"
                name="confirmPassword"
                placeholder="Repita a nova senha"
                required
                disabled={isPending}
              />
            </div>

            {state?.error && (
              <p className="text-sm text-destructive">{state.error}</p>
            )}

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? 'Salvando...' : 'Redefinir senha'}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  )
}
