import { getAuthUserId } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { getProgressoOnboarding } from '@/application/usecases/dashboardActions';
import { PrimeirosPassosPage } from '@/presentation/components/primeiros-passos/PrimeirosPassosPage';

export default async function PrimeirosPassosRoute() {
  const userId = await getAuthUserId();
  if (!userId) redirect('/login');
  const progresso = await getProgressoOnboarding(userId);
  return <PrimeirosPassosPage progresso={progresso} />;
}
