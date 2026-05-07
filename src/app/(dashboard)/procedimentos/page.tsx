import { redirect } from 'next/navigation';
import { getAuthUserId } from '@/lib/supabase/server';
import { getEspecialidades } from '@/lib/referenceData';
import { getEspecialidadesSelecionadas } from '@/application/usecases/procedimentoActions';
import { EspecialidadeSelectorPage } from '@/presentation/components/procedimentos/EspecialidadeSelectorPage';

export default async function ProcedimentosPage() {
  const userId = await getAuthUserId();
  if (!userId) redirect('/login');

  const [especialidades, selecionadas] = await Promise.all([
    getEspecialidades(),
    getEspecialidadesSelecionadas(userId),
  ]);

  if (selecionadas.length > 0) {
    const first = especialidades.find((e) => selecionadas.includes(e.id));
    redirect(first ? `/procedimentos/${first.codigo}` : '/procedimentos/diagnostico');
  }

  return <EspecialidadeSelectorPage userId={userId} especialidades={especialidades} />;
}
