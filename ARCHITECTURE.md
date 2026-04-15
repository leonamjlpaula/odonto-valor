# Arquitetura do Precifica

## Visão Geral

O **Precifica** é uma aplicação SaaS de precificação odontológica baseada em metodologia híbrida CNCC/VRPO + gestão financeira moderna. Permite que dentistas configurem sua estrutura de custos e enxerguem a margem real de cada procedimento.

---

## Stack Tecnológica

| Camada              | Tecnologia                          |
| ------------------- | ----------------------------------- |
| Framework           | Next.js 15 (App Router)             |
| UI                  | React 19 + TailwindCSS 3 + Radix UI |
| Linguagem           | TypeScript 5 (strict)               |
| ORM                 | Prisma 6                            |
| Banco de Dados      | PostgreSQL                          |
| Autenticação        | NextAuth.js 4 (Credentials + JWT)   |
| Validação           | Zod 3                               |
| Ícones              | Lucide React                        |
| Variantes de estilo | Class Variance Authority (CVA)      |
| Export PDF          | @react-pdf/renderer                 |
| Export Excel        | XLSX                                |

---

## Estrutura de Diretórios

```
src/
├── app/                        # Rotas (Next.js App Router)
│   ├── (auth)/                 # Rotas públicas
│   │   ├── login/
│   │   └── cadastro/
│   ├── (dashboard)/            # Rotas protegidas
│   │   ├── layout.tsx
│   │   ├── dashboard/
│   │   ├── custos-fixos/
│   │   ├── materiais/
│   │   ├── procedimentos/[especialidade]/[id]/
│   │   ├── comparativo-vrpo/
│   │   ├── historico/
│   │   ├── exportar/
│   │   ├── simulador/          # [PLANEJADO] Simulador de cenários
│   │   └── primeiros-passos/
│   ├── api/
│   │   ├── auth/[...nextauth]/
│   │   └── export/{excel,pdf}/
│   └── layout.tsx
│
├── application/
│   ├── interfaces/
│   │   ├── IMaterialRepository.ts
│   │   ├── IProcedimentoRepository.ts
│   │   └── ICustoFixoRepository.ts
│   └── usecases/
│       ├── materialActions.ts
│       ├── procedimentoActions.ts
│       ├── custoFixoActions.ts
│       ├── calcularCustoFixoPorMinuto.ts
│       ├── calcularPrecoProcedimento.ts   # retorna margemLucro [EVOLUIR]
│       ├── dashboardActions.ts
│       ├── createUser.ts
│       ├── onboardingActions.ts
│       ├── snapshotActions.ts
│       ├── exportActions.ts
│       ├── comparativoActions.ts
│       └── passwordResetActions.ts
│
├── domain/
│   └── value-objects/
│       └── CustoFixoPorMinuto.ts   # Lógica de cálculo pura [EVOLUIR]
│
├── infrastructure/
│   ├── repositories/
│   │   ├── PrismaMaterialRepository.ts
│   │   ├── PrismaProcedimentoRepository.ts
│   │   └── PrismaCustoFixoRepository.ts
│   └── services/
│       ├── ExcelExportService.ts
│       └── PdfExportService.tsx    # [EVOLUIR] template de credenciamento
│
├── presentation/
│   ├── components/
│   │   ├── ui/
│   │   ├── layout/
│   │   ├── dashboard/
│   │   ├── materiais/
│   │   ├── procedimentos/
│   │   ├── custos-fixos/
│   │   ├── comparativo-vrpo/
│   │   ├── historico/
│   │   ├── exportar/
│   │   ├── simulador/          # [PLANEJADO]
│   │   └── primeiros-passos/
│   └── hooks/
│       └── use-toast.ts
│
├── lib/
│   ├── auth.ts
│   ├── db.ts
│   ├── utils.ts
│   └── vrpo-seed-data.ts       # [EVOLUIR] 200+ procedimentos, ~130 materiais
│
├── types/
│   └── next-auth.d.ts
│
└── middleware.ts
```

> **Legenda:** `[PLANEJADO]` = ainda não existe, previsto no roadmap. `[EVOLUIR]` = existe, precisa ser expandido.

---

## Camadas da Arquitetura

O projeto segue arquitetura em camadas inspirada em Clean Architecture.

```
┌──────────────────────────────────────────┐
│           PRESENTATION                   │
│  Componentes React (Server + Client)     │
│  DashboardLayout, MateriaisTable, etc.   │
└──────────────┬───────────────────────────┘
               │ chama Server Actions
               ↓
┌──────────────────────────────────────────┐
│           APPLICATION                    │
│  Use Cases / Server Actions              │
│  materialActions, procedimentoActions…   │
│  Validação com Zod                       │
└──────┬───────────────────────────────────┘
       │ usa interfaces (contratos)
       ↓
┌─────────────┐      ┌───────────────────────┐
│   DOMAIN    │      │    INFRASTRUCTURE     │
│             │      │                       │
│ CustoFixo   │      │ PrismaMaterialRepo    │
│ PorMinuto   │      │ PrismaProcedimento    │
│ (cálculo    │      │ Repo                  │
│  puro)      │      │ ExcelExportService    │
│             │      │ PdfExportService      │
└─────────────┘      └───────────┬───────────┘
                                 │
                    ┌────────────▼────────────┐
                    │       EXTERNAL          │
                    │  Prisma Client          │
                    │  PostgreSQL             │
                    └─────────────────────────┘
```

---

## Modelo de Dados (Prisma)

### Estado atual (implementado)

```
User
 ├── CustoFixoConfig (1:1)
 │    └── CustoFixoItem[] (1:N)
 ├── Material[] (1:N)
 │    └── ProcedimentoMaterial[] (N:M com Procedimento)
 ├── Procedimento[] (1:N)
 │    ├── Especialidade (N:1)
 │    └── ProcedimentoMaterial[] (N:M com Material)
 └── Snapshot[] (1:N)

VRPOReferencia          — tabela global, somente leitura
Especialidade           — categorias globais, somente leitura
PasswordResetToken      — tokens de recuperação de senha
```

### Campos planejados (roadmap Fase 1–3)

**Em `CustoFixoConfig`** — novos campos para metodologia completa:

```
numeroCadeiras      Int     @default(1)      # divisor do custo base por cadeira
percOciosidade      Float   @default(0)      # % de horas ociosas (sugerido: 20)
percImpostos        Float   @default(8)      # ISS/Simples sobre faturamento
percTaxaCartao      Float   @default(4)      # taxa média de cartão
```

**Em `ProcedimentoMaterial`** — laboratório como categoria própria:

```
custoLaboratorio    Float?  @default(0)      # custo de laboratório (prótese, faceta)
```

**Pontos de destaque (invariantes do modelo):**

- Todos os dados operacionais têm `userId` — multitenancy por coluna
- `Snapshot.dados` é `Json` — salva estado inteiro de precificação
- `Procedimento` tem `@@unique([userId, codigo])`
- `VRPOReferencia` é global e somente leitura pela aplicação
- A depreciação e a taxa de retorno usam **11 meses** por ano (CNCC), não 12

---

## Lógica de Precificação (Núcleo do Domínio)

### CustoFixoPorMinuto

```
minutosUteis = diasUteis × horasTrabalho × 60 × (1 − percOciosidade/100)
minutosUteisAnuais = minutosUteis × 11              ← 11 meses (CNCC)

custoBase = totalItens / (minutosUteis × numeroCadeiras)
depreciacao = investimento / (anosDepreciacao × minutosUteisAnuais)
remuneracao = salarioBase × (1 + encargos%) / minutosUteis
taxaRetorno = investimento × taxaRetornoPerc% / (anosRetorno × minutosUteisAnuais)

porMinuto = custoBase + depreciacao + remuneracao + taxaRetorno
```

### calcularPrecoProcedimento

```
custoVariavel = Σ (material.preco / divisor) × consumo + custoLaboratorio
custoFixoTotal = tempoMinutos × custoFixoPorMinuto
precoBreakEven = custoFixoTotal + custoVariavel

margemLucro(precoVenda) =
  (precoVenda − precoBreakEven − precoVenda × (percImpostos + percCartao) / 100)
  / precoVenda

precoMinimoParaMargem30 =
  precoBreakEven / (1 − (percImpostos + percCartao) / 100 − 0.30)
```

---

## Autenticação e Autorização

```
1. Login → Credentials provider valida email + bcrypt(senha)
2. JWT callback → adiciona userId ao token
3. Session callback → expõe userId em session.user
4. middleware.ts → withAuth() bloqueia /dashboard/* sem sessão válida
5. Páginas server-side → getServerSession() para verificação adicional
6. Server Actions → recebem userId e verificam ownership no DB
```

---

## Divisão Server / Client Components

| Tipo             | Onde                                   | Responsabilidade                          |
| ---------------- | -------------------------------------- | ----------------------------------------- |
| Server Component | `src/app/(dashboard)/*/page.tsx`       | Busca dados, verifica sessão, passa props |
| Client Component | `src/presentation/components/**/*.tsx` | Estado local, formulários, transições     |
| Server Action    | `src/application/usecases/*.ts`        | Mutações, validação, acesso ao banco      |

**Padrão de fluxo de dados:**

```
page.tsx (Server)
  └─ busca dados via Server Actions
  └─ renderiza ↓

FooPage.tsx ('use client')
  └─ recebe props do servidor
  └─ gerencia estado local (useState)
  └─ chama Server Actions em mutações (useTransition)
  └─ exibe feedback via toast
```

---

## Funcionalidades por Rota

| Funcionalidade       | Rota                                | Status                                                   |
| -------------------- | ----------------------------------- | -------------------------------------------------------- |
| Dashboard            | `/dashboard`                        | ✅ Implementado — evoluir para diagnóstico ativo         |
| Custos Fixos         | `/custos-fixos`                     | 🟡 Implementado — adicionar cadeiras/ociosidade/impostos |
| Materiais            | `/materiais`                        | ✅ Implementado                                          |
| Procedimentos        | `/procedimentos/:especialidade`     | 🟡 Implementado — adicionar coluna de margem             |
| Detalhe Procedimento | `/procedimentos/:especialidade/:id` | 🟡 Implementado — adicionar laboratório e margem         |
| Comparativo VRPO     | `/comparativo-vrpo`                 | 🟡 Implementado — refatorar framing                      |
| Histórico            | `/historico`                        | 🟡 Implementado — adicionar narrativa de diff            |
| Exportar             | `/exportar`                         | 🟡 Implementado — adicionar template credenciamento      |
| Primeiros Passos     | `/primeiros-passos`                 | 🟡 Implementado — tornar adaptativo por perfil           |
| Simulador            | `/simulador`                        | 🔴 Planejado (Roadmap Fase 5)                            |

---

## Seed de Dados

### Estado atual

- 11 especialidades
- ~65 VRPOReferencias (estimativas)
- 30 materiais padrão
- ~40 procedimentos padrão com composições estimadas

### Estado planejado (Roadmap Fase 3)

- 11 especialidades (sem mudança)
- 200+ VRPOReferencias com valores oficiais CNCC
- ~130 materiais com preços de referência do mercado nacional
- 200+ procedimentos com tempos e composições baseados na planilha VRPO original
- ~50 procedimentos com composição completa de materiais pré-configurada

---

## Padrões Recorrentes

### Server Action com validação Zod

```ts
'use server';
export async function createMaterial(userId: string, nome: string, preco: number) {
  const schema = z.object({ nome: z.string().min(1), preco: z.number().positive() });
  const result = schema.safeParse({ nome, preco });
  if (!result.success) return { errors: result.error.flatten().fieldErrors };
  return { success: true, data: material };
}
```

### Componente client com transição

```ts
'use client';
const [isPending, startTransition] = useTransition();
startTransition(async () => {
  const result = await createMaterial(userId, nome, preco);
  if (result.errors) {
    /* exibe erros */
  } else {
    toast({ title: 'Material criado' });
  }
});
```

### Repositório com interface

```ts
// Interface (application/interfaces)
interface IMaterialRepository {
  listByUserId(userId: string): Promise<Material[]>;
  updatePrice(id: string, preco: number): Promise<void>;
}

// Implementação (infrastructure/repositories)
class PrismaMaterialRepository implements IMaterialRepository {
  listByUserId(userId: string) {
    return prisma.material.findMany({ where: { userId } });
  }
}
```
