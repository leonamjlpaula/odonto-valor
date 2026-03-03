# Precifica

Ferramenta de precificação odontológica baseada na metodologia **VRPO da CNCC**. Dentistas configuram seus custos reais e o sistema calcula automaticamente o preço justo de cada procedimento — sem planilha, sem chute.

---

## O problema que resolve

A maioria dos dentistas precifica por intuição ou copia tabelas de convênio. O Precifica usa a fórmula VRPO para chegar ao preço correto a partir dos **custos reais do consultório**:

```
Preço Final = (Tempo em minutos × Custo Fixo/min) + Custo Variável
```

- **Custo Fixo/min** — calculado a partir de aluguel, salários, equipamentos e depreciação
- **Custo Variável** — soma dos materiais consumidos no procedimento
- **VRPO** — valor de referência nacional disponível para comparação

---

## Funcionalidades

| Módulo | Descrição |
|---|---|
| **Dashboard** | Visão geral com alertas de procedimentos abaixo do custo |
| **Custos Fixos** | Configure aluguel, salários, equipamentos — o sistema calcula o custo/min |
| **Materiais** | Catálogo de insumos com preços atualizáveis individualmente |
| **Procedimentos** | Lista por especialidade com preço calculado em tempo real |
| **Comparativo VRPO** | Identifica quais procedimentos estão abaixo da referência nacional |
| **Histórico** | Snapshots da configuração para comparar precificação ao longo do tempo |
| **Exportar** | Geração de tabela de preços em PDF ou Excel |
| **Primeiros Passos** | Guia educativo integrado ao sistema |

---

## Stack

- **Next.js 15** — App Router com Server Components e Server Actions
- **React 19** + **TypeScript 5** (strict)
- **PostgreSQL** + **Prisma 6**
- **NextAuth.js 4** — autenticação com Credentials + JWT
- **TailwindCSS 3** + **Radix UI** — UI acessível e responsiva
- **Zod 3** — validação de entrada nas Server Actions
- **@react-pdf/renderer** + **XLSX** — exportação de relatórios

---

## Rodando localmente

### Pré-requisitos

- Node.js 20+
- PostgreSQL rodando localmente (ou via Docker)

### Configuração

```bash
# Clone o repositório
git clone git@github.com:leonamjlpaula/precifica.git
cd precifica

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env
```

Edite o `.env`:

```env
DATABASE_URL="postgresql://usuario:senha@localhost:5432/precifica"
NEXTAUTH_SECRET="seu-secret-aqui"
NEXTAUTH_URL="http://localhost:3000"
```

### Banco de dados

```bash
# Aplica as migrations e popula dados de referência (VRPO + especialidades)
npx prisma migrate dev
npx prisma db seed
```

### Desenvolvimento

```bash
npm run dev
```

Acesse `http://localhost:3000`.

---

## Arquitetura

O projeto segue uma arquitetura em camadas inspirada em Clean Architecture:

```
┌──────────────────────────────────────────┐
│           PRESENTATION                   │
│  Componentes React (Server + Client)     │
└──────────────┬───────────────────────────┘
               │ chama Server Actions
               ↓
┌──────────────────────────────────────────┐
│           APPLICATION                    │
│  Use Cases / Server Actions + Zod        │
└──────┬───────────────────────────────────┘
       │ usa interfaces (contratos)
       ↓
┌─────────────┐      ┌───────────────────────┐
│   DOMAIN    │      │    INFRASTRUCTURE     │
│  (cálculo   │      │  Repositórios Prisma  │
│   puro)     │      │  Serviços de export   │
└─────────────┘      └───────────┬───────────┘
                                 ↓
                    ┌─────────────────────────┐
                    │  PostgreSQL via Prisma  │
                    └─────────────────────────┘
```

Documentação completa em [`ARCHITECTURE.md`](./ARCHITECTURE.md).

---

## Estrutura de pastas

```
src/
├── app/               # Rotas Next.js (App Router)
│   ├── (auth)/        # Login e cadastro (públicos)
│   └── (dashboard)/   # Área autenticada
├── application/       # Use cases e interfaces de repositório
├── domain/            # Value objects com lógica de negócio pura
├── infrastructure/    # Repositórios Prisma e serviços de export
├── presentation/      # Componentes React e hooks
└── lib/               # Auth, banco de dados e utilitários
```

---

## Licença

Uso privado.
