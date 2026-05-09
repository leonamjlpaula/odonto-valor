export const CONSENT_KEY = 'odontovalor_cookie_consent';
export type ConsentStatus = 'accepted' | 'rejected' | null;

export function getConsent(): ConsentStatus {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(CONSENT_KEY) as ConsentStatus;
}

export function setConsent(status: 'accepted' | 'rejected'): void {
  localStorage.setItem(CONSENT_KEY, status);
  window.dispatchEvent(new CustomEvent('consentchange', { detail: status }));
}
