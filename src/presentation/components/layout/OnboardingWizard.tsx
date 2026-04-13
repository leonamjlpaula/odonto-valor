'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/presentation/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/presentation/components/ui/card'
import { updateOnboardingCompleted, savePerfilConsultorio } from '@/application/usecases/onboardingActions'

type WizardStep = 'perfil' | 'clinica-explicativo' | 1 | 2 | 3

type Props = {
  userId: string
  perfilConsultorio: string | null
}

const CONFIG_STEPS = [
  {
    step: 1 as const,
    title: 'Configure seus custos fixos',
    description:
      'Informe seus custos mensais do consultório (aluguel, energia, funcionários, etc.) para que o sistema calcule seu custo por minuto de trabalho.',
    actionLabel: 'Ir para Custos Fixos',
    href: '/custos-fixos',
  },
  {
    step: 2 as const,
    title: 'Atualize os preços dos materiais',
    description:
      'Revise e atualize os preços dos materiais odontológicos que você utiliza. Isso garante que os custos variáveis de cada procedimento sejam precisos.',
    actionLabel: 'Ir para Materiais',
    href: '/materiais',
  },
  {
    step: 3 as const,
    title: 'Veja seus procedimentos calculados',
    description:
      'Explore os procedimentos com os preços calculados automaticamente a partir dos seus custos. Compare com a tabela VRPO de referência.',
    actionLabel: 'Ver Procedimentos',
    href: '/procedimentos/diagnostico',
  },
]

export function OnboardingWizard({ userId, perfilConsultorio }: Props) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<WizardStep>(
    perfilConsultorio === null ? 'perfil' : 1
  )
  const [isVisible, setIsVisible] = useState(true)
  const [isPending, startTransition] = useTransition()

  if (!isVisible) return null

  async function handleSelectPerfil(perfil: 'solo' | 'clinica') {
    startTransition(async () => {
      await savePerfilConsultorio(userId, perfil)
      if (perfil === 'clinica') {
        setCurrentStep('clinica-explicativo')
      } else {
        setCurrentStep(1)
      }
    })
  }

  async function handleSkip() {
    startTransition(async () => {
      await updateOnboardingCompleted(userId)
      setIsVisible(false)
      router.refresh()
    })
  }

  async function handleComplete() {
    startTransition(async () => {
      await updateOnboardingCompleted(userId)
      setIsVisible(false)
      router.refresh()
    })
  }

  function handleNext() {
    if (typeof currentStep === 'number' && currentStep < 3) {
      setCurrentStep((currentStep + 1) as 1 | 2 | 3)
    }
  }

  function handlePrev() {
    if (currentStep === 2) setCurrentStep(1)
    else if (currentStep === 3) setCurrentStep(2)
  }

  const numericStep = typeof currentStep === 'number' ? currentStep : null
  const step = numericStep !== null ? CONFIG_STEPS[numericStep - 1] : null
  const progressPercent = numericStep !== null ? Math.round((numericStep / 3) * 100) : 0

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">Bem-vindo ao Precifica!</CardTitle>
            <CardDescription className="mt-1">
              {currentStep === 'perfil'
                ? 'Vamos configurar seu consultório do jeito certo para você.'
                : currentStep === 'clinica-explicativo'
                  ? 'Entenda como funciona o rateio por cadeiras.'
                  : 'Siga os passos abaixo para configurar seu consultório.'}
            </CardDescription>
          </div>
          {currentStep !== 'perfil' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSkip}
              disabled={isPending}
              className="text-muted-foreground"
            >
              Pular configuração
            </Button>
          )}
        </div>

        {/* Progress bar — só para passos numéricos */}
        {numericStep !== null && (
          <div className="mt-3 space-y-1">
            <p className="text-xs font-medium text-muted-foreground">
              Passo {numericStep} de 3
            </p>
            <div className="h-2 w-full rounded-full bg-blue-200">
              <div
                className="h-2 rounded-full bg-blue-600 transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}
      </CardHeader>

      {/* Passo 0: Pergunta de perfil */}
      {currentStep === 'perfil' && (
        <CardContent className="space-y-4">
          <div className="rounded-md bg-white p-4 shadow-sm">
            <h3 className="font-semibold text-foreground">Como você atende?</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Isso nos ajuda a configurar seu consultório da forma mais adequada.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <button
              onClick={() => handleSelectPerfil('solo')}
              disabled={isPending}
              className="rounded-md border-2 border-transparent bg-white p-4 text-left shadow-sm transition-colors hover:border-blue-400 focus:border-blue-400 focus:outline-none disabled:opacity-50"
            >
              <p className="font-semibold text-foreground">Atendo sozinho(a)</p>
              <p className="mt-1 text-sm text-muted-foreground">Consultório individual, 1 cadeira</p>
            </button>
            <button
              onClick={() => handleSelectPerfil('clinica')}
              disabled={isPending}
              className="rounded-md border-2 border-transparent bg-white p-4 text-left shadow-sm transition-colors hover:border-blue-400 focus:border-blue-400 focus:outline-none disabled:opacity-50"
            >
              <p className="font-semibold text-foreground">Divido o espaço com outros dentistas</p>
              <p className="mt-1 text-sm text-muted-foreground">Clínica com 2 ou mais cadeiras ativas</p>
            </button>
          </div>
        </CardContent>
      )}

      {/* Passo explicativo: clínica */}
      {currentStep === 'clinica-explicativo' && (
        <CardContent className="space-y-4">
          <div className="rounded-md bg-white p-4 shadow-sm space-y-3">
            <h3 className="font-semibold text-foreground">Como funciona o rateio por cadeiras</h3>
            <p className="text-sm text-muted-foreground">
              Em uma clínica compartilhada, os custos fixos são divididos entre as cadeiras ativas.
            </p>
            <div className="rounded-md border border-blue-200 bg-blue-50 px-4 py-3 text-sm">
              <p className="font-medium text-blue-900">Exemplo:</p>
              <ul className="mt-2 space-y-1 text-blue-800">
                <li>Aluguel + energia + funcionários: <strong>R$ 5.000/mês</strong></li>
                <li>Cadeiras ativas na clínica: <strong>3</strong></li>
                <li className="border-t border-blue-200 pt-1">
                  Custo por cadeira: <strong>R$ 5.000 ÷ 3 = R$ 1.667/mês</strong>
                </li>
              </ul>
            </div>
            <p className="text-sm text-muted-foreground">
              Você vai configurar o número de cadeiras na próxima tela. Pode ajustar quando quiser.
            </p>
          </div>
          <div className="flex justify-end">
            <Button size="sm" onClick={() => setCurrentStep(1)} disabled={isPending}>
              Entendi, vamos lá →
            </Button>
          </div>
        </CardContent>
      )}

      {/* Passos 1, 2, 3: fluxo original */}
      {numericStep !== null && step !== null && (
        <CardContent className="space-y-4">
          <div className="rounded-md bg-white p-4 shadow-sm">
            <h3 className="font-semibold text-foreground">{step.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{step.description}</p>
          </div>

          <div className="flex items-center justify-between gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrev}
              disabled={numericStep === 1 || isPending}
            >
              Anterior
            </Button>

            <div className="flex items-center gap-2">
              <Button asChild variant="outline" size="sm">
                <Link href={step.href}>{step.actionLabel}</Link>
              </Button>

              {numericStep < 3 ? (
                <Button size="sm" onClick={handleNext} disabled={isPending}>
                  Próximo
                </Button>
              ) : (
                <Button size="sm" onClick={handleComplete} disabled={isPending}>
                  {isPending ? 'Concluindo…' : 'Concluir'}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  )
}
