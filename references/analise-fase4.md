# Fase 4 — Diagnóstico do Estado Atual

## Núcleo Essencial

| Área                                                | Status | Detalhe                                                                                                                                                               |
| --------------------------------------------------- | ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Configuração de custo fixo — itens base             | 🟡     | Formulário existe e funciona. Os 14 itens padrão no seed têm nomes e valores diferentes dos da CNCC (foram generalizados). Usuário pode adicionar itens customizados. |
| Configuração de custo fixo — número de cadeiras     | 🔴     | Não existe. Qualquer clínica com mais de 1 dentista calcula errado.                                                                                                   |
| Configuração de custo fixo — taxa de ocupação       | 🔴     | Não existe. Sistema assume 100% de ocupação para todos os usuários.                                                                                                   |
| Depreciação com 11 meses (CNCC)                     | 🔴     | Bug silencioso: código usa 12 meses. Pequeno impacto numérico, mas diverge da metodologia declarada.                                                                  |
| Remuneração profissional com encargos               | ✅     | Implementado corretamente: salário base + percFundoReserva + percInsalubridade + percImprevistos + férias + 13º.                                                      |
| Taxa de retorno sobre investimento                  | ✅     | Implementado corretamente.                                                                                                                                            |
| Impostos sobre faturamento como % do preço          | 🔴     | Não existe. ISS está implicitamente tratado como custo fixo (item 3 da CNCC), o que distorce a margem.                                                                |
| Taxa de cartão como % do preço                      | 🔴     | Não existe.                                                                                                                                                           |
| Margem de lucro por procedimento                    | 🔴     | Não existe. O sistema mostra preço calculado e diferença para VRPO, mas não a margem percentual.                                                                      |
| Indicador visual de margem (verde/amarelo/vermelho) | 🔴     | Não existe.                                                                                                                                                           |
| Custo de laboratório separado de materiais          | 🔴     | Não existe. Laboratório entra como material comum com divisor/consumo, o que não faz sentido semântico.                                                               |
| Seed completo — 200+ procedimentos VRPO reais       | 🔴     | ~40 procedimentos representativos com valores estimados.                                                                                                              |
| Seed completo — ~130 materiais reais                | 🔴     | 30 materiais representativos com preços aproximados.                                                                                                                  |
| Valores VRPO oficiais fidedignos                    | 🟡     | 65 referências no seed global, aparentemente estimadas para o MVP, não os valores oficiais da CNCC.                                                                   |
| Onboarding adaptativo por perfil                    | 🔴     | Wizard de 3 passos existe (primeiros-passos), mas é linear e não pergunta sobre perfil nem adapta a complexidade.                                                     |

---

## Diferencial Competitivo

| Área                                                       | Status | Detalhe                                                                                                                                               |
| ---------------------------------------------------------- | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Dashboard de diagnóstico ativo                             | 🟡     | Cards com custo/min, break-even, top procedimentos existem. Faltam alertas automáticos, narrativa financeira e chamadas para ação diretas.            |
| Break-even mensal da clínica                               | ✅     | Implementado e exibido no dashboard (semProLabore, comProLabore).                                                                                     |
| Alertas de procedimentos no vermelho                       | 🔴     | Não existe. A lista "procedimentos com menor margem vs. VRPO" existe, mas não é um alerta ativo pós-save.                                             |
| Sugestão de preço mínimo para 30% de margem                | 🔴     | Não existe.                                                                                                                                           |
| Simulador de cenários                                      | 🔴     | Não existe.                                                                                                                                           |
| Comparativo VRPO como instrumento de negociação            | 🟡     | Página existe com tabela e filtros. Falta framing de "argumento para convênio" — hoje parece um julgamento (verde/vermelho) em vez de uma ferramenta. |
| Exportação PDF profissional para convênios                 | 🟡     | PDF existe com dados básicos. Falta a memória de cálculo metodológica (composição do custo fixo, encargos) que dá credibilidade técnica.              |
| Exportação Excel                                           | ✅     | Implementado.                                                                                                                                         |
| Histórico de snapshots                                     | ✅     | Implementado: criação, listagem, visualização, comparação com atual, limite de 10.                                                                    |
| Histórico com narrativa financeira (o que mudou e por quê) | 🔴     | Snapshots são fotografias passivas. Não há diff estruturado dos itens de custo que explique a variação.                                               |
| Interface responsiva / mobile                              | 🟡     | Tailwind responsivo implementado. Não foi validado sistematicamente em 375px com dados reais.                                                         |

---

## Fundação Técnica e Produto

| Área                                                      | Status | Detalhe                                                                                        |
| --------------------------------------------------------- | ------ | ---------------------------------------------------------------------------------------------- |
| Autenticação (cadastro, login, logout)                    | ✅     | Completo, incluindo recuperação de senha.                                                      |
| Multitenancy por userId                                   | ✅     | Todos os modelos têm userId. Ownership verificado nas server actions.                          |
| Listagem de procedimentos por especialidade               | ✅     | 11 especialidades, filtro, busca, código e preço calculado.                                    |
| Detalhe e edição de procedimento                          | ✅     | Tempo editável, materiais editáveis, recálculo automático.                                     |
| Gerenciamento de materiais                                | ✅     | Listagem, edição de preço, adicionar/remover customizados, proteção contra exclusão se em uso. |
| Proteção contra exclusão de itens em uso                  | ✅     | deleteMaterial bloqueia se há ProcedimentoMaterial vinculado.                                  |
| Arquitetura Clean (domain/application/infra/presentation) | ✅     | Bem estruturada e consistente.                                                                 |
| TypeScript estrito                                        | ✅     |                                                                                                |
| Validação com Zod nas server actions                      | ✅     |                                                                                                |
| Área administrativa para atualizar VRPO                   | 🔴     | Não existe. Atualizar valores VRPO requer deploy com novo seed.                                |

---

## Resumo Executivo do Diagnóstico

O MVP tem uma fundação técnica sólida — arquitetura limpa, autenticação, CRUD completo, exportações funcionando. A estrutura de código é de qualidade e não vai precisar de reescrita.

Os problemas críticos estão concentrados em duas categorias. A primeira é de **precisão do cálculo**: cadeiras, taxa de ocupação, impostos como % do preço e depreciação com 11 meses são erros que fazem o sistema produzir números errados para uma fração significativa dos usuários reais. Um dentista com sócio que usa o sistema hoje obtém um custo/minuto que pode ser o dobro do correto. A segunda é de **conteúdo inicial**: 30 materiais e 40 procedimentos estimados significam que o dentista que entra no sistema e não encontra seus procedimentos vai embora antes de sentir o valor.

O que está bem é a arquitetura de cálculo central (a fórmula em si), a infraestrutura de persistência e exportação, e a estrutura de comparação VRPO. Tudo isso é reutilizável — as correções são incrementais, não substitutivas.
