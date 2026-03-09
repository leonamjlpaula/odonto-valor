'use server'

import crypto from 'crypto'
import bcrypt from 'bcrypt'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { sendPasswordResetEmail } from '@/infrastructure/services/EmailService'

export type ActionResult = { success: true } | { error: string }

// ─── requestPasswordReset ──────────────────────────────────────────────────────

const requestSchema = z.object({
  email: z.string().email('Email inválido'),
})

export async function requestPasswordReset(formData: FormData): Promise<ActionResult> {
  const parsed = requestSchema.safeParse({ email: formData.get('email') })
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message }
  }

  const { email } = parsed.data
  const user = await prisma.user.findUnique({ where: { email } })

  // Não revelar se o email existe ou não (segurança)
  if (!user) {
    return { success: true }
  }

  // Invalida tokens anteriores não utilizados
  await prisma.passwordResetToken.updateMany({
    where: { userId: user.id, usedAt: null },
    data: { usedAt: new Date() },
  })

  const token = crypto.randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hora

  await prisma.passwordResetToken.create({
    data: { userId: user.id, token, expiresAt },
  })

  await sendPasswordResetEmail(email, token)

  return { success: true }
}

// ─── validateResetToken ────────────────────────────────────────────────────────

export async function validateResetToken(token: string): Promise<boolean> {
  const record = await prisma.passwordResetToken.findUnique({ where: { token } })
  if (!record) return false
  if (record.usedAt) return false
  if (record.expiresAt < new Date()) return false
  return true
}

// ─── resetPassword ─────────────────────────────────────────────────────────────

const resetSchema = z
  .object({
    password: z.string().min(8, 'A senha deve ter no mínimo 8 caracteres'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  })

export async function resetPassword(token: string, formData: FormData): Promise<ActionResult> {
  const parsed = resetSchema.safeParse({
    password: formData.get('password'),
    confirmPassword: formData.get('confirmPassword'),
  })
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message }
  }

  const record = await prisma.passwordResetToken.findUnique({ where: { token } })

  if (!record || record.usedAt || record.expiresAt < new Date()) {
    return { error: 'Link inválido ou expirado. Solicite um novo.' }
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12)

  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.userId },
      data: { passwordHash },
    }),
    prisma.passwordResetToken.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    }),
  ])

  return { success: true }
}
