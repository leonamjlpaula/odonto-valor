import { redirect } from 'next/navigation';
import { getAuthUser } from '@/lib/supabase/server';
import { DashboardLayout } from '@/presentation/components/layout/DashboardLayout';
import { getProgressoOnboarding } from '@/application/usecases/dashboardActions';

export default async function DashboardRouteLayout({ children }: { children: React.ReactNode }) {
  const user = await getAuthUser();

  if (!user) {
    redirect('/login');
  }

  const userName = user.user_metadata?.nome ?? user.email ?? 'Usuário';
  const progresso = await getProgressoOnboarding(user.id);

  return (
    <DashboardLayout userName={userName} progresso={progresso}>
      {children}
    </DashboardLayout>
  );
}
