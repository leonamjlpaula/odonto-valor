'use server'

import { prisma } from '@/lib/db'

export async function updateOnboardingCompleted(userId: string): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: { onboardingCompleted: true },
  })
}
