# Análise e Evolução do Produto de Precificação Odontológica

## Contexto

Estou construindo este produto de precificação para consultórios odontológicos. Nesta pasta há um MVP já implementado (criado anteriormente via skill ralph-wiggum) e quero fazer uma análise profunda para entender o que falta para chegar num produto final completo e bem fundamentado.

## Arquivos de referência

Quero que você analise os seguintes materiais, todos na raiz do projeto ou em `references/`:

1. **`tasks/prd-precifica-saas.md`** e **`ARCHITECTURE.md`** — documentos atuais do projeto, refletem o MVP como está hoje. Use-os como ponto de partida para entender o estado atual.
2. **`CLAUDE.md`** — instruções atuais do projeto. Vou pedir para você melhorar esse arquivo ao final.
3. **`references/custos_consultorio.numbers`** — a planilha original que inspirou o MVP atual. Representa a lógica de precificação que já foi traduzida em código. references/custos_consultorio.xlsx é a mesma planilha porém convertida para xlsx pelo Numbers (mac).
4. **`references/precificacao_dentistas.xlsm`** — planilha complementar de uma live sobre precificação odontológica. Representa uma metodologia alternativa/complementar que ainda não está no produto. precificacao_dentistas.xlsx é a mesma planilha convertida para xlsx usando o Numbers.
5. **`references/live.txt`** — transcrição completa da live que acompanha a planilha acima. Aqui está o raciocínio por trás da metodologia, pressupostos, exemplos numéricos e objeções que o apresentador responde. **Este é provavelmente o arquivo mais rico conceitualmente — leia com atenção.**
6. **Código-fonte atual do MVP** — toda a implementação existente.

## O que eu quero que você faça

Execute as fases abaixo em ordem. Não pule etapas. Use a skill de **brainstorming** quando fizer sentido para explorar alternativas, especialmente na Fase 3.

### Fase 1 — Compreensão profunda

Leia, nesta ordem: `PRD.md`, `ARCHITECTURE.md`, `CLAUDE.md`, a transcrição da live, as duas planilhas, e finalmente o código-fonte. Ao ler cada planilha, mapeie explicitamente: quais são as variáveis de entrada, quais fórmulas/cálculos são aplicados, quais são as saídas, e quais pressupostos implícitos existem (ex: tipo de clínica, regime tributário, margem-alvo).

Ao ler a transcrição, extraia especificamente:
- A metodologia de precificação descrita (passo a passo)
- Variáveis consideradas e por quê
- Fórmulas ou heurísticas mencionadas
- Exemplos numéricos concretos
- Pressupostos sobre o negócio do dentista
- Edge cases, objeções e respostas
- Qualquer crítica implícita a outras abordagens de precificação

Ao final desta fase, me mostre um resumo estruturado do que você entendeu, antes de seguir. Não avance sem meu ok.

### Fase 2 — Análise comparativa

Compare três coisas lado a lado: a metodologia da planilha do MVP (já implementada), a metodologia da live (planilha + transcrição), e o que o código atual realmente faz. Identifique:

- **Convergências**: onde as duas metodologias concordam
- **Divergências**: onde discordam, e qual parece mais robusta (justifique)
- **Gaps de implementação**: o que está na planilha do MVP mas ainda não virou código
- **Gaps conceituais**: o que está na metodologia da live e não existe em lugar nenhum do produto
- **Oportunidades de unificação**: onde as duas abordagens podem ser combinadas num modelo mais completo

### Fase 3 — Visão de produto final

Use a skill de brainstorming aqui. Descreva como seria um produto final completo e diferenciado para precificação de consultórios odontológicos, considerando tudo que aprendeu. Não se limite ao que as planilhas fazem — pense no que um dentista realmente precisa para precificar bem seu consultório de ponta a ponta. Inclua features que hoje não existem em nenhuma das fontes mas que fazem sentido (ex: simulações de cenários, comparação com benchmarks de mercado, integração com agenda, relatórios para contador, etc).

Separe claramente: o que é **núcleo essencial**, o que é **diferencial competitivo**, e o que é **nice-to-have de longo prazo**.

### Fase 4 — Diagnóstico do estado atual

Compare a visão da Fase 3 com o MVP implementado. Para cada área do produto, classifique como: ✅ implementado e bom, 🟡 implementado mas precisa melhorar, 🔴 não implementado. Seja honesto — não puxe a sardinha nem para o lado otimista nem para o pessimista.

### Fase 5 — Plano de implementação

Crie um roadmap faseado (Fase 1, 2, 3…) priorizando por valor entregue vs. esforço. Cada fase deve ter: objetivo, entregáveis concretos, dependências técnicas, riscos, e critério de "feito". Priorize primeiro o que fecha gaps críticos da metodologia (coisas que comprometem a precisão do resultado), depois diferenciais, depois nice-to-haves.

### Fase 6 — Entregáveis finais

Atualize e crie os seguintes arquivos:

1. **`PRD.md`** — atualize com a visão de produto final consolidada da Fase 3, mantendo histórico do que já existia (pode usar uma seção "Histórico" no final ou git para isso). O PRD deve refletir o produto alvo, não só o MVP atual.

2. **`ARCHITECTURE.md`** — atualize refletindo a arquitetura necessária para suportar a visão completa, não só o que existe hoje. Indique claramente o que já existe e o que é planejado.

3. **`ROADMAP.md`** (novo) — o plano da Fase 5, com fases, prioridades, e estimativas aproximadas de esforço.

4. **`CLAUDE.md`** — melhore este arquivo para que futuras sessões do Claude Code no projeto tenham contexto rico: visão do produto, estado atual, metodologia de precificação (resumo do que aprendeu das duas fontes), convenções de código do projeto, o que evitar, e ponteiros para os outros docs. Este arquivo é a porta de entrada para qualquer nova sessão, então caprichа.

## Regras importantes

- **Não escreva código de implementação nesta sessão.** O foco é análise, documentação e planejamento. Implementação vem depois.
- Ao final de cada fase, pare e me mostre o resultado antes de seguir para a próxima. Quero poder corrigir rumo.
- Se encontrar contradições entre as fontes, não esconda — explicite e me traga para decidir.
- Seja específico. "Melhorar o cálculo de custo fixo" é ruim; "Separar custo fixo do consultório do custo fixo pessoal do dentista, como a live propõe no minuto X" é bom.
- Use números e exemplos concretos das planilhas e da transcrição sempre que possível.
- Em prosa, não use bullet points nem traços dentro de texto corrido (só em listas estruturais como esta). Parágrafos corridos são preferíveis.

Pode começar pela Fase 1.