# Fase 2 — Análise Comparativa

## Convergências: onde as duas metodologias concordam

As duas metodologias partem do mesmo princípio fundador: **o preço de um serviço odontológico é determinado pelo custo da hora (ou minuto) do profissional, multiplicado pelo tempo do procedimento, mais os materiais consumidos.** Ambas reconhecem que o dentista que precifica "de cabeça" ou pelo concorrente está frequentemente operando no prejuízo sem saber.

Os dois métodos concordam que custos fixos são tudo aquilo que o dentista paga independentemente de atender ou não, e que itens pagos anualmente (anuidade do CRO, seguros) devem ser rateados mensalmente. Ambos reconhecem a depreciação de equipamentos como componente obrigatório do custo, e os dois incluem o salário/remuneração do próprio dentista como custo — não como sobra. A fórmula nuclear `preço = (tempo × custo/hora) + materiais` é comum às duas fontes.

---

## Divergências: onde discordam, e qual parece mais robusta

**Divergência 1: Estrutura do custo fixo — por itens vs. por categorias**

A CNCC usa 14 itens prescritivos com valores de referência nacionais. A live usa 10 categorias abertas onde o dentista coloca seus valores reais. A abordagem da live é mais robusta porque evita que o dentista assuma valores de referência desatualizados (os R$ 600 de aluguel da CNCC são de outrora; hoje, uma sala em São Paulo pode ser R$ 5.000). O risco da CNCC é o dentista não questionar os padrões e calcular com uma base falsa.

**Divergência 2: Meses de trabalho — 11 vs. 12**

A CNCC divide por 11 meses (embutindo 1 mês de férias). A live e o código atual usam 12 meses. A diferença numérica é pequena (~9%), mas o conceito é importante: se o dentista vai tirar férias, esse mês de ausência deve estar contemplado no custo distribuído pelos 11 meses trabalhados. A abordagem CNCC é ligeiramente mais conservadora e defensável. O código atual diverge da CNCC neste ponto sem razão explícita.

**Divergência 3: Divisão por cadeiras — ausente vs. central**

A CNCC foi projetada para consultório individual com 1 cadeira e não trata de múltiplas cadeiras. A live coloca isso como conceito central: o mesmo aluguel, a mesma secretária, o mesmo custo fixo é rateado pelas cadeiras ativas. Para qualquer clínica com mais de 1 dentista, ignorar isso resulta em um custo hora superestimado ou subestimado dependendo de como o dentista interpreta a planilha. A abordagem da live é mais robusta para a realidade do mercado atual, onde clínicas compartilhadas e grupos odontológicos são cada vez mais comuns.

**Divergência 4: Impostos e taxa de cartão — custo fixo vs. variável**

A CNCC inclui ISS e taxas como item de custo fixo (item 3, R$ 100/mês). Isso é uma simplificação problemática: o ISS no regime Simples Nacional varia entre 4,5% e 16% do faturamento — ou seja, é proporcional ao que o dentista cobra, não fixo. A live trata isso corretamente como custo variável expresso como percentual do preço (22% no exemplo, incluindo impostos + cartão + comissões). Isso significa que para cada procedimento, o dentista sabe exatamente qual percentual do preço cobrado vai embora em impostos e taxas antes de aparecer como receita real. A abordagem da live é mais precisa e financeiramente correta.

**Divergência 5: Ociosidade — ignorada vs. explícita**

A CNCC assume que o dentista usa 100% das horas disponíveis (22 dias × 8h = 176h/mês). A live desconta 20% de ociosidade/faltas/atrasos, chegando a 128h reais para uma cadeira com 160h teóricas. Esse ajuste é crucial: quando o dentista tem agenda ociosa, cada hora parada corrói a margem dos procedimentos feitos. A abordagem da live força o dentista a ser honesto sobre sua taxa de ocupação real. O código atual não contempla isso.

**Divergência 6: Pró-labore — estrutura de encargos vs. valor de mercado**

A CNCC calcula a remuneração com uma estrutura específica de encargos (11% + 40% + 20% + férias + 13º aplicados sobre o salário base). A live propõe um critério diferente e mais simples: "quanto você pagaria para contratar alguém para fazer tudo que você faz?" Ambas convergem na ideia de que o pró-labore é custo, não sobra. A abordagem da CNCC é mais granular (permite configurar cada encargo separadamente); a da live é mais pragmática para quem não tem organização financeira. Manter a estrutura de encargos da CNCC, mas com um campo de "valor de mercado" alternativo, seria o ideal.

**Divergência 7: Margem de lucro — implícita vs. explícita**

A CNCC nunca menciona margem de lucro alvo. A taxa de retorno (3%) é sobre o investimento inicial de equipamentos, não sobre o procedimento. A live é explícita: o procedimento deve ter no mínimo 30% de margem de lucro. O dentista que usa a CNCC pode estar calculando o preço de custo sem saber que está sem margem. A abordagem da live é mais completa e diretamente útil para tomada de decisão.

---

## Gaps de implementação: o que está na metodologia CNCC mas não virou código

1. **Uso de 11 meses na depreciação e retorno:** A planilha original usa 11 meses; o código usa 12. O impacto é pequeno mas a fidelidade à metodologia está quebrada.

2. **Separação de custos fixos da radiologia:** O PRD menciona isso explicitamente (FR-7) — procedimentos 200-390 deveriam usar um custo fixo separado que inclui equipamentos de Rx. Não está implementado.

3. **Os ~130 materiais e 200+ procedimentos da planilha VRPO:** O seed atual tem 30 materiais e ~40 procedimentos com valores estimados. Isso compromete diretamente a utilidade do produto para qualquer dentista que começa a usá-lo — ele vai ter que cadastrar manualmente grande parte dos seus procedimentos.

4. **Valores VRPO de referência fidedignos:** Os 65 valores no seed parecem estimativas criadas para o MVP, não os valores oficiais da CNCC. Para o produto ser credível como ferramenta de negociação com convênios, precisa dos valores reais.

---

## Gaps conceituais: o que está na live e não existe em nenhum lugar do produto

1. **Número de cadeiras como divisor do custo fixo:** Não está no schema, não está no formulário, não está na fórmula. Qualquer dentista com sócio ou associado calculará errado.

2. **Desconto de ociosidade:** Não existe campo de "taxa de ocupação" ou "percentual de horas úteis". O sistema assume sempre 100% de ocupação.

3. **Impostos e taxa de cartão como % do preço:** Não existem como variáveis. O ISS está como custo fixo (item 3 da CNCC), o que distorce a margem real.

4. **Margem de lucro alvo por procedimento:** O sistema mostra o preço calculado e a diferença para o VRPO, mas não diz se aquele preço tem margem suficiente. O dentista não sabe se está "cobrindo o custo" ou "tendo lucro".

5. **Ponto de equilíbrio por procedimento:** O dashboard já mostra o break-even mensal da clínica, mas não calcula o break-even por procedimento — "quantas consultas de X eu preciso fazer por mês para cobrir meus custos?"

6. **Custo do laboratório como variável separada:** A live trata o laboratório (coroas, próteses) de forma explícita como custo variável considerável, separado dos materiais consumíveis. O sistema atual não distingue esses dois tipos.

---

## Oportunidades de unificação

As duas metodologias são complementares, não concorrentes. A CNCC fornece a base técnica (lista de itens, fórmula de depreciação, remuneração com encargos) e a referência de preços nacionais. A live fornece os conceitos de gestão que tornam o resultado acionável (margem, cadeiras, ociosidade, impostos).

Um modelo unificado teria:

- Base de custo fixo com os 14 itens da CNCC (como ponto de partida), mas com categorias abertas para o dentista adicionar os seus
- Campo de número de cadeiras que divide automaticamente o custo hora
- Campo de taxa de ocupação (padrão 80%, configurável)
- Seção de custos variáveis por procedimento com subcategorias: materiais consumíveis, laboratório, e custos variáveis percentuais (impostos, cartão, comissões)
- Visualização de margem de lucro por procedimento ao lado do preço calculado
- Comparação com a referência VRPO como instrumento de negociação, não como "certo ou errado"
- Break-even tanto da clínica quanto por procedimento (quantas execuções/mês para cobrir o custo fixo alocado)
