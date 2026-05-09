'use client';

import posthog from 'posthog-js';
import { PostHogProvider } from 'posthog-js/react';
import { useEffect, useState } from 'react';
import { getConsent, type ConsentStatus } from '@/lib/consent';

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY ?? '';
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://app.posthog.com';

function useConsent() {
  const [consent, setConsent] = useState<ConsentStatus | 'loading'>('loading');

  useEffect(() => {
    setConsent(getConsent());
    function handler(e: Event) {
      setConsent((e as CustomEvent<ConsentStatus>).detail);
    }
    window.addEventListener('consentchange', handler);
    return () => window.removeEventListener('consentchange', handler);
  }, []);

  return consent;
}

export function PosthogProvider({ children }: { children: React.ReactNode }) {
  const consent = useConsent();

  useEffect(() => {
    if (!POSTHOG_KEY) return;
    if (consent === 'accepted') {
      if (!posthog.__loaded) {
        posthog.init(POSTHOG_KEY, {
          api_host: POSTHOG_HOST,
          person_profiles: 'identified_only',
          capture_pageview: true,
          capture_pageleave: true,
        });
      } else {
        posthog.opt_in_capturing();
      }
    } else if (consent === 'rejected') {
      posthog.opt_out_capturing();
    }
  }, [consent]);

  if (!POSTHOG_KEY) return <>{children}</>;
  return <PostHogProvider client={posthog}>{children}</PostHogProvider>;
}

export function captureEvent(event: string, properties?: Record<string, unknown>) {
  if (!POSTHOG_KEY) return;
  if (getConsent() !== 'accepted') return;
  posthog.capture(event, properties);
}
