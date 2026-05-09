import { redirect } from 'next/navigation';
import { getAuthUser } from '@/lib/supabase/server';
import { ContaPage } from '@/presentation/components/conta/ContaPage';

export default async function ContaRoute() {
  const user = await getAuthUser();
  if (!user) redirect('/login');

  return <ContaPage nome={user.user_metadata?.nome ?? 'Usuário'} email={user.email ?? ''} />;
}
