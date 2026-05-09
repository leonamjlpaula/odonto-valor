'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/presentation/components/ui/button';
import { getConsent, setConsent, type ConsentStatus } from '@/lib/consent';

export function CookieBanner() {
  const [status, setStatus] = useState<ConsentStatus | 'loading'>('loading');

  useEffect(() => {
    setStatus(getConsent());
  }, []);

  if (status !== null && status !== 'loading') return null;
  if (status === 'loading') return null;

  function handleAccept() {
    setConsent('accepted');
    setStatus('accepted');
  }

  function handleReject() {
    setConsent('rejected');
    setStatus('rejected');
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t shadow-lg p-4 md:p-6">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <p className="text-sm text-muted-foreground flex-1">
          Usamos cookies de terceiros (Posthog) para entender como você usa o sistema e melhorar sua
          experiência. Cookies essenciais sempre estão ativos. Veja nossa{' '}
          <a href="/politica-de-privacidade" className="underline hover:text-foreground">
            Política de Privacidade
          </a>
          .
        </p>
        <div className="flex gap-2 shrink-0">
          <Button variant="outline" size="sm" onClick={handleReject}>
            Recusar
          </Button>
          <Button size="sm" onClick={handleAccept}>
            Aceitar
          </Button>
        </div>
      </div>
    </div>
  );
}
