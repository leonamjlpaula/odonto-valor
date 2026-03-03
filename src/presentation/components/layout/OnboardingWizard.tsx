'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/presentation/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/presentation/components/ui/card'
import { updateOnboardingCompleted } from '@/application/usecases/onboardingActions'

type Props = {
  userId: string
}

const STEPS = [
  {
    step: 1,
    title: 'Configure seus custos fixos',
    description:
      'Informe seus custos mensais do consultório (aluguel, energia, funcionários, etc.) para que o sistema calcule seu custo por minuto de trabalho.',
    actionLabel: 'Ir para Custos Fixos',
    href: '/custos-fixos',
  },
  {
    step: 2,
    title: 'Atualize os preços dos materiais',
    description:
      'Revise e atualize os preços dos materiais odontológicos que você utiliza. Isso garante que os custos variáveis de cada procedimento sejam precisos.',
    actionLabel: 'Ir para Materiais',
    href: '/materiais',
  },
  {
    step: 3,
    title: 'Veja seus procedimentos calculados',
    description:
      'Explore os procedimentos com os preços calculados automaticamente a partir dos seus custos. Compare com a tabela VRPO de referência.',
    actionLabel: 'Ver Procedimentos',
    href: '/procedimentos/diagnostico',
  },
]

export function OnboardingWizard({ userId }: Props) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isVisible, setIsVisible] = useState(true)
  const [isPending, startTransition] = useTransition()

  if (!isVisible) return null

  const step = STEPS[currentStep - 1]
  const progressPercent = Math.round((currentStep / 3) * 100)

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
    if (currentStep < 3) {
      setCurrentStep((s) => s + 1)
    }
  }

  function handlePrev() {
    if (currentStep > 1) {
      setCurrentStep((s) => s - 1)
    }
  }

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">Bem-vindo ao Precifica!</CardTitle>
            <CardDescription className="mt-1">
              Siga os passos abaixo para configurar seu consultório.
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSkip}
            disabled={isPending}
            className="text-muted-foreground"
          >
            Pular configuração
          </Button>
        </div>

        {/* Progress bar */}
        <div className="mt-3 space-y-1">
          <p className="text-xs font-medium text-muted-foreground">
            Passo {currentStep} de 3
          </p>
          <div className="h-2 w-full rounded-full bg-blue-200">
            <div
              className="h-2 rounded-full bg-blue-600 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </CardHeader>

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
            disabled={currentStep === 1 || isPending}
          >
            Anterior
          </Button>

          <div className="flex items-center gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href={step.href}>{step.actionLabel}</Link>
            </Button>

            {currentStep < 3 ? (
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
    </Card>
  )
}
