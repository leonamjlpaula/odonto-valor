# Rename OdontoValor → LucroDental Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace every occurrence of OdontoValor / odonto-valor / odontovalor with LucroDental / lucro-dental / lucrodental across all source files, config, and docs.

**Architecture:** Pure string replacement — no logic changes. Grouped by concern. localStorage key migration note included. Internal React component names updated for consistency.

**Tech Stack:** Next.js 15, TypeScript, Prisma, Supabase, Tailwind

**Naming conventions used throughout:**

- Display name: `LucroDental`
- kebab-case: `lucro-dental`
- lowercase/no-separator: `lucrodental`
- localStorage prefix: `lucrodental_`

---

### Task 1: Config & metadata

**Files:**

- Modify: `package.json:2`
- Modify: `docker-compose.yml:7`
- Modify: `.env.example:25`
- Modify: `src/app/layout.tsx:21-22`

- [ ] **Step 1: Update package.json name**

In `package.json` line 2, change:

```json
"name": "odontovalor",
```

to:

```json
"name": "lucrodental",
```

- [ ] **Step 2: Update docker-compose DB name**

In `docker-compose.yml`, change:

```yaml
POSTGRES_DB: odontovalor
```

to:

```yaml
POSTGRES_DB: lucrodental
```

- [ ] **Step 3: Update .env.example Sentry project**

In `.env.example` line 25, change:

```
# SENTRY_PROJECT=odonto-valor
```

to:

```
# SENTRY_PROJECT=lucro-dental
```

- [ ] **Step 4: Update layout metadata**

In `src/app/layout.tsx`, change:

```ts
export const metadata: Metadata = {
  title: 'OdontoValor',
  description: 'SaaS de precificação para consultórios odontológicos',
```

to:

```ts
export const metadata: Metadata = {
  title: 'LucroDental',
  description: 'SaaS de precificação para consultórios odontológicos',
```

- [ ] **Step 5: Commit**

```bash
git add package.json docker-compose.yml .env.example src/app/layout.tsx
git commit -m "chore: rename OdontoValor → LucroDental in config and metadata"
```

---

### Task 2: Auth pages — image alt text

**Files:**

- Modify: `src/app/(auth)/cadastro/page.tsx:53`
- Modify: `src/app/(auth)/login/page.tsx:141`
- Modify: `src/app/(auth)/esqueci-senha/page.tsx:58`
- Modify: `src/app/(auth)/atualizar-senha/page.tsx:63`

All four files have the same pattern: `alt="OdontoValor"` on a banner `<Image>`. Replace with `alt="LucroDental"`.

- [ ] **Step 1: Update cadastro alt text**

In `src/app/(auth)/cadastro/page.tsx`, change:

```tsx
<Image src={banner} alt="OdontoValor" className="w-full h-auto rounded-md" priority />
```

to:

```tsx
<Image src={banner} alt="LucroDental" className="w-full h-auto rounded-md" priority />
```

- [ ] **Step 2: Update login alt text**

In `src/app/(auth)/login/page.tsx`, change:

```tsx
<Image src={banner} alt="OdontoValor" className="w-full h-auto rounded-md" priority />
```

to:

```tsx
<Image src={banner} alt="LucroDental" className="w-full h-auto rounded-md" priority />
```

- [ ] **Step 3: Update esqueci-senha alt text**

In `src/app/(auth)/esqueci-senha/page.tsx`, change:

```tsx
<Image src={banner} alt="OdontoValor" className="w-full h-auto rounded-md" priority />
```

to:

```tsx
<Image src={banner} alt="LucroDental" className="w-full h-auto rounded-md" priority />
```

- [ ] **Step 4: Update atualizar-senha alt text**

In `src/app/(auth)/atualizar-senha/page.tsx`, change:

```tsx
<Image src={banner} alt="OdontoValor" className="w-full h-auto rounded-md" priority />
```

to:

```tsx
<Image src={banner} alt="LucroDental" className="w-full h-auto rounded-md" priority />
```

- [ ] **Step 5: Commit**

```bash
git add src/app/\(auth\)/
git commit -m "chore: rename OdontoValor → LucroDental in auth page image alts"
```

---

### Task 3: Export routes — filenames

**Files:**

- Modify: `src/app/api/export/excel/route.ts:97,105`
- Modify: `src/app/api/export/pdf/route.ts:96,104`

- [ ] **Step 1: Update Excel export filename**

In `src/app/api/export/excel/route.ts`, change both occurrences:

```ts
// Build filename: odontovalor-[nome-slug]-[YYYY-MM-DD].xlsx
...
const filename = `odontovalor-${nameSlug}-${dateStr}.xlsx`;
```

to:

```ts
// Build filename: lucrodental-[nome-slug]-[YYYY-MM-DD].xlsx
...
const filename = `lucrodental-${nameSlug}-${dateStr}.xlsx`;
```

- [ ] **Step 2: Update PDF export filename**

In `src/app/api/export/pdf/route.ts`, change both occurrences:

```ts
// Build filename: odontovalor-[nome-slug]-[YYYY-MM-DD].pdf
...
const filename = `odontovalor-${nameSlug}-${dateStr}.pdf`;
```

to:

```ts
// Build filename: lucrodental-[nome-slug]-[YYYY-MM-DD].pdf
...
const filename = `lucrodental-${nameSlug}-${dateStr}.pdf`;
```

- [ ] **Step 3: Commit**

```bash
git add src/app/api/export/
git commit -m "chore: rename OdontoValor → LucroDental in export filenames"
```

---

### Task 4: Infrastructure services — PDF and Excel

**Files:**

- Modify: `src/infrastructure/services/PdfExportService.tsx:52,56,97`
- Modify: `src/infrastructure/services/CredenciamentoPdfService.tsx:202,314`
- Modify: `src/infrastructure/services/ExcelExportService.ts:84`

- [ ] **Step 1: Update PdfExportService component name and title**

In `src/infrastructure/services/PdfExportService.tsx`:

Change component name (line 52):

```tsx
const OdontoValorDocument = ({ procedimentos, userName, generatedAt }: DocProps) => (
```

to:

```tsx
const LucroDentalDocument = ({ procedimentos, userName, generatedAt }: DocProps) => (
```

Change title text (line 56):

```tsx
<Text style={styles.title}>OdontoValor</Text>
```

to:

```tsx
<Text style={styles.title}>LucroDental</Text>
```

Change usage (line 97):

```tsx
<OdontoValorDocument
```

to:

```tsx
<LucroDentalDocument
```

- [ ] **Step 2: Update CredenciamentoPdfService branding text**

In `src/infrastructure/services/CredenciamentoPdfService.tsx`, change both occurrences (lines 202 and 314):

```tsx
<Text style={[s.subtitle, { fontFamily: 'Helvetica-Bold' }]}>OdontoValor</Text>
```

to:

```tsx
<Text style={[s.subtitle, { fontFamily: 'Helvetica-Bold' }]}>LucroDental</Text>
```

- [ ] **Step 3: Update ExcelExportService branding cell**

In `src/infrastructure/services/ExcelExportService.ts` line 84, change:

```ts
['Gerado por', 'OdontoValor'],
```

to:

```ts
['Gerado por', 'LucroDental'],
```

- [ ] **Step 4: Commit**

```bash
git add src/infrastructure/services/
git commit -m "chore: rename OdontoValor → LucroDental in PDF and Excel services"
```

---

### Task 5: UI components — localStorage keys and display strings

**Files:**

- Modify: `src/lib/consent.ts:1`
- Modify: `src/presentation/components/dashboard/DashboardShell.tsx:22,111`
- Modify: `src/presentation/components/layout/DashboardLayout.tsx:90,181`
- Modify: `src/presentation/components/layout/OnboardingWizard.tsx:134`
- Modify: `src/presentation/components/primeiros-passos/PrimeirosPassosPage.tsx:114,164`
- Modify: `src/presentation/components/exportar/ExportarPage.tsx:114`

> **Note on localStorage key migration:** Changing `odontovalor_cookie_consent` and `odontovalor_guia_dispensado` keys means existing users will see the cookie banner and guide banner again after the rename deploys. Acceptable for a pre-launch rename — no migration script needed.

- [ ] **Step 1: Update consent localStorage key**

In `src/lib/consent.ts` line 1, change:

```ts
export const CONSENT_KEY = 'odontovalor_cookie_consent';
```

to:

```ts
export const CONSENT_KEY = 'lucrodental_cookie_consent';
```

- [ ] **Step 2: Update DashboardShell localStorage key (2 places)**

In `src/presentation/components/dashboard/DashboardShell.tsx`:

Line 22:

```ts
const GUIA_BANNER_KEY = 'odontovalor_guia_dispensado';
```

to:

```ts
const GUIA_BANNER_KEY = 'lucrodental_guia_dispensado';
```

Line 111 (inline script string):

```ts
"(function(){try{if(!localStorage.getItem('odontovalor_guia_dispensado')){var b=document.getElementById('guia-banner-primeiros-passos');if(b)b.style.display=''}}catch(e){}})();";
```

to:

```ts
"(function(){try{if(!localStorage.getItem('lucrodental_guia_dispensado')){var b=document.getElementById('guia-banner-primeiros-passos');if(b)b.style.display=''}}catch(e){}})();";
```

- [ ] **Step 3: Update DashboardLayout alt and heading**

In `src/presentation/components/layout/DashboardLayout.tsx`:

Line 90:

```tsx
<Image src={banner} alt="Odonto Valor" className="w-full h-auto" priority />
```

to:

```tsx
<Image src={banner} alt="LucroDental" className="w-full h-auto" priority />
```

Line 181:

```tsx
<h1 className="md:hidden text-lg font-bold text-primary">OdontoValor</h1>
```

to:

```tsx
<h1 className="md:hidden text-lg font-bold text-primary">LucroDental</h1>
```

- [ ] **Step 4: Update OnboardingWizard welcome text**

In `src/presentation/components/layout/OnboardingWizard.tsx` line 134, change:

```tsx
<CardTitle className="text-lg">Bem-vindo ao OdontoValor!</CardTitle>
```

to:

```tsx
<CardTitle className="text-lg">Bem-vindo ao LucroDental!</CardTitle>
```

- [ ] **Step 5: Update PrimeirosPassosPage body text (2 places)**

In `src/presentation/components/primeiros-passos/PrimeirosPassosPage.tsx`:

Line 114:

```tsx
Configure o OdontoValor em poucos passos e descubra se cada procedimento está gerando
```

to:

```tsx
Configure o LucroDental em poucos passos e descubra se cada procedimento está gerando
```

Line 164:

```tsx
O OdontoValor calcula o custo real de cada procedimento com base em três fatores: o{' '}
```

to:

```tsx
O LucroDental calcula o custo real de cada procedimento com base em três fatores: o{' '}
```

- [ ] **Step 6: Update ExportarPage fallback filenames**

In `src/presentation/components/exportar/ExportarPage.tsx` line 114, change:

```ts
a.download = match ? match[1] : format === 'pdf' ? 'odontovalor.pdf' : 'odontovalor.xlsx';
```

to:

```ts
a.download = match ? match[1] : format === 'pdf' ? 'lucrodental.pdf' : 'lucrodental.xlsx';
```

- [ ] **Step 7: Commit**

```bash
git add src/lib/consent.ts src/presentation/components/
git commit -m "chore: rename OdontoValor → LucroDental in UI components and localStorage keys"
```

---

### Task 6: Update CLAUDE.md header

**Files:**

- Modify: `CLAUDE.md:1`

- [ ] **Step 1: Update CLAUDE.md title**

In `CLAUDE.md` line 1, change:

```md
# OdontoValor — CLAUDE.md
```

to:

```md
# LucroDental — CLAUDE.md
```

- [ ] **Step 2: Commit**

```bash
git add CLAUDE.md
git commit -m "chore: rename OdontoValor → LucroDental in CLAUDE.md"
```

---

### Task 7: Pre-PR checks

**Files:** none (validation only)

- [ ] **Step 1: Typecheck**

```bash
rtk npm run typecheck
```

Expected: zero errors.

- [ ] **Step 2: Lint**

```bash
rtk npm run lint
```

Expected: zero errors.

- [ ] **Step 3: Format check**

```bash
rtk npm run format:check
```

Expected: all files already formatted. If not, run `rtk npm run format` then re-add changed files.

- [ ] **Step 4: Verify no OdontoValor strings remain in source**

```bash
grep -rn "OdontoValor\|odonto-valor\|odontovalor\|Odonto Valor" src/ package.json docker-compose.yml .env.example CLAUDE.md --include="*.ts" --include="*.tsx" --include="*.json" --include="*.yml" --include="*.md"
```

Expected: zero results.

- [ ] **Step 5: Open PR**

```bash
gh pr create --title "chore: rename OdontoValor → LucroDental" --body "$(cat <<'EOF'
## Summary
- Replaces all occurrences of OdontoValor / odonto-valor / odontovalor with LucroDental / lucro-dental / lucrodental across source code, config, and docs
- localStorage keys updated (existing users will see cookie banner and guide banner once more after deploy — expected behavior for a rename)
- No logic changes

## Scope
- `package.json` — package name
- `docker-compose.yml` — DB name
- `.env.example` — Sentry project ref
- `src/app/layout.tsx` — page title metadata
- 4 auth pages — image alt text
- 2 export route handlers — download filenames
- 3 infrastructure services — PDF/Excel branding
- 5 UI components — display strings and localStorage keys
- `CLAUDE.md` — header

## Test plan
- [ ] `npm run typecheck` passes
- [ ] `npm run lint` passes
- [ ] No OdontoValor strings remain in source
- [ ] Auth pages render with correct alt text
- [ ] Exported PDF/Excel files download with `lucrodental-` prefix
- [ ] Cookie banner and guide banner display correctly for new sessions

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```
