'use client';

import { captureEvent } from '@/presentation/components/PosthogProvider';

export function usePosthogEvents() {
  return {
    procedimentoCriado: () => captureEvent('procedimento_criado'),
    custoSalvo: () => captureEvent('custo_salvo'),
    pdfExportado: (tipo: 'tabela' | 'credenciamento') => captureEvent('pdf_exportado', { tipo }),
    simuladorUsado: () => captureEvent('simulador_usado'),
    snapshotGerado: () => captureEvent('snapshot_gerado'),
    featureInterestRegistered: (feature: string) =>
      captureEvent('feature_interest_registered', { feature }),
  };
}
