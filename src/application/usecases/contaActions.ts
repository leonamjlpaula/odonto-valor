'use server';

import { createClient as createSupabaseAdmin } from '@supabase/supabase-js';
import { prisma } from '@/lib/db';
import { getAuthUserId } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function deleteAccount(): Promise<{ errors?: { general: string[] } }> {
  const userId = await getAuthUserId();
  if (!userId) {
    return { errors: { general: ['Não autenticado.'] } };
  }

  const admin = createSupabaseAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!
  );

  // Delete Supabase Auth user first — if this fails, DB data is still intact (safe to retry)
  const { error } = await admin.auth.admin.deleteUser(userId);
  if (error) {
    console.error('[deleteAccount] Supabase admin deleteUser error:', error.message);
    return { errors: { general: ['Erro ao excluir conta. Tente novamente.'] } };
  }

  // Cascade: User → Material, Procedimento, Snapshot, CustoFixoConfig → CustoFixoItem
  await prisma.user.delete({ where: { id: userId } });

  redirect('/login?message=conta-excluida');
}
