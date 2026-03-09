import { redirect } from 'next/navigation'
import { validateResetToken } from '@/application/usecases/passwordResetActions'
import ResetPasswordForm from './ResetPasswordForm'

interface Props {
  params: Promise<{ token: string }>
}

export default async function ResetPasswordPage({ params }: Props) {
  const { token } = await params
  const valid = await validateResetToken(token)

  if (!valid) {
    redirect('/esqueci-senha?erro=link-invalido')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <ResetPasswordForm token={token} />
    </div>
  )
}
