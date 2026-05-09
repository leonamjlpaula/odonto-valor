# IDOR + Secret Key Audit — Fase 6

Data: 2026-05-09

## Resultado: APROVADO ✅

### SUPABASE_SECRET_KEY

- Única referência em código src/: `src/application/usecases/contaActions.ts:19`
- Contexto: server action `deleteAccount()` — server-only, correto ✅
- Zero referências em variáveis `NEXT_PUBLIC_` ✅

### Route Handlers

Todos os 3 handlers de exportação verificam autenticação antes de acessar dados:

| Arquivo                                          | Auth check                             |
| ------------------------------------------------ | -------------------------------------- |
| `src/app/api/export/pdf/route.ts`                | `auth.getUser()` + `if (!user) 401` ✅ |
| `src/app/api/export/excel/route.ts`              | `auth.getUser()` + `if (!user) 401` ✅ |
| `src/app/api/export/pdf-credenciamento/route.ts` | `auth.getUser()` + `if (!user) 401` ✅ |

### Server Actions — userId scope

Todas as queries verificadas por arquivo:

- `calcularCustoFixoPorMinuto.ts`: `where: { userId }` em todas as queries ✅
- `dashboardActions.ts`: `where: { userId }` em todas as queries; `VRPOReferencia`/`Especialidade` são dados globais (sem userId — correto) ✅
- `procedimentoActions.ts`: ownership verificado via `userId` no where + verificação explícita de `procedimento.userId === userId` antes de updates ✅
- `materialActions.ts`: idem ✅
- `custoFixoActions.ts`: `where: { userId }` em config; items via cascata de configId ✅
- `snapshotActions.ts`: `where: { id, userId }` em todas as queries de snapshot ✅
- `contaActions.ts`: `getAuthUserId()` antes de `deleteAccount` ✅

### Não encontrados

- Nenhum acesso a recurso sem escopo de userId
- Nenhuma variável NEXT*PUBLIC* com secret
- Nenhum IDOR potencial identificado
