import type { NextRequest } from 'next/server';
import { headers } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { checkRateLimit } from '@/lib/ratelimit';
import { prisma } from '@/lib/db';
import { calcularCustoFixoPorMinuto } from '@/application/usecases/calcularCustoFixoPorMinuto';
import { calcularPrecoProcedimento } from '@/application/usecases/calcularPrecoProcedimento';
import type { ProcedimentoWithMateriais } from '@/application/interfaces/IProcedimentoRepository';
import {
  PdfExportService,
  type ProcedimentoExport,
} from '@/infrastructure/services/PdfExportService';

export async function GET(request: NextRequest) {
  const headersList = await headers();
  const ip = headersList.get('x-forwarded-for') ?? 'anonymous';
  const { success, reset } = await checkRateLimit(`export:${ip}`);
  if (!success) {
    return new Response('Rate limit atingido. Tente novamente em alguns instantes.', {
      status: 429,
      headers: { 'Retry-After': String(Math.ceil(((reset ?? Date.now()) - Date.now()) / 1000)) },
    });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Response('Unauthorized', { status: 401 });

  const { searchParams } = request.nextUrl;
  const especialidade = searchParams.get('especialidade') ?? 'all';
  const tipo = searchParams.get('tipo') ?? 'all';

  const userId = user.id;
  const userName = user.user_metadata?.nome ?? user.email ?? 'Usuário';

  // Build dynamic where clause
  const where: { userId: string; especialidadeId?: string; isCustom?: boolean } = { userId };

  if (especialidade !== 'all') {
    const esp = await prisma.especialidade.findUnique({ where: { codigo: especialidade } });
    if (esp) {
      where.especialidadeId = esp.id;
    }
  }

  if (tipo === 'custom') {
    where.isCustom = true;
  } else if (tipo === 'standard') {
    where.isCustom = false;
  }

  // Fetch procedures and custo fixo por minuto in parallel
  const [procedimentosRaw, custoFixoPorMinuto] = await Promise.all([
    prisma.procedimento.findMany({
      where,
      include: {
        especialidade: true,
        materiais: { include: { material: true }, orderBy: { ordem: 'asc' } },
      },
      orderBy: { codigo: 'asc' },
    }),
    calcularCustoFixoPorMinuto(userId),
  ]);

  const procedimentos = procedimentosRaw as ProcedimentoWithMateriais[];

  // Batch fetch VRPO references
  const codigos = procedimentos.map((p) => p.codigo);
  const vrpoRefs = await prisma.vRPOReferencia.findMany({ where: { codigo: { in: codigos } } });
  const vrpoMap = new Map(vrpoRefs.map((v) => [v.codigo, v.valorReferencia]));

  // Build export data with calculated prices
  const procedimentosExport: ProcedimentoExport[] = procedimentos.map((p) => {
    const preco = calcularPrecoProcedimento(p, custoFixoPorMinuto);
    return {
      codigo: p.codigo,
      nome: p.nome,
      tempoMinutos: p.tempoMinutos,
      custoVariavel: preco.custoVariavel,
      precoFinal: preco.precoFinal,
      vrpoReferencia: vrpoMap.get(p.codigo) ?? null,
    };
  });

  // Generate PDF
  const generatedAt = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
  const service = new PdfExportService();
  const pdfBuffer = await service.generate(procedimentosExport, userName, generatedAt);

  // Build filename: odontovalor-[nome-slug]-[YYYY-MM-DD].pdf
  const dateStr = new Date().toISOString().split('T')[0];
  const nameSlug = userName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
  const filename = `odontovalor-${nameSlug}-${dateStr}.pdf`;

  return new Response(new Uint8Array(pdfBuffer), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}
