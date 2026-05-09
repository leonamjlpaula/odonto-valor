import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/db';
import { createDefaultDataForUser } from '@/lib/vrpo-seed-data';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const rawNext = searchParams.get('next') ?? '/dashboard';
  const next = rawNext.startsWith('/') && !rawNext.startsWith('//') ? rawNext : '/dashboard';

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      const existing = await prisma.user.findUnique({
        where: { id: data.user.id },
        select: { id: true },
      });

      if (!existing) {
        const nome =
          data.user.user_metadata?.full_name ??
          data.user.user_metadata?.name ??
          data.user.email!.split('@')[0];

        await prisma.user.create({
          data: { id: data.user.id, nome, email: data.user.email! },
        });
        await createDefaultDataForUser(data.user.id);
        return NextResponse.redirect(`${origin}/primeiros-passos`);
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(
    `${origin}/login?error=Link+inválido+ou+expirado.+Solicite+um+novo+link.`
  );
}
