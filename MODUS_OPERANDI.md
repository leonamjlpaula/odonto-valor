# Modus Operandi — Como Trabalhar com Claude neste Projeto

---

## Como recuperar contexto ao reiniciar sessões

O `CLAUDE.md` na raiz do projeto é carregado automaticamente em toda nova sessão. Ele contém o estado atual do produto, as fórmulas corretas, o que evitar, e ponteiros para os outros docs. Você não precisa fazer nada especial: basta abrir o projeto e o Claude já tem o contexto essencial.

Para sessões que continuam trabalho anterior, a mensagem de abertura ideal é direta:

> "Vamos trabalhar na Fase 1 do roadmap. Leia o ROADMAP.md e o ARCHITECTURE.md antes de começar."

Isso força o Claude a verificar o estado atual antes de escrever qualquer código, em vez de agir a partir do que lembra da última conversa.

Se a sessão anterior terminou no meio de algo, use o comando `/remember` antes de encerrar — ele salva o estado da sessão em um arquivo que fica disponível na próxima. Digite `! /remember` no prompt para acionar isso no final de qualquer sessão importante.

---

## Como executar cada fase do roadmap

O padrão que funciona melhor é **uma fase por sessão, com commit ao final**. Cada fase do `ROADMAP.md` tem um critério de "feito" explícito — use-o como checklist de encerramento.

**Abertura de sessão para uma fase:**

```
Vamos executar a Fase 1 do roadmap (Correções de Cálculo).
Leia ROADMAP.md, ARCHITECTURE.md, prisma/schema.prisma e
src/domain/value-objects/CustoFixoPorMinuto.ts antes de propor qualquer mudança.
```

**Durante a execução**, peça o typecheck depois de cada mudança estrutural:

```
Rode npm run typecheck antes de continuar.
```

**Encerramento de sessão**, após o commit:

```
Atualize o ROADMAP.md marcando a Fase 1 como concluída e atualize
o CLAUDE.md na seção "Estado atual do produto" para refletir o que mudou.
Depois rode /remember para salvar o estado da sessão.
```

---

## Como manter a documentação viva

Cada arquivo tem um papel distinto e um momento certo de atualização:

**`CLAUDE.md`** — atualiza a cada fase concluída. A seção "Estado atual do produto" e "Campos planejados" precisam refletir o que está no código agora, não o que estava no MVP. Se um campo foi criado, ele sai de "planejado" e vai para a descrição do schema. Se uma feature foi entregue, o bug ou gap correspondente some do diagnóstico.

**`ROADMAP.md`** — atualiza ao encerrar cada fase. Marque como concluída, adicione data, e anote qualquer decisão que divergiu do plano original (ex: "campo percOciosidade ficou com default 20 em vez de 0 — decisão tomada após teste com usuário").

**`ARCHITECTURE.md`** — atualiza quando o schema ou a estrutura de arquivos muda. Toda migration nova deve ter o schema refletido aqui. Arquivos novos em `src/` aparecem na árvore de diretórios.

**`PRD.md`** — atualiza raramente, apenas quando a visão do produto muda (novo perfil de usuário, feature removida do escopo, mudança de posicionamento). Não precisa refletir o estado da implementação — para isso existe o CLAUDE.md.

---

## Resumo operacional

| Momento                       | Ação                                                                                         |
| ----------------------------- | -------------------------------------------------------------------------------------------- |
| Início de sessão              | Mencione a fase que quer executar e peça para o Claude ler os docs relevantes antes de codar |
| Durante a fase                | Peça `npm run typecheck` após mudanças estruturais                                           |
| Final de fase                 | Commit → atualiza `ROADMAP.md` e `CLAUDE.md` → `/remember`                                   |
| Início de nova sessão         | Nenhuma cerimônia — o `CLAUDE.md` já contextualiza automaticamente                           |
| Dúvida sobre decisão anterior | Aponte para `references/analise-fase*.md` — o raciocínio está todo lá                        |

A coisa mais importante é o commit ao final de cada fase com a documentação atualizada. Git + CLAUDE.md atualizado é o estado durável — o resto da conversa é descartável.

---

## Camadas de persistência de contexto

O projeto tem três camadas de persistência configuradas:

**1. `CLAUDE.md` (neste repositório)** — carregado automaticamente em toda sessão. É o principal ponto de entrada.

**2. Memórias do agente** (em `~/.claude/projects/.../memory/`) — persistem entre sessões independentemente do histórico de conversa. Guardam o estado do roadmap e as fórmulas corretas para detalhes críticos que não devem se perder.

**3. `references/analise-fase*.md`** — o raciocínio completo das fases 1–5 da análise inicial, para quando precisar justificar uma decisão ou revisitar um pressuposto.
