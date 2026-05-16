import { redirect } from 'next/navigation';
import { getAuthUser } from '@/lib/supabase/server';
import { prisma } from '@/lib/db';
import { SuportePage } from '@/presentation/components/suporte/SuportePage';

export default async function SuporteRoute() {
  const user = await getAuthUser();
  if (!user) redirect('/login');

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { nome: true, email: true },
  });

  return (
    <SuportePage
      nome={dbUser?.nome ?? ''}
      email={dbUser?.email ?? user.email ?? ''}
      whatsappNumber={process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? null}
    />
  );
}
