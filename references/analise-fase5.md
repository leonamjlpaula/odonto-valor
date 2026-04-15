# Fase 5 — Plano de Implementação

A priorização segue dois eixos: **impacto na correção do produto** (bugs de cálculo primeiro) e **impacto na retenção do primeiro usuário** (o dentista que cria conta e não encontra seus procedimentos vai embora). Fases menores e focadas, cada uma entregável de forma independente.

---

## Fase 1 — Correções de Cálculo (Fundação Metodológica)

**Objetivo:** Garantir que os números que o sistema produz são matematicamente corretos para todos os perfis de usuário, conforme a metodologia CNCC e os conceitos da live.

**Entregáveis concretos:**

1. Corrigir a depreciação para usar 11 meses em `CustoFixoPorMinuto.ts` — alterar `anosDepreciacao * 12` para `anosDepreciacao * 11`. Mesmo ajuste na taxa de retorno.
2. Adicionar campo `numeroCadeiras` (Int, default 1) em `CustoFixoConfig`. Dividir o `custoFixoBase` e o `custoFixoPorMinuto` por esse valor antes de qualquer outro cálculo.
3. Adicionar campo `percOciosidade` (Float, default 0) em `CustoFixoConfig`. Os `minutosUteis` passam a ser calculados como `diasUteis × horasTrabalho × 60 × (1 - percOciosidade/100)`. Default 0 para não surpreender usuários existentes, com nudge no dashboard para configurar.
4. Adicionar campos `percImpostos` (Float, default 8) e `percTaxaCartao` (Float, default 4) em `CustoFixoConfig`. Incorporar no cálculo de margem — não no custo fixo por minuto, mas na função `calcularPrecoProcedimento` que devolve um novo campo `margemLucro`.
5. Atualizar o formulário de Custos Fixos para expor os novos campos com tooltips explicativos.
6. Migration Prisma para os novos campos, mantendo defaults que preservam comportamento atual para usuários existentes.

**Dependências técnicas:** Nenhuma dependência externa. Mudanças contidas em `CustoFixoConfig` (schema + migration), `CustoFixoPorMinuto.ts` (domain), `calcularPrecoProcedimento.ts` (use case), `custoFixoActions.ts` e o componente de formulário de custos fixos.

**Riscos:** Os defaults dos novos campos devem reproduzir exatamente o comportamento atual para não quebrar nenhum usuário existente. O campo `percOciosidade` com default 0 preserva o comportamento atual; nudge no dashboard incentiva a configurar para 20%.

**Critério de "feito":** Com os mesmos dados de entrada da planilha CNCC (R$ 13.528,36 de custos, R$ 35.980,32 de equipamentos, salário R$ 6.000 com os encargos originais, 1 cadeira, 0% ociosidade), o sistema deve produzir R$ 2,475/min — o mesmo valor da planilha.

---

## Fase 2 — Margem de Lucro Visível

**Objetivo:** Cada procedimento mostra sua margem percentual com indicador visual, e o sistema sugere preço mínimo para 30% de margem.

**Entregáveis concretos:**

1. Expandir o retorno de `calcularPrecoProcedimento` com `margemLucro` (percentual) e `precoMinimoParaMargem30` (calculado de trás para frente: `precoMinimo = custosAbsolutos / (1 - impostos% - cartao% - 0.30)`).
2. Adicionar coluna "Margem" na listagem de procedimentos por especialidade, com badge colorido: verde ≥30%, amarelo 10–29%, vermelho <10%.
3. Exibir margem e preço mínimo no detalhe do procedimento.
4. No dashboard, substituir "5 procedimentos com menor margem vs. VRPO" por "procedimentos no vermelho" — baseado em margem real, não em comparação VRPO.
5. Alerta pós-save: ao salvar custos fixos ou preço de material, calcular margem de todos os procedimentos e exibir toast com "X procedimentos ficaram abaixo de 30% de margem" com link para ver quais.

**Dependências técnicas:** Depende da Fase 1 (os campos `percImpostos` e `percTaxaCartao` precisam existir).

**Riscos:** O alerta pós-save pode ser custoso com muitos procedimentos. Limitar a 500ms de timeout com debounce; se exceder, mostrar apenas a contagem sem listar.

**Critério de "feito":** Para um procedimento com preço R$ 280, custos totais de R$ 243, impostos 8% e cartão 4%: margem exibida ≈ 8,4% (vermelho). Preço mínimo para 30%: R$ 243 / (1 − 0,08 − 0,04 − 0,30) = R$ 415.

---

## Fase 3 — Seed Completo e Fidedigno

**Objetivo:** Todo dentista que cria conta encontra seus procedimentos pré-configurados com materiais e tempos realistas.

**Entregáveis concretos:**

1. Levantar os 200+ procedimentos da planilha VRPO com códigos, nomes, especialidades e tempos padrão e incorporar no seed de dados do usuário (`vrpo-seed-data.ts`).
2. Expandir a lista de materiais de 30 para os ~130 da planilha CNCC, com preços atualizados para o mercado atual.
3. Mapear composições de materiais para os procedimentos mais frequentes (~50 procedimentos com composição completa).
4. Substituir os valores VRPO estimados pelos valores oficiais da CNCC (última publicação disponível).
5. Adicionar campo `custoLaboratorio` (Float, default 0, nullable) em `ProcedimentoMaterial`. Procedimentos de prótese, faceta e ortodontia do seed já devem ter esse campo preenchido com valores de referência.

**Dependências técnicas:** Trabalho de pesquisa/curadoria de dados intenso antes de qualquer código. Recomenda-se criar um script de importação a partir de planilha para agilizar a entrada de 200+ procedimentos.

**Riscos:** Preços de materiais variam por região — usar valores médios nacionais com nota explicativa na UI. Valores VRPO oficiais podem não estar disponíveis em formato estruturado — pode ser necessário transcrição manual.

**Critério de "feito":** Um dentista generalista que cria conta encontra pelo menos 80% dos seus procedimentos do dia-a-dia pré-configurados, com margem calculada automaticamente sem nenhuma entrada manual além dos custos fixos.

---

## Fase 4 — Onboarding Adaptativo e Dashboard de Diagnóstico

**Objetivo:** O primeiro login entrega valor em menos de 10 minutos e o dashboard responde "o que precisa de atenção agora?".

**Entregáveis concretos:**

1. Reformular o wizard de onboarding para começar com pergunta de perfil: "Você atende sozinho(a) ou divide o consultório com outros dentistas?" — ramificando para fluxos distintos.
2. Para perfil clínica: adicionar step explicando o conceito de cadeiras com exemplo numérico antes do formulário.
3. No dashboard, adicionar seção "Atenção necessária" que aparece somente quando há alertas: procedimentos no vermelho, custos fixos não atualizados há mais de 6 meses, taxa de ocupação não configurada.
4. Adicionar card "Faturamento mínimo semanal" — break-even mensal dividido por 4.
5. Refatorar o comparativo VRPO para mudar o framing de julgamento para instrumento: substituir "abaixo da VRPO" por "margem para negociação" e adicionar texto explicativo sobre o uso em reuniões de credenciamento.

**Dependências técnicas:** Depende das Fases 1, 2 e 3. O onboarding adaptativo requer que os novos campos de custo fixo existam e que o seed esteja completo para ser eficaz.

**Riscos:** O redesenho do wizard deve só aparecer para contas novas (flag `onboardingCompleted` já existe no schema).

**Critério de "feito":** Um dentista solo cria conta, passa pelo wizard, configura custos fixos e vê a margem dos seus procedimentos padrão em menos de 10 minutos, medido em teste com usuário real.

---

## Fase 5 — Simulador de Cenários e Exportação Profissional

**Objetivo:** Transformar o produto em ferramenta de decisão e de negociação — as features que justificam a assinatura.

**Entregáveis concretos:**

1. Simulador de cenários: painel lateral que permite ajustar variáveis (custo fixo total, número de cadeiras, taxa de ocupação, % impostos) sem salvar, exibindo em tempo real o impacto no custo/min e na margem dos procedimentos.
2. PDF de credenciamento: novo template de exportação que inclui — além da tabela de preços — a memória de cálculo do custo fixo por minuto, a metodologia CNCC referenciada, e a comparação com VRPO organizada por especialidade.
3. Narrativa no histórico: ao comparar dois snapshots, exibir diff dos itens de custo fixo que mudaram ("aluguel: R$ 2.500 → R$ 3.200") além da variação no custo/min.

**Dependências técnicas:** Simulador é inteiramente client-side — `CustoFixoPorMinuto` já é pura e pode ser chamada com `useCallback`. PDF de credenciamento requer extensão do `PdfExportService`.

**Riscos:** Manter o escopo do simulador restrito a variáveis de custo fixo nesta fase; simulação de mix de procedimentos é Fase 6+.

**Critério de "feito":** Dentista ajusta o aluguel no simulador e vê imediatamente quantos procedimentos cruzam para o vermelho — sem salvar. O PDF de credenciamento inclui a seção de metodologia e passa em revisão por um dentista real que negocia com convênios.

---

## Fase 6 — Nice-to-Haves de Alto Valor (Longo Prazo)

Sem data comprometida. Executar na ordem de demanda dos usuários:

- Break-even por procedimento ("quantas consultas de tipo X por mês")
- Calculadora de pacotes/fidelização
- Metas de faturamento mensal
- Notificações de revisão por inflação (IPCA)
- Área administrativa para atualizar valores VRPO sem deploy
- Múltiplos consultórios

---

## Visão Consolidada do Roadmap

| Fase | Foco                         | Esforço estimado                                   | Valor                                   |
| ---- | ---------------------------- | -------------------------------------------------- | --------------------------------------- |
| 1    | Correções de cálculo         | Pequeno (1–2 dias)                                 | Crítico — corrige erros silenciosos     |
| 2    | Margem visível + alertas     | Médio (3–4 dias)                                   | Alto — muda a proposta de valor central |
| 3    | Seed completo                | Grande (5–8 dias, dominado por curadoria de dados) | Crítico — sem isso o onboarding falha   |
| 4    | Onboarding + dashboard       | Médio (3–4 dias)                                   | Alto — retenção no primeiro uso         |
| 5    | Simulador + PDF profissional | Médio-grande (4–6 dias)                            | Diferencial — justifica assinatura      |
| 6    | Nice-to-haves                | Variável                                           | Incremental                             |

A ordem recomendada é exatamente essa: Fase 1 e 3 podem correr em paralelo (cálculo é código, seed é dados), Fase 2 depende da 1, Fase 4 depende da 2 e 3, Fase 5 depende da 4.
