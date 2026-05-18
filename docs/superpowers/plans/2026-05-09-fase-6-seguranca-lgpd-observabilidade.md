# Fase 6 — Segurança, LGPD e Observabilidade — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Adicionar segurança HTTP, conformidade LGPD e observabilidade (Sentry, Analytics, Posthog) antes de usuários reais externos.

**Architecture:** 9 tarefas independentes organizadas em 3 waves paralelas. Wave 1 não tem dependências externas. Wave 2 constrói sobre Wave 1 (cookie consent). Wave 3 ativa Posthog após consent estar disponível. Sentry e Posthog ficam totalmente scaffolded — necessitam de env vars para ativar em produção.

**Tech Stack:** Next.js 15 App Router, TypeScript, Prisma, Supabase Auth, `@sentry/nextjs`, `@vercel/analytics`, `@vercel/speed-insights`, `posthog-js`, `@upstash/ratelimit` + `@upstash/redis`

---

## Nota: Infra Tasks Já Concluídas

Deliverables 1–3 do ROADMAP.md (Fase 6) **já estão implementados**:

- Índices Prisma: `@@index([userId])` existe em Material, Procedimento, Snapshot; `@@index([userId, especialidadeId])` em Procedimento ✅
- `getLastUpdateInfo`: já retornado como `lastUpdate` dentro de `getDashboardStats` ✅
- `getPercConfig`: já extraído em `src/application/usecases/calcularCustoFixoPorMinuto.ts`, importado por ambos `procedimentoActions.ts` e `dashboardActions.ts` ✅

---

## File Map

**Criar:**

- `src/lib/consent.ts` — helpers localStorage para cookie consent
- `src/presentation/components/CookieBanner.tsx` — banner LGPD cookie consent
- `src/application/usecases/contaActions.ts` — server action deleteAccount
- `src/app/(dashboard)/conta/page.tsx` — server component da página /conta
- `src/presentation/components/conta/ContaPage.tsx` — client component com UI
- `src/presentation/components/PosthogProvider.tsx` — provider Posthog com consent gate
- `src/lib/ratelimit.ts` — wrapper Upstash ratelimit com fallback
- `sentry.client.config.ts` — Sentry browser config
- `sentry.server.config.ts` — Sentry Node config
- `sentry.edge.config.ts` — Sentry Edge config
- `src/instrumentation.ts` — Next.js instrumentation hook para Sentry

**Modificar:**

- `next.config.ts` — security headers + Sentry withSentryConfig
- `src/app/layout.tsx` — Analytics, SpeedInsights, PosthogProvider, CookieBanner
- `src/middleware.ts` — rate limiting + adicionar /conta às rotas protegidas
- `src/presentation/components/layout/DashboardLayout.tsx` — navItem /conta
- `prisma/schema.prisma` — comentários documentando campos PII

---

## Wave 1 — Sem dependências externas (executar em paralelo)

### Task 1: HTTP Security Headers

**Files:**

- Modify: `next.config.ts`

- [ ] **Step 1.1: Adicionar headers de segurança**

```typescript
// next.config.ts
import type { NextConfig } from 'next';

const ContentSecurityPolicy = `
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval' https://app.posthog.com;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  font-src 'self' data: https://fonts.gstatic.com;
  img-src 'self' data: blob: https:;
  connect-src 'self' https://*.supabase.co wss://*.supabase.co https://app.posthog.com https://*.ingest.sentry.io;
  frame-ancestors 'none';
  base-uri 'self';
  form-action 'self';
`;

const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: ContentSecurityPolicy.replace(/\n/g, ' ')
      .replace(/\s{2,}/g, ' ')
      .trim(),
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()',
  },
];

const nextConfig: NextConfig = {
  serverExternalPackages: ['@react-pdf/renderer'],
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
```

- [ ] **Step 1.2: Verificar typecheck**

```bash
rtk npm run typecheck
```

Esperado: zero erros.

- [ ] **Step 1.3: Commit**

```bash
git add next.config.ts
git commit -m "feat(security): HTTP security headers — CSP, HSTS, X-Frame-Options, Referrer-Policy, Permissions-Policy"
```

---

### Task 2: Vercel Analytics e Speed Insights

**Files:**

- Modify: `src/app/layout.tsx`

- [ ] **Step 2.1: Instalar pacotes**

```bash
npm install @vercel/analytics @vercel/speed-insights
```

- [ ] **Step 2.2: Adicionar ao layout**

```typescript
// src/app/layout.tsx
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/presentation/components/ui/toaster';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'OdontoValor',
  description: 'SaaS de precificação para consultórios odontológicos',
  icons: {
    icon: '/icon.png',
    apple: '/apple-icon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
        <Toaster />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
```

- [ ] **Step 2.3: Typecheck**

```bash
rtk npm run typecheck
```

Esperado: zero erros.

- [ ] **Step 2.4: Commit**

```bash
git add src/app/layout.tsx package.json package-lock.json
git commit -m "feat(observability): Vercel Analytics e Speed Insights"
```

---

### Task 3: Documentar Campos PII no Schema Prisma

**Files:**

- Modify: `prisma/schema.prisma`

- [ ] **Step 3.1: Adicionar comentários de retenção de dados pessoais**

Localizar o modelo `User` em `prisma/schema.prisma` e substituir por:

```prisma
// Dados pessoais (LGPD): nome e email são dados pessoais identificáveis.
// Retenção: mantidos enquanto a conta estiver ativa.
// Após exclusão da conta (direito ao esquecimento), todos os registros abaixo
// são deletados em cascata via deleteAccount() em contaActions.ts.
// Dados anonimizados não são mantidos.
model User {
  id                   String          @id
  // Dado pessoal: nome do titular
  nome                 String
  // Dado pessoal: endereço de e-mail (identificador único)
  email                String          @unique
  onboardingCompleted  Boolean         @default(false)
  perfilConsultorio    String?
  // Registro de criação — usado para calcular tempo de retenção
  createdAt            DateTime        @default(now())
  updatedAt            DateTime        @updatedAt
  custoFixoConfig      CustoFixoConfig?
  materiais            Material[]
  procedimentos        Procedimento[]
  snapshots            Snapshot[]
}
```

- [ ] **Step 3.2: Commit (sem migration necessária — só comentários)**

```bash
git add prisma/schema.prisma
git commit -m "chore(lgpd): documentar campos PII e política de retenção no schema Prisma"
```

---

### Task 4: Cookie Consent Banner

**Files:**

- Create: `src/lib/consent.ts`
- Create: `src/presentation/components/CookieBanner.tsx`

- [ ] **Step 4.1: Criar helper de consent**

```typescript
// src/lib/consent.ts
export const CONSENT_KEY = 'odontovalor_cookie_consent';
export type ConsentStatus = 'accepted' | 'rejected' | null;

export function getConsent(): ConsentStatus {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(CONSENT_KEY) as ConsentStatus;
}

export function setConsent(status: 'accepted' | 'rejected'): void {
  localStorage.setItem(CONSENT_KEY, status);
  // Dispatch event so providers can react without polling
  window.dispatchEvent(new CustomEvent('consentchange', { detail: status }));
}
```

- [ ] **Step 4.2: Criar CookieBanner component**

```typescript
// src/presentation/components/CookieBanner.tsx
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
          Usamos cookies de terceiros (Posthog) para entender como você usa o sistema e melhorar
          sua experiência. Cookies essenciais sempre estão ativos. Veja nossa{' '}
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
```

- [ ] **Step 4.3: Adicionar CookieBanner ao layout**

Em `src/app/layout.tsx`, importar e adicionar antes do fechamento do `<body>`:

```typescript
import { CookieBanner } from '@/presentation/components/CookieBanner';
// ...dentro do <body>:
<CookieBanner />
```

O layout completo após Tasks 2 e 4:

```typescript
// src/app/layout.tsx
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/presentation/components/ui/toaster';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { CookieBanner } from '@/presentation/components/CookieBanner';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'OdontoValor',
  description: 'SaaS de precificação para consultórios odontológicos',
  icons: {
    icon: '/icon.png',
    apple: '/apple-icon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
        <Toaster />
        <CookieBanner />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
```

- [ ] **Step 4.4: Typecheck**

```bash
rtk npm run typecheck
```

Esperado: zero erros.

- [ ] **Step 4.5: Commit**

```bash
git add src/lib/consent.ts src/presentation/components/CookieBanner.tsx src/app/layout.tsx
git commit -m "feat(lgpd): cookie consent banner com persistência em localStorage"
```

---

## Wave 2 — Paralelas, sem dependências entre si (Wave 1 recomendada primeiro)

### Task 5: Exclusão de Conta e Dados (LGPD)

**Files:**

- Create: `src/application/usecases/contaActions.ts`
- Create: `src/app/(dashboard)/conta/page.tsx`
- Create: `src/presentation/components/conta/ContaPage.tsx`
- Modify: `src/middleware.ts` (adicionar /conta à proteção)
- Modify: `src/presentation/components/layout/DashboardLayout.tsx` (nav item)

- [ ] **Step 5.1: Server action deleteAccount**

```typescript
// src/application/usecases/contaActions.ts
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

  // Cascade: User → Material, Procedimento, Snapshot, CustoFixoConfig → CustoFixoItem
  // CustoFixoConfig.onDelete = Cascade, so deleting User handles everything.
  await prisma.user.delete({ where: { id: userId } });

  // Remove from Supabase Auth using admin client (SUPABASE_SECRET_KEY)
  const admin = createSupabaseAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!
  );
  const { error } = await admin.auth.admin.deleteUser(userId);
  if (error) {
    // User data is already gone from DB — log but don't fail silently
    console.error('[deleteAccount] Supabase admin deleteUser error:', error.message);
  }

  redirect('/login?message=conta-excluida');
}
```

- [ ] **Step 5.2: Client component ContaPage**

Criar diretório: `src/presentation/components/conta/`

```typescript
// src/presentation/components/conta/ContaPage.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/presentation/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/presentation/components/ui/alert-dialog';
import { deleteAccount } from '@/application/usecases/contaActions';
import { Trash2 } from 'lucide-react';

interface ContaPageProps {
  nome: string;
  email: string;
}

export function ContaPage({ nome, email }: ContaPageProps) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    setDeleting(true);
    setError(null);
    const result = await deleteAccount();
    if (result?.errors) {
      setError(result.errors.general?.[0] ?? 'Erro ao excluir conta.');
      setDeleting(false);
    }
    // On success, deleteAccount redirects — no state reset needed
  }

  return (
    <div className="max-w-lg space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Minha Conta</h1>
        <p className="text-muted-foreground text-sm mt-1">Gerencie suas informações pessoais</p>
      </div>

      {/* Info */}
      <div className="rounded-lg border p-4 space-y-3">
        <h2 className="font-semibold text-sm">Informações da conta</h2>
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Nome</p>
          <p className="text-sm font-medium">{nome}</p>
        </div>
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">E-mail</p>
          <p className="text-sm font-medium">{email}</p>
        </div>
      </div>

      {/* Danger zone */}
      <div className="rounded-lg border border-destructive/30 p-4 space-y-3">
        <h2 className="font-semibold text-sm text-destructive">Zona de perigo</h2>
        <p className="text-sm text-muted-foreground">
          Excluir sua conta remove permanentemente todos os seus dados: procedimentos, materiais,
          configurações e registros. Esta ação não pode ser desfeita.
        </p>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm" className="gap-2">
              <Trash2 className="h-4 w-4" />
              Excluir minha conta
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta ação é irreversível. Todos os seus procedimentos, materiais, configurações e
                registros serão excluídos permanentemente. Você não poderá recuperar esses dados.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={deleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {deleting ? 'Excluindo...' : 'Excluir conta'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
```

- [ ] **Step 5.3: Server page /conta**

```typescript
// src/app/(dashboard)/conta/page.tsx
import { redirect } from 'next/navigation';
import { getAuthUser } from '@/lib/supabase/server';
import { ContaPage } from '@/presentation/components/conta/ContaPage';

export default async function ContaRoute() {
  const user = await getAuthUser();
  if (!user) redirect('/login');

  return (
    <ContaPage
      nome={user.user_metadata?.nome ?? 'Usuário'}
      email={user.email ?? ''}
    />
  );
}
```

- [ ] **Step 5.4: Adicionar /conta às rotas protegidas no middleware**

Em `src/middleware.ts`, adicionar `/conta` ao bloco `isProtected`:

```typescript
const isProtected =
  request.nextUrl.pathname.startsWith('/dashboard') ||
  request.nextUrl.pathname.startsWith('/custos-fixos') ||
  request.nextUrl.pathname.startsWith('/materiais') ||
  request.nextUrl.pathname.startsWith('/procedimentos') ||
  request.nextUrl.pathname.startsWith('/comparativo-vrpo') ||
  request.nextUrl.pathname.startsWith('/historico') ||
  request.nextUrl.pathname.startsWith('/exportar') ||
  request.nextUrl.pathname.startsWith('/primeiros-passos') ||
  request.nextUrl.pathname.startsWith('/conta') ||
  request.nextUrl.pathname.startsWith('/simulador');
```

Nota: `/simulador` também estava ausente da lista — incluir.

- [ ] **Step 5.5: Adicionar navItem /conta no DashboardLayout**

Em `src/presentation/components/layout/DashboardLayout.tsx`, importar `User` de lucide-react e adicionar item:

```typescript
import {
  // ...existing imports...
  User,
} from 'lucide-react';

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Como Funciona', href: '/primeiros-passos', icon: BookOpen },
  { label: 'Meus Gastos', href: '/custos-fixos', icon: DollarSign },
  { label: 'Materiais', href: '/materiais', icon: Package },
  { label: 'Procedimentos', href: '/procedimentos', icon: ClipboardList },
  { label: 'Referência de Convênios', href: '/comparativo-vrpo', icon: BarChart2 },
  { label: 'Simular Cenários', href: '/simulador', icon: Sliders },
  { label: 'Meus Registros', href: '/historico', icon: Clock },
  { label: 'Baixar Tabela de Preços', href: '/exportar', icon: Download },
  { label: 'Minha Conta', href: '/conta', icon: User },
];

// Also add to mobileMoreItems:
const mobileMoreItems = [
  // ...existing items...
  { label: 'Minha Conta', href: '/conta', icon: User },
];
```

- [ ] **Step 5.6: Typecheck**

```bash
rtk npm run typecheck
```

Esperado: zero erros.

- [ ] **Step 5.7: Commit**

```bash
git add src/application/usecases/contaActions.ts \
        src/app/(dashboard)/conta/page.tsx \
        src/presentation/components/conta/ContaPage.tsx \
        src/middleware.ts \
        src/presentation/components/layout/DashboardLayout.tsx
git commit -m "feat(lgpd): exclusão de conta com cascade — /conta page + deleteAccount action"
```

---

### Task 6: Setup Sentry

**Files:**

- Create: `sentry.client.config.ts`
- Create: `sentry.server.config.ts`
- Create: `sentry.edge.config.ts`
- Create: `src/instrumentation.ts`
- Modify: `next.config.ts`

**Nota:** Sentry só captura eventos em produção quando `SENTRY_DSN` está configurado. Sem a env var, o SDK inicializa silenciosamente sem erro.

- [ ] **Step 6.1: Instalar Sentry**

```bash
npm install @sentry/nextjs
```

- [ ] **Step 6.2: sentry.client.config.ts**

```typescript
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  debug: false,
  // Não capturar PII (email, nome) no contexto de usuário
  beforeSend(event) {
    if (event.user) {
      delete event.user.email;
      delete event.user.username;
    }
    return event;
  },
});
```

- [ ] **Step 6.3: sentry.server.config.ts**

```typescript
// sentry.server.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  debug: false,
  beforeSend(event) {
    if (event.user) {
      delete event.user.email;
      delete event.user.username;
    }
    return event;
  },
});
```

- [ ] **Step 6.4: sentry.edge.config.ts**

```typescript
// sentry.edge.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0,
  debug: false,
});
```

- [ ] **Step 6.5: src/instrumentation.ts**

```typescript
// src/instrumentation.ts
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('../sentry.server.config');
  }
  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('../sentry.edge.config');
  }
}
```

- [ ] **Step 6.6: Atualizar next.config.ts com withSentryConfig**

```typescript
// next.config.ts
import type { NextConfig } from 'next';
import { withSentryConfig } from '@sentry/nextjs';

const ContentSecurityPolicy = `
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval' https://app.posthog.com;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  font-src 'self' data: https://fonts.gstatic.com;
  img-src 'self' data: blob: https:;
  connect-src 'self' https://*.supabase.co wss://*.supabase.co https://app.posthog.com https://*.ingest.sentry.io;
  frame-ancestors 'none';
  base-uri 'self';
  form-action 'self';
`;

const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: ContentSecurityPolicy.replace(/\n/g, ' ')
      .replace(/\s{2,}/g, ' ')
      .trim(),
  },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
];

const nextConfig: NextConfig = {
  serverExternalPackages: ['@react-pdf/renderer'],
  async headers() {
    return [{ source: '/(.*)', headers: securityHeaders }];
  },
};

export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  silent: true,
  widenClientFileUpload: true,
  hideSourceMaps: true,
  disableLogger: true,
  automaticVercelMonitors: false,
});
```

- [ ] **Step 6.7: Adicionar env vars ao .env.example**

```bash
# .env.example — adicionar estas linhas:
# Sentry (opcional — sem estas vars, Sentry inicializa silenciosamente sem capturar)
# NEXT_PUBLIC_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
# SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
# SENTRY_ORG=sua-org
# SENTRY_PROJECT=odonto-valor
```

- [ ] **Step 6.8: Typecheck**

```bash
rtk npm run typecheck
```

Esperado: zero erros.

- [ ] **Step 6.9: Commit**

```bash
git add sentry.client.config.ts sentry.server.config.ts sentry.edge.config.ts \
        src/instrumentation.ts next.config.ts package.json package-lock.json
git commit -m "feat(observability): Sentry setup com withSentryConfig — graceful fallback sem DSN"
```

---

### Task 7: Rate Limiting nos API Routes de Exportação

**Files:**

- Create: `src/lib/ratelimit.ts`
- Modify: `src/app/api/export/pdf/route.ts`
- Modify: `src/app/api/export/excel/route.ts`
- Modify: `src/app/api/export/pdf-credenciamento/route.ts`

**Nota:** Rate limiting via Upstash Redis. Sem `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN`, o wrapper retorna `{ success: true }` (no-op). Os API keys são opcionais para deploy — documentados em `.env.example`.

- [ ] **Step 7.1: Instalar pacotes**

```bash
npm install @upstash/ratelimit @upstash/redis
```

- [ ] **Step 7.2: Criar wrapper ratelimit**

```typescript
// src/lib/ratelimit.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Retorna null se env vars não configuradas (graceful fallback)
function createRatelimiter() {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return null;
  }
  return new Ratelimit({
    redis: Redis.fromEnv(),
    // 10 exports por minuto por IP
    limiter: Ratelimit.slidingWindow(10, '1 m'),
    analytics: false,
  });
}

const ratelimiter = createRatelimiter();

export async function checkRateLimit(
  identifier: string
): Promise<{ success: boolean; reset?: number }> {
  if (!ratelimiter) return { success: true };
  const result = await ratelimiter.limit(identifier);
  return { success: result.success, reset: result.reset };
}
```

- [ ] **Step 7.3: Aplicar rate limiting nos route handlers de exportação**

Ler `src/app/api/export/pdf/route.ts` e adicionar no início do handler:

```typescript
import { checkRateLimit } from '@/lib/ratelimit';
import { headers } from 'next/headers';

export async function GET(request: Request) {
  const headersList = await headers();
  const ip = headersList.get('x-forwarded-for') ?? 'anonymous';
  const { success, reset } = await checkRateLimit(`export:${ip}`);
  if (!success) {
    return new Response('Rate limit atingido. Tente novamente em alguns instantes.', {
      status: 429,
      headers: { 'Retry-After': String(Math.ceil(((reset ?? Date.now()) - Date.now()) / 1000)) },
    });
  }
  // ... resto do handler existente
}
```

Aplicar o mesmo padrão em `excel/route.ts` e `pdf-credenciamento/route.ts`.

- [ ] **Step 7.4: Adicionar vars ao .env.example**

```
# Upstash Redis — Rate limiting (opcional)
# UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
# UPSTASH_REDIS_REST_TOKEN=xxx
```

- [ ] **Step 7.5: Typecheck**

```bash
rtk npm run typecheck
```

Esperado: zero erros.

- [ ] **Step 7.6: Commit**

```bash
git add src/lib/ratelimit.ts \
        src/app/api/export/pdf/route.ts \
        src/app/api/export/excel/route.ts \
        src/app/api/export/pdf-credenciamento/route.ts \
        package.json package-lock.json
git commit -m "feat(security): rate limiting nos endpoints de exportação via Upstash (fallback no-op sem vars)"
```

---

## Wave 3 — Depende de Task 4 (cookie consent)

### Task 8: Setup Posthog com Cookie Consent

**Files:**

- Create: `src/presentation/components/PosthogProvider.tsx`
- Modify: `src/app/layout.tsx`

**Nota:** Posthog só inicializa se o usuário aceitou cookies. Sem `NEXT_PUBLIC_POSTHOG_KEY`, o provider é silencioso. Eventos instrumentados: procedimento criado, custo salvo, PDF exportado, simulador usado, snapshot gerado.

- [ ] **Step 8.1: Instalar posthog-js**

```bash
npm install posthog-js
```

- [ ] **Step 8.2: Criar PosthogProvider**

```typescript
// src/presentation/components/PosthogProvider.tsx
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

// Função utilitária para capturar eventos com consent check
export function captureEvent(event: string, properties?: Record<string, unknown>) {
  if (!POSTHOG_KEY) return;
  if (getConsent() !== 'accepted') return;
  posthog.capture(event, properties);
}
```

- [ ] **Step 8.3: Adicionar PosthogProvider ao layout**

```typescript
// src/app/layout.tsx — substituição completa
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/presentation/components/ui/toaster';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { CookieBanner } from '@/presentation/components/CookieBanner';
import { PosthogProvider } from '@/presentation/components/PosthogProvider';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'OdontoValor',
  description: 'SaaS de precificação para consultórios odontológicos',
  icons: {
    icon: '/icon.png',
    apple: '/apple-icon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <PosthogProvider>
          {children}
          <Toaster />
          <CookieBanner />
          <Analytics />
          <SpeedInsights />
        </PosthogProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 8.4: Instrumentar eventos-chave**

Adicionar `captureEvent` nos pontos relevantes:

**Snapshot criado** — em `src/application/usecases/GerarSnapshot.ts`, após o `prisma.snapshot.create`, chamar `captureEvent` não funciona em server actions (Posthog é client-only). Solução: exportar evento no client component que disparou a ação (ex: HistoricoPage após `gerarSnapshot()` retornar sucesso).

**Exports** — em `src/app/api/export/pdf/route.ts` e similares, adicionar header `x-posthog-event: pdf_exportado` na resposta e capturar no client após download completar.

**Abordagem simplificada (sem mudar cada server action):** criar hook `usePosthogEvents` em client components:

```typescript
// src/presentation/hooks/usePosthogEvents.ts
'use client';
import { captureEvent } from '@/presentation/components/PosthogProvider';

export function usePosthogEvents() {
  return {
    procedimentoCriado: () => captureEvent('procedimento_criado'),
    custoSalvo: () => captureEvent('custo_salvo'),
    pdfExportado: (tipo: 'tabela' | 'credenciamento') => captureEvent('pdf_exportado', { tipo }),
    simuladorUsado: () => captureEvent('simulador_usado'),
    snapshotGerado: () => captureEvent('snapshot_gerado'),
  };
}
```

Chamar os eventos apropriados nos respectivos client components após ações bem-sucedidas. Exemplo em `CustosFixosPage` após save:

```typescript
const events = usePosthogEvents();
// após ação bem-sucedida:
events.custoSalvo();
```

- [ ] **Step 8.5: Adicionar vars ao .env.example**

```
# Posthog (opcional — sem estas vars, eventos não são capturados)
# NEXT_PUBLIC_POSTHOG_KEY=phc_xxx
# NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

- [ ] **Step 8.6: Typecheck**

```bash
rtk npm run typecheck
```

Esperado: zero erros.

- [ ] **Step 8.7: Commit**

```bash
git add src/presentation/components/PosthogProvider.tsx \
        src/presentation/hooks/usePosthogEvents.ts \
        src/app/layout.tsx \
        package.json package-lock.json
git commit -m "feat(observability): Posthog com consent gate — só inicializa após aceite de cookies"
```

---

## Auditoria de Segurança (pode rodar em paralelo com qualquer wave)

### Task 9: IDOR Audit + Secret Key Audit

**Files:**

- Create: `docs/security/idor-audit.md` (relatório interno, não commitado se sensível)

- [ ] **Step 9.1: Verificar SUPABASE_SECRET_KEY**

```bash
# Confirmar zero referências em código client
grep -rn "SUPABASE_SECRET_KEY\|supabase_secret" src/ --include="*.ts" --include="*.tsx"
grep -rn "NEXT_PUBLIC_" src/ --include="*.ts" --include="*.tsx" | grep -i "secret"
```

Esperado: zero resultados (ou apenas em contaActions.ts onde é legítimo — server-only).

- [ ] **Step 9.2: Verificar padrão userId em todas as server actions**

```bash
grep -n "findFirst\|findUnique\|update\|delete" src/application/usecases/*.ts | grep -v "userId"
```

Qualquer resultado que acesse o banco sem `userId` no `where` é um IDOR potencial. Revisar manualmente cada ocorrência.

Resultados esperados OK:

- `VRPOReferencia.findMany` — dados globais, sem userId necessário ✅
- `Especialidade.findMany` — dados globais ✅
- `CustoFixoConfig.findUnique({ where: { userId } })` — correto ✅
- `prisma.snapshot.findFirst({ where: { id, userId } })` — correto ✅

- [ ] **Step 9.3: Verificar route handlers**

```bash
grep -n "getAuthUserId\|userId\|session" src/app/api/**/*.ts
```

Cada route handler deve verificar autenticação antes de acessar dados.

- [ ] **Step 9.4: Commit do relatório (se criado)**

```bash
git add docs/security/idor-audit.md
git commit -m "chore(security): relatório de auditoria IDOR — todos os acessos verificados"
```

---

## Critérios de Done (Fase 6)

- [ ] `securityheaders.com` retorna nota ≥ B com a URL do preview Vercel
- [ ] Sentry DSN configurado no Vercel → erro de teste capturado no dashboard Sentry
- [ ] Vercel Analytics visível no dashboard do projeto após deploy
- [ ] Speed Insights ativo (Core Web Vitals aparecendo no Vercel)
- [ ] Posthog DSN configurado → sessão de usuário de teste registrada + eventos de consent
- [ ] `/conta` acessível: exibe nome/email, modal de exclusão funcional
- [ ] Exclusão de conta remove todos os dados em cascata (verificar no banco)
- [ ] Cookie consent banner aparece em primeira visita; preferência persiste após reload
- [ ] Nenhuma referência a `SUPABASE_SECRET_KEY` em código client
- [ ] Rate limiting retorna 429 após 10 requests/min nos endpoints de exportação (com Upstash)

---

## Env Vars a Configurar no Vercel (pós-implementação)

| Var                        | Obrigatória                    | Onde obter                       |
| -------------------------- | ------------------------------ | -------------------------------- |
| `NEXT_PUBLIC_SENTRY_DSN`   | Não (graceful fallback)        | Sentry dashboard → Project → DSN |
| `SENTRY_DSN`               | Não                            | idem                             |
| `SENTRY_ORG`               | Não                            | Sentry org slug                  |
| `SENTRY_PROJECT`           | Não                            | Sentry project slug              |
| `NEXT_PUBLIC_POSTHOG_KEY`  | Não (graceful fallback)        | Posthog → Project Settings       |
| `NEXT_PUBLIC_POSTHOG_HOST` | Não (default: app.posthog.com) | idem                             |
| `UPSTASH_REDIS_REST_URL`   | Não (sem rate limiting)        | Upstash console                  |
| `UPSTASH_REDIS_REST_TOKEN` | Não                            | idem                             |

---

## Paralelização

```
Wave 1 (paralelo — sem deps):
├── Task 1: Security headers
├── Task 2: Vercel Analytics + Speed Insights
├── Task 3: Schema PII docs
└── Task 4: Cookie consent banner

Wave 2 (paralelo — independentes entre si):
├── Task 5: Account deletion + /conta
├── Task 6: Sentry
└── Task 7: Rate limiting

Wave 3 (após Task 4):
└── Task 8: Posthog + consent gate

Qualquer wave:
└── Task 9: IDOR + secret key audit
```

**Tempo estimado:** ~4h com paralelização vs ~10h sequencial.
