# Fase 3 — Visão de Produto Final

O Precifica tem um posicionamento claro que deve guiar toda decisão de produto: **"Em 10 minutos você sabe se está no lucro ou no prejuízo em cada procedimento."** Não é uma planilha digital — é um diagnóstico financeiro contínuo da clínica, acessível para quem nunca abriu uma planilha de precificação. O onboarding detecta o perfil (solo vs. clínica com sócios) e adapta a complexidade desde a primeira tela.

---

## Núcleo Essencial — sem isso o produto está matematicamente errado ou não cumpre a promessa central

### 1. Configuração de custo fixo correta e completa

O formulário atual está incompleto em três pontos críticos que distorcem o cálculo para qualquer usuário real. Primeiro, o campo de **número de cadeiras**: sem ele, o dentista que divide o aluguel e a secretária com um sócio calcula como se pagasse tudo sozinho — o custo por minuto sai o dobro do real. Segundo, o campo de **taxa de ocupação** (padrão 80%): o sistema hoje assume que o dentista usa 100% das horas disponíveis, o que é falso para quase todos. Um dentista com 20% de agenda ociosa que não sabe disso acha que está precificando correto quando na verdade a ociosidade está corroendo toda a margem calculada. Terceiro, a **depreciação deve usar 11 meses**, não 12, conforme a metodologia CNCC original — o código atual tem esse bug silencioso.

### 2. Custos variáveis de venda como percentual do preço

Impostos (ISS/Simples, entre 6% e 16% dependendo do regime e faixa) e taxa de cartão (~3-5%) precisam sair do custo fixo e entrar como percentuais sobre o preço de cada procedimento. Hoje eles estão tratados como custo fixo (item 3 da CNCC), o que produz uma margem inflada: o dentista acha que ganha R$ 200 num procedimento mas depois de impostos e cartão sobram R$ 155. A configuração deve ter campos: "% de impostos sobre faturamento" e "% de taxa de cartão médio" — aplicados automaticamente no cálculo de margem de todos os procedimentos.

### 3. Margem de lucro visível em todo lugar

O produto hoje mostra o preço calculado e a diferença para o VRPO. Falta o número que mais importa: **a margem de lucro percentual do procedimento**. Deve aparecer ao lado do preço em toda listagem e no detalhe. O indicador visual é simples: verde (≥30%), amarelo (10–29%), vermelho (<10% ou negativo). Isso transforma "você cobra R$ 280 por uma restauração" em "você cobra R$ 280 por uma restauração e ganha 12% disso — está no amarelo, o preço mínimo para 30% seria R$ 340".

### 4. Custo de laboratório como categoria separada

Para próteses, coroas, facetas e ortodontia, o custo do laboratório é frequentemente maior que todos os materiais consumíveis juntos. Misturá-lo com resinas e anestésicos na mesma tabela obriga o dentista a fazer um malabarismo manual para cada procedimento. O schema precisa de um campo `custoLaboratorio` no `ProcedimentoMaterial` ou um tipo distinto de item, com campo de valor absoluto (não divisor/consumo, que não faz sentido para laboratório).

### 5. Seed completo e fidedigno

O MVP tem 30 materiais e ~40 procedimentos com valores estimados. Para o produto funcionar como prometido desde o primeiro login — "em 10 minutos você sabe seus preços" — o dentista não pode precisar cadastrar 80% dos seus procedimentos manualmente. O seed precisa dos 200+ procedimentos VRPO reais com tempos e composições de materiais baseados na planilha original, dos ~130 materiais com preços aproximados do mercado atual, e dos valores VRPO oficiais (não estimativas). Sem isso, o onboarding falha na primeira semana de uso real.

### 6. Onboarding adaptativo por perfil

A primeira pergunta após o cadastro deve ser: "Você atende sozinho(a) ou divide o espaço com outros dentistas?" A resposta ramifica a configuração: perfil solo pula o campo de cadeiras e vai direto para o custo fixo simplificado; perfil clínica abre o campo de cadeiras e o conceito é explicado com um exemplo ("seu aluguel de R$ 4.000 dividido por 2 cadeiras = R$ 2.000 de custo por cadeira").

---

## Diferencial Competitivo — o que faz um dentista escolher este produto em vez de qualquer alternativa

### 1. Dashboard de diagnóstico, não de estatísticas

O dashboard atual mostra números corretos mas passivos — custo por minuto, total de procedimentos, top 5 mais caros. O diferencial é transformar isso em diagnóstico ativo: **"3 procedimentos estão no vermelho hoje"** com link direto para ver quais são e o que ajustar; **"seu custo fixo subiu 8% em 3 meses"** com o item que mais cresceu; **"com sua taxa de ocupação atual, você precisa faturar R$ X por semana para cobrir todos os custos"**. O dentista abre o dashboard e sabe em 30 segundos o que precisa de atenção, sem precisar explorar o sistema.

### 2. Simulador de cenários

Esta é a feature que transforma o produto de "calculadora" em "ferramenta de decisão". O simulador responde perguntas do tipo: "E se eu contratar um segundo dentista associado — como meu custo por cadeira muda?", "E se eu aumentar o tempo médio da minha consulta de 30 para 45 minutos — quantos procedimentos vira prejuízo?", "E se o aluguel subir R$ 500 — qual é o impacto na margem dos meus 10 procedimentos mais feitos?" O usuário ajusta variáveis num painel lateral e vê o impacto nos procedimentos em tempo real, sem salvar nada. Nenhuma planilha faz isso com essa fluidez.

### 3. Alerta automático de preço mínimo

Toda vez que o dentista salva qualquer configuração de custo (custo fixo, preço de material, tempo de procedimento), o sistema roda o cálculo nos bastidores e gera alertas apenas para os procedimentos que cruzaram um limiar: "Após essa alteração, 5 procedimentos ficaram abaixo de 30% de margem. Quer ver a sugestão de preço mínimo para cada um?" O preço sugerido é calculado de trás para frente: "para 30% de margem neste procedimento, você precisaria cobrar R$ X". O dentista aceita ou ignora — mas sabe.

### 4. Exportação profissional para convênios e planos

O PDF atual é funcional mas genérico. O diferencial é um PDF de credenciamento que inclui a metodologia CNCC explícita — mostrando a composição do custo fixo por minuto, a memória de cálculo de cada procedimento, e a comparação com o VRPO nacional. O dentista leva para a reunião com o convênio e tem argumentação técnica para justificar seus preços. Isso tem valor direto e mensurável: um reajuste de 15% em um convênio que representa 30% do faturamento paga anos de assinatura.

### 5. Histórico com narrativa financeira

Os snapshots hoje são fotografia passiva. O diferencial é uma narrativa: "Em janeiro seu custo por minuto era R$ 2,47. Hoje é R$ 2,89. Os principais responsáveis foram: aluguel (+R$ 800), energia elétrica (+R$ 150)." A linha do tempo visual mostra a evolução e o dentista entende o que está pressionando seus custos ao longo do tempo.

---

## Nice-to-Have de Longo Prazo — valor real, mas só faz sentido depois que o núcleo está sólido

**Calculadora de pacotes e fidelização:** quanto cobrar por um pacote anual (limpeza semestral + manutenção + emergência) preservando a margem mínima. A live mostrou que essa é uma dúvida frequente e nenhuma planilha responde diretamente.

**Break-even por procedimento:** "você precisa fazer X canais radiculares por mês para que a endodontia se pague." Útil para planejamento de agenda e decisão de especialização.

**Benchmarks anonimizados de mercado:** com base na base de usuários do Precifica, mostrar distribuição de preços por procedimento e região. "80% dos dentistas com perfil similar ao seu cobram entre R$ X e R$ Y por este procedimento." Requer escala.

**Metas de faturamento:** "para atingir 30% de margem líquida com sua estrutura atual, seu faturamento mensal precisa ser ao menos R$ X. Você está em Y% dessa meta."

**Atualização automática de referências:** os valores VRPO são publicados periodicamente pela CNCC. Uma área administrativa para atualizar esses valores sem deploy, e uma notificação para os usuários quando uma nova tabela entra em vigor.

**Notificações de revisão por inflação:** "faz 6 meses que você não atualiza seus custos fixos. O IPCA acumulou 4,2% nesse período — seus procedimentos podem estar subprecificados."

**Integração com agenda:** calcular a taxa de ocupação real automaticamente a partir de Google Calendar ou sistema de agendamento, em vez de o dentista estimar.

**Relatório para contador:** DRE simplificada por especialidade, custo por cadeira, margem por categoria de procedimento — o que o contador precisa para fazer a gestão tributária.

**Múltiplos consultórios:** para o dentista que atende em dois endereços com custos fixos diferentes e quer saber a precificação correta para cada um.
