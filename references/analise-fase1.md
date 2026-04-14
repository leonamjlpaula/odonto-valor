# Fase 1 — Compreensão Profunda

## 1. Planilha VRPO (custos_consultorio.xlsx) — Metodologia CNCC

**Origem e propósito:** É o documento oficial da Comissão Nacional de Convênios e Credenciamentos (CNCC). Criada originalmente em 1988 como TNCC, renomeada VRCC em 1994 e VRPO em 2002. Seu propósito principal é fornecer um método padronizado para dentistas negociarem com planos e convênios.

### Variáveis de entrada — Custo Fixo (14 itens padrão)

| #         | Item                                    | Valor mensal             |
| --------- | --------------------------------------- | ------------------------ |
| 1         | Aluguel de sala                         | R$ 600                   |
| 2         | Condomínio                              | R$ 400                   |
| 3         | Impostos e Taxas (IPTU, ISS)            | R$ 100                   |
| 4         | Anuidade ABO/CRO/Sindicato              | R$ 1.600 (anual rateado) |
| 5         | Despesas com telefone                   | R$ 100                   |
| 6         | Energia elétrica                        | R$ 2.000                 |
| 7         | Salário + encargos + VT + insalubridade | R$ 2.500                 |
| 8         | Faxineira + material de limpeza         | R$ 100                   |
| 9         | Livros/revistas/congressos              | R$ 5.000 (anual)         |
| 10        | Contador                                | R$ 300                   |
| 11        | Manutenção do consultório               | R$ 400                   |
| 12        | Consumo geral mensal                    | R$ 178,36                |
| 13        | Informática                             | R$ 250                   |
| 14        | Administração                           | R$ 2.500                 |
| **Total** |                                         | **R$ 13.528,36**         |

**Parâmetros de tempo:** 22 dias úteis/mês, 8 horas/dia, **11 meses** (1 mês de férias implícito).

### Componentes adicionais do custo/min

- **Depreciação:** investimento total (exemplo: R$ 35.980,32) ÷ 10 anos ÷ 11 meses ÷ 22 dias ÷ 8h ÷ 60 min = R$ 0,026/min. Nota: a planilha original usa **11 meses**, não 12.
- **Remuneração:** Salário R$ 6.000 + 11% fundo de reserva + 40% periculosidade + 20% imprevistos + férias + 13º = R$ 11.426,67/mês = R$ 1,082/min
- **Taxa de retorno:** 3% do investimento em 3 anos = R$ 0,086/min

**Custo fixo/minuto total na planilha:** R$ 1,281 (base) + R$ 0,026 (depreciação) + R$ 1,082 (remuneração) + R$ 0,086 (retorno) = **R$ 2,475/min**

### Custo variável

Para cada procedimento, lista materiais com: nº, nome, quantidade de compra, consumo por uso, preço, divisor. Fórmula: `(Preço / Divisor) × Consumo`. Exemplo para Aplicação Tópica de Flúor-Verniz: R$ 5,83 de custo variável.

### Preço final

```
Preço = Tempo (min) × R$ 2,475 + Custo Variável
```

### Pressupostos implícitos da planilha CNCC

- Consultório individual, **1 cadeira, 1 dentista**
- Não inclui impostos sobre o faturamento (ISS, Simples)
- Não inclui taxa de cartão de crédito
- Não inclui inadimplência
- Valores de referência dos itens são antigos (provavelmente dos anos 2000)
- O ISS do item 3 é custo fixo (não proporcional ao faturamento)

---

## 2. Live + Planilha (precificacao_dentistas.xlsx) — Metodologia Aline Silva

**Contexto:** Aline é mentora financeira e contadora que trabalha com precificação de dentistas há 5 anos. A live é direcionada a dentistas do grupo Hels e a planilha é entregue como presente aos participantes. O foco declarado é ensinar o **conceito de precificar**, não a ferramenta em si.

### Metodologia passo a passo (extraída da transcrição)

1. Levantar todos os custos fixos mensais da clínica (custo fixo = aquilo que você paga vendendo ou não)
2. Definir o pró-labore real do sócio-dentista — "quanto você pagaria para alguém fazer tudo que você faz?" — separando-o do lucro
3. Definir quantas cadeiras/equipes absorvem esse custo fixo (o custo total é dividido pelas cadeiras)
4. Definir as horas reais de trabalho mensal, com desconto de **20% de ociosidade/faltas/atrasos** (160h × 0,80 = 128h úteis)
5. Calcular o custo da hora: Total custos fixos ÷ horas reais
6. Para cada procedimento: identificar o tempo de entrega real (desde a consulta inicial até entrega final)
7. Calcular preço mínimo: (custo hora × horas do procedimento) + materiais + impostos + taxa de cartão + comissões
8. Calcular a margem de lucro resultante e ajustar até atingir **30% de margem mínima**

### Variáveis de entrada da planilha SERVIÇO

- Preço de venda (input do dentista)
- Custos variáveis como % do preço: impostos (22%), taxa de cartão (5%), comissões (3%), inadimplência
- Custo unitário médio do material (incluindo laboratório)
- Custo de horas (custo hora × número de horas do procedimento)
- Calcula automaticamente: margem de contribuição, margem de lucro, ponto de equilíbrio

### Estrutura do custo fixo (mais aberta)

| Categoria                                   | Valor         |
| ------------------------------------------- | ------------- |
| Aluguéis                                    | R$ 4.000      |
| Salários e Benefícios Funcionários          | R$ 8.000      |
| **Pró-labore e Benefícios Sócios**          | **R$ 10.000** |
| Despesas de Viagem                          | R$ 2.000      |
| Contabilidade                               | R$ 1.800      |
| Luz/Água/Gás/Telefone                       | R$ 800        |
| Manutenção/Segurança/Limpeza                | R$ 1.500      |
| Despesas Financeiras                        | R$ 350        |
| **Material no Geral (difícil de itemizar)** | **R$ 4.000**  |
| **Total**                                   | **R$ 32.450** |

**Custo hora calculado no exemplo:** R$ 32.450 / (3 cadeiras × 128h) = R$ 25,35/hora por cadeira.

### Conceitos específicos da live ausentes na metodologia CNCC

1. **Divisão por cadeiras:** "A secretária que atende na recepção é dividida por três cadeiras. A energia elétrica é dividida por três cadeiras." Permite modelar clínicas com múltiplos dentistas corretamente.

2. **Desconto de ociosidade:** Horas reais = horas teóricas × 0,80. A ociosidade corrói a lucratividade dos procedimentos feitos.

3. **Impostos e taxas como % do preço:** ISS, Simples Nacional, etc. variam com o faturamento — colocá-los como custo fixo (como faz a CNCC) distorce a margem.

4. **Taxa de cartão como custo variável:** No Brasil atual, 80-90% dos pagamentos são no cartão; isso impacta diretamente a margem.

5. **Margem mínima alvo de 30%:** A live estabelece esse benchmark explicitamente. "Se seu concorrente cobra menos, ele provavelmente está no prejuízo."

6. **Pró-labore como custo de mercado, não valor pessoal:** O dentista deve se perguntar "quanto eu pagaria para contratar alguém para fazer o que eu faço?", e essa é a parte que vai no custo fixo. O que sobrar acima disso é lucro da empresa.

7. **Material difícil de itemizar vai para o custo fixo:** Luvas, máscaras, guardanapos — "não fique perdendo tempo calculando quanto usa por procedimento, coloque como custo fixo mensal."

8. **Ponto de equilíbrio explícito:** A planilha calcula quanto a clínica precisa faturar para pagar todos os custos fixos. Tudo acima é lucro líquido.

9. **Gestão de agenda:** Dentista com agenda ociosa tem lucratividade corroída mesmo com precificação correta.

### Exemplos numéricos concretos da live

- Clínica com R$ 55.000 de custo fixo e 3 cadeiras → custo hora R$ 144/cadeira
- Clínica com R$ 28.000 e 1 cadeira → custo hora R$ 22/hora; "custo saudável para 1 cadeira: R$ 25–30k"
- Dentista cobrando R$ 300 por raspagem (60 min) com custo hora R$ 22 → "menos de 1% de lucro"
- Meta: 30% de margem. Clareamento (180 min, R$ 1.600): 33% em 3h, quase 0% em 5h

### Objeções respondidas na live

- "Meu concorrente cobra menos" → ele provavelmente está no prejuízo
- "Não consigo 30% ainda" → coloque meta progressiva, aumente eficiência ao longo do ano
- "Não sei quanto tempo levo" → olhe na agenda os casos recentes, conte do início ao fim
- "Meu pró-labore é o que a contabilidade registra (R$ 1.200)" → não, isso não é seu salário real

---

## 3. O que o código atual realmente faz

### Implementado e funcionando

- Autenticação completa (cadastro, login, recuperação de senha)
- Configuração de custos fixos com os 4 componentes CNCC (base + depreciação + remuneração + retorno)
- Cálculo correto do custo fixo/minuto
- Cálculo correto do preço do procedimento (tempo × custo/min + custo variável)
- Break-even com e sem pró-labore no dashboard
- Listagem de procedimentos por especialidade com preço calculado e comparativo VRPO
- Edição de materiais e procedimentos
- Snapshots/histórico
- Exportação PDF e Excel
- Onboarding wizard
- Dashboard com cards informativos

### Divergências entre código e planilha original

- O código usa **12 meses** na depreciação (`anosDepreciacao * 12`), enquanto a planilha CNCC usa **11 meses** (com 1 mês de férias). Isso subestima levemente a depreciação.
- Os 14 itens padrão no seed têm nomes e valores diferentes dos 14 da planilha CNCC (foram generalizados/atualizados).
- O seed tem **30 materiais** representativos, não os ~130 da planilha CNCC.
- O seed tem **~40 procedimentos** representativos por especialidade, não os 200+ da planilha.
- Os valores VRPO de referência no seed (65 procedimentos) parecem ser estimativas, não os valores oficiais publicados pela CNCC.

### Totalmente ausente no código atual

- Divisão por cadeiras
- Desconto de ociosidade
- Impostos sobre faturamento como % do preço
- Taxa de cartão como custo variável
- Margem de lucro alvo por procedimento
- Cálculo de ponto de equilíbrio por procedimento
- Planilha de radiologia com custos fixos separados (FR-7 do PRD)
