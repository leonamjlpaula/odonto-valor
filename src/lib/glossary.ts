export type TermKey =
  | 'VRPO'
  | 'CNCC'
  | 'ociosidade'
  | 'proLabore'
  | 'insalubridade'
  | 'fundoReserva'
  | 'breakEven'
  | 'ISS'
  | 'simplesNacional'
  | 'depreciacao'
  | 'taxaRetorno';

export interface GlossaryEntry {
  short: string;
  friendly: string;
  tooltip: string;
}

export const GLOSSARY: Record<TermKey, GlossaryEntry> = {
  VRPO: {
    short: 'VRPO',
    friendly: 'Tabela de Referência dos Convênios',
    tooltip:
      'Valores de Referência para Procedimentos Odontológicos — tabela usada pelos convênios como base de pagamento. Útil para comparar o que você cobra com o que o convênio paga.',
  },
  CNCC: {
    short: 'CNCC',
    friendly: 'Metodologia Oficial de Precificação',
    tooltip:
      'Comissão Nacional de Convênios e Credenciamentos — define a metodologia oficial para calcular o custo de cada procedimento, incluindo depreciação de equipamentos e remuneração profissional.',
  },
  ociosidade: {
    short: 'ociosidade',
    friendly: 'Tempo sem atendimento',
    tooltip:
      'Percentual do horário de trabalho em que a cadeira fica vazia. Uma ociosidade de 20% significa que 1h36min de cada 8h disponíveis não tem paciente — elevando o custo por minuto dos demais procedimentos.',
  },
  proLabore: {
    short: 'pró-labore',
    friendly: 'seu salário',
    tooltip:
      'Remuneração do dentista proprietário — o salário que você paga a si mesmo, incluído no cálculo do break-even.',
  },
  insalubridade: {
    short: 'insalubridade',
    friendly: 'Adicional de risco à saúde',
    tooltip:
      'Adicional obrigatório por lei (NR-15): 40% do salário mínimo para profissionais expostos a risco biológico, como odontólogos.',
  },
  fundoReserva: {
    short: 'fundo de reserva',
    friendly: 'Reserva para imprevistos',
    tooltip: '~11% do salário provisionado para cobrir 13º salário, férias e eventuais rescisões.',
  },
  breakEven: {
    short: 'break-even',
    friendly: 'ponto de equilíbrio',
    tooltip:
      'Faturamento mínimo necessário para cobrir todos os custos sem lucro. Abaixo disso você está no prejuízo.',
  },
  ISS: {
    short: 'ISS',
    friendly: 'Imposto sobre serviços',
    tooltip:
      'Imposto municipal cobrado sobre os serviços prestados. Varia de 2% a 5% conforme o município. Quem está no Simples Nacional já tem o ISS embutido na alíquota unificada.',
  },
  simplesNacional: {
    short: 'Simples Nacional',
    friendly: 'Regime tributário simplificado',
    tooltip:
      'Sistema que unifica vários impostos em uma guia única. Para consultórios odontológicos, a alíquota começa em 6% sobre o faturamento e pode chegar a 16% conforme o crescimento. Esse percentual impacta o preço mínimo de cada procedimento.',
  },
  depreciacao: {
    short: 'depreciação',
    friendly: 'desgaste dos equipamentos',
    tooltip:
      'O custo dos seus equipamentos dividido pela vida útil. Ex: cadeira de R$ 10.000 em 10 anos = R$ 1.000/ano incluídos no seu custo por minuto.',
  },
  taxaRetorno: {
    short: 'taxa de retorno',
    friendly: 'lucro sobre o investimento',
    tooltip:
      'Percentual do seu investimento em equipamentos que o sistema reserva como lucro do capital por ano. Padrão CNCC: 3% ao ano por 3 anos.',
  },
};
