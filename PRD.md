# PRD: Precifica — SaaS de Precificação para Consultórios Odontológicos

## Visão do Produto

O **Precifica** é um SaaS web destinado a cirurgiões-dentistas brasileiros que precisam saber, com precisão, se estão tendo lucro em cada procedimento que realizam. Em menos de 10 minutos após o cadastro, o dentista configura sua estrutura de custos e passa a enxergar a margem real de cada procedimento — não só o preço de custo.

O posicionamento central é: **"Configure em 10 minutos e saiba se está no lucro ou no prejuízo em cada procedimento."** Não é uma planilha digital — é um diagnóstico financeiro contínuo da clínica.

O problema resolvido vai além de "digitalizartabela Excel": dentistas que usam planilhas calculam o preço de custo mas não enxergam a margem; não consideram impostos e taxa de cartão como custos variáveis do procedimento; não sabem o impacto da ociosidade de agenda nos seus números; e não têm como simular o efeito de uma mudança de custo em toda a tabela de preços.

---

## Perfil de Usuário

O produto atende dois perfis, com onboarding adaptativo:

**Dentista solo:** atende sozinho(a), 1 cadeira, com ou sem auxiliar. Maior volume de usuários. Precisa de simplicidade — um formulário direto de custos fixos e a margem dos seus procedimentos na tela principal.

**Clínica pequena:** 2–4 cadeiras, 1–2 dentistas sócios ou associados dividindo custos fixos. Precisa entender como o custo fixo se divide por cadeira, como o pró-labore se separa do lucro, e como a ociosidade de uma cadeira impacta as demais.

---

## Metodologia de Precificação

O produto implementa uma metodologia híbrida que unifica duas fontes:

**Base CNCC/VRPO:** A Comissão Nacional de Convênios e Credenciamentos publicou a metodologia de precificação odontológica, usada como referência nacional para negociação com convênios. Define 14 itens de custo fixo padrão, a fórmula de depreciação de equipamentos (sobre 11 meses de trabalho efetivo), a estrutura de remuneração profissional com encargos, e a taxa de retorno sobre investimento. O custo fixo por minuto resultante é multiplicado pelo tempo de cada procedimento e somado ao custo variável de materiais.

**Complemento da gestão financeira moderna:** Itens ausentes na metodologia CNCC mas essenciais para a realidade atual: divisão do custo fixo por número de cadeiras; desconto de ociosidade de agenda (padrão 20%); impostos sobre faturamento e taxa de cartão de crédito como percentuais variáveis sobre o preço (não como custo fixo); margem de lucro alvo de 30% por procedimento; e custo de laboratório como categoria distinta dos materiais consumíveis.

**Fórmula completa:**

```
minutosUteis = diasUteis × horasTrabalho × 60 × (1 − percOciosidade/100)
custoBasePorCadeira = totalItensMensais / (minutosUteis × numeroCadeiras)
depreciacao = investimento / (anosDepreciacao × 11 × minutosUteis)
remuneracao = salarioBase × (1 + encargos%) / minutosUteis
taxaRetorno = investimento × taxaRetornoPerc% / (anosRetorno × 11 × minutosUteis)
custoFixoPorMinuto = custoBase + depreciacao + remuneracao + taxaRetorno

custoVariavel = Σ (material.preco / divisor) × consumo + custoLaboratorio
custoFixoTotal = tempoMinutos × custoFixoPorMinuto
precoBreakEven = custoFixoTotal + custoVariavel

margemLucro = (precoVenda − precoBreakEven − precoVenda × (percImpostos + percCartao) / 100) / precoVenda
precoMinimoParaMargem30 = precoBreakEven / (1 − (percImpostos + percCartao) / 100 − 0.30)
```

---

## Objetivos do Produto

- Em menos de 10 minutos, o dentista configura seus custos e vê a margem real de cada procedimento
- Todo dentista que cria conta encontra pelo menos 80% dos seus procedimentos do dia-a-dia pré-configurados (seed completo com 200+ procedimentos VRPO)
- O dashboard responde "o que precisa de atenção agora?" sem que o dentista precise navegar pelo sistema
- O produto serve como ferramenta de negociação com convênios: exporta PDF com metodologia CNCC explícita para credenciamento
- Dentistas com sócios ou associados calculam corretamente (divisão por cadeiras)

---

## Funcionalidades — Núcleo Essencial

### F-01: Configuração de Custos Fixos Completa

Formulário com os itens de custo fixo mensal (14 padrão da CNCC como ponto de partida, editáveis, com possibilidade de adicionar itens customizados) e os seguintes parâmetros:

- Dias úteis por mês (padrão: 22)
- Horas trabalhadas por dia (padrão: 8)
- **Número de cadeiras** (padrão: 1) — divide o custo fixo base pelo número de cadeiras ativas
- **Taxa de ociosidade %** (padrão: 0%, sugerido: 20%) — reduz os minutos úteis disponíveis
- Investimento em equipamentos + anos de depreciação (usa 11 meses por ano, conforme CNCC)
- Pró-labore / remuneração profissional com encargos detalhados (fundo de reserva, insalubridade, imprevistos, férias, 13º)
- Taxa de retorno sobre investimento
- **% de impostos sobre faturamento** (padrão: 8%) — ISS/Simples, varia por regime tributário
- **% de taxa de cartão médio** (padrão: 4%)

O custo fixo por minuto é recalculado em tempo real a cada alteração.

### F-02: Margem de Lucro por Procedimento

Cada procedimento exibe, ao lado do preço calculado:

- **Margem de lucro %** — após deduzir impostos e taxa de cartão do preço de venda
- **Indicador visual:** verde (≥30%), amarelo (10–29%), vermelho (<10% ou negativo)
- **Preço mínimo para 30% de margem** — calculado de trás para frente

### F-03: Catálogo Completo de Procedimentos e Materiais

- 200+ procedimentos VRPO organizados em 11 especialidades, com tempos padrão e composições de materiais pré-configurados
- ~130 materiais com preços de referência do mercado nacional (atualizáveis pelo usuário)
- Custo de laboratório como campo separado nos procedimentos de prótese, facetas e ortodontia
- Procedimentos customizados criados pelo usuário

### F-04: Dashboard de Diagnóstico

O dashboard responde imediatamente:

- Custo fixo por minuto atual
- Procedimentos no vermelho (margem <10%) com link direto
- Break-even mensal com e sem pró-labore
- Faturamento mínimo semanal (break-even ÷ 4)
- Alerta quando custos fixos não foram atualizados há mais de 6 meses
- Nudge para configurar taxa de ociosidade, se ainda for 0%

### F-05: Comparativo VRPO como Instrumento de Negociação

Tabela comparando preço calculado com referência VRPO nacional, com framing de "margem para negociação" — quanto o dentista pode aumentar o preço e ainda estar alinhado com o mercado — em vez de julgamento verde/vermelho puro.

### F-06: Onboarding Adaptativo por Perfil

Wizard que começa perguntando o perfil (solo ou clínica com outros dentistas) e adapta o fluxo de configuração. Para clínicas: explica o conceito de divisão por cadeiras com exemplo numérico antes do formulário.

### F-07: Alertas Automáticos Pós-Save

Ao salvar qualquer configuração de custo, o sistema identifica procedimentos que cruzaram para o vermelho e exibe alerta com contagem e link para revisão.

### F-08: Histórico de Versões (Snapshots)

Salva fotografia do estado de precificação em um momento, com comparação lado a lado vs. estado atual, e diff dos itens de custo que mudaram entre versões. Limite de 10 snapshots por usuário.

### F-09: Exportação PDF e Excel

- **PDF padrão:** tabela de procedimentos com preços calculados, margem e referência VRPO
- **PDF de credenciamento:** inclui memória de cálculo do custo fixo por minuto (cada item, depreciação, remuneração, retorno) com metodologia CNCC referenciada — para uso em reuniões com convênios

---

## Funcionalidades — Diferencial Competitivo

### F-10: Simulador de Cenários

Painel lateral que permite ajustar variáveis de custo (aluguel, número de cadeiras, taxa de ocupação, % impostos) sem salvar, exibindo em tempo real o impacto no custo/min e na margem dos procedimentos. Permite responder: "E se eu contratar um sócio?", "E se o aluguel subir R$ 500?", "E se eu melhorar minha taxa de ocupação de 70% para 85%?"

---

## Funcionalidades — Nice-to-Have (Longo Prazo)

- Break-even por procedimento ("quantas consultas de tipo X por mês para cobrir os custos")
- Calculadora de pacotes/fidelização anual
- Metas de faturamento mensal
- Notificações de revisão por inflação (IPCA acumulado)
- Área administrativa para atualizar valores VRPO sem deploy
- Múltiplos consultórios (mesmo usuário, endereços diferentes)
- Benchmarks anonimizados de mercado (requer escala de usuários)
- Relatório para contador (DRE simplificada por especialidade)
- Integração com agenda para taxa de ocupação automática

---

## Requisitos Funcionais

- **FR-1:** O custo fixo por minuto deve ser recalculado em tempo real sempre que qualquer valor de custo fixo for alterado
- **FR-2:** A fórmula de cálculo do preço final é: `Preço = (Tempo × CustoFixo/min) + CustoVariável`
- **FR-3:** O custo variável é: `Σ (Preço / Divisor) × Consumo + custoLaboratorio`
- **FR-4:** Cada usuário tem seus próprios dados completamente isolados entre contas
- **FR-5:** Os valores VRPO de referência são globais e somente leitura
- **FR-6:** A depreciação e a taxa de retorno usam 11 meses por ano (conforme CNCC — 1 mês de férias)
- **FR-7:** O custo fixo base é dividido pelo número de cadeiras configurado
- **FR-8:** Os minutos úteis são reduzidos pela taxa de ociosidade: `minutosUteis × (1 − ociosidade%/100)`
- **FR-9:** Impostos e taxa de cartão entram como percentual sobre o preço de venda no cálculo da margem, não como custo fixo
- **FR-10:** O sistema deve funcionar corretamente em telas de 375px (iPhone SE) até desktop
- **FR-11:** A exclusão de material é bloqueada se estiver em uso em algum procedimento
- **FR-12:** Procedimentos com `isCustom: true` são distinguidos visualmente dos VRPO padrão
- **FR-13:** Snapshots são imutáveis após criados

---

## Fora do Escopo

- Sistema de pagamento / assinaturas (a ser implementado separadamente)
- App mobile nativo (iOS/Android) — apenas web responsivo
- Agenda de pacientes ou prontuário eletrônico
- Integração com planos odontológicos ou convênios (exportação manual é o caminho)
- Múltiplos usuários por conta
- Backup automático ou sincronização offline

---

## Métricas de Sucesso

- Dentista configura custos e vê margem dos seus procedimentos em menos de 10 minutos (medido em teste com usuário real)
- 80% dos procedimentos do dia-a-dia de um dentista generalista estão pré-configurados no seed
- Zero divergência de cálculo vs. planilha CNCC com os mesmos dados de entrada (R$ 2,475/min no exemplo padrão)
- PDF de credenciamento aprovado em revisão por dentista que negocia com convênios

---

## Histórico

O PRD original (versão MVP, criado via ralph-wiggum) está preservado em `tasks/prd-precifica-saas.md`. Este documento representa a visão evoluída do produto após análise profunda da metodologia CNCC, da live de precificação da mentora Aline Silva, e do código implementado. A análise completa está em `references/analise-fase1.md` a `analise-fase5.md`.
