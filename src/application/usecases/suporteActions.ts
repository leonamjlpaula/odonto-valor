'use server';

import { z } from 'zod';
import { Resend } from 'resend';
import { getAuthUser } from '@/lib/supabase/server';

const resend = new Resend(process.env.RESEND_API_KEY);

const categoriaLabels: Record<string, string> = {
  problema: 'Problema técnico',
  duvida: 'Dúvida',
  sugestao: 'Sugestão',
  funcionalidade: 'Solicitar nova funcionalidade',
};

const schema = z.object({
  nome: z.string().min(1),
  email: z.string().email(),
  categoria: z.enum(['problema', 'duvida', 'sugestao', 'funcionalidade']),
  mensagem: z.string().min(10, 'Mensagem deve ter no mínimo 10 caracteres'),
});

export type SuporteState = {
  errors?: { mensagem?: string[]; general?: string[] };
  success?: boolean;
};

export async function sendSupportEmail(
  _prev: SuporteState,
  formData: FormData
): Promise<SuporteState> {
  const user = await getAuthUser();
  if (!user) return { errors: { general: ['Não autenticado'] } };

  const result = schema.safeParse({
    nome: formData.get('nome'),
    email: formData.get('email'),
    categoria: formData.get('categoria'),
    mensagem: formData.get('mensagem'),
  });

  if (!result.success) {
    return { errors: result.error.flatten().fieldErrors as SuporteState['errors'] };
  }

  const { nome, email, categoria, mensagem } = result.data;
  const categoriaLabel = categoriaLabels[categoria];

  const { error } = await resend.emails.send({
    from: 'OdontoValor <onboarding@resend.dev>',
    to: process.env.SUPPORT_EMAIL ?? 'leonamjlpaula@gmail.com',
    replyTo: email,
    subject: `[Suporte] ${categoriaLabel} — ${nome}`,
    text: `De: ${nome} <${email}>\nCategoria: ${categoriaLabel}\n\n${mensagem}`,
  });

  if (error) {
    return { errors: { general: ['Erro ao enviar mensagem. Tente novamente.'] } };
  }

  return { success: true };
}
