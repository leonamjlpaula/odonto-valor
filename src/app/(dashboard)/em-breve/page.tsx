import { redirect } from 'next/navigation';
import { getAuthUser } from '@/lib/supabase/server';
import { EmBrevePage } from '@/presentation/components/em-breve/EmBrevePage';

export default async function EmBreveRoute() {
  const user = await getAuthUser();
  if (!user) redirect('/login');

  return <EmBrevePage />;
}
