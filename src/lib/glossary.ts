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
    friendly: 'TODO(#20)',
    tooltip: 'TODO(#20): Valor Referencial de Procedimento Odontológico',
  },
  CNCC: {
    short: 'CNCC',
    friendly: 'TODO(#20)',
    tooltip: 'TODO(#20): Comissão Nacional de Convênios e Credenciamentos',
  },
  ociosidade: {
    short: 'ociosidade',
    friendly: 'TODO(#20)',
    tooltip:
      '% do tempo produtivo não utilizado. Reduz os minutos úteis disponíveis e eleva o custo por minuto.',
  },
  proLabore: {
    short: 'pró-labore',
    friendly: 'seu salário',
    tooltip:
      'Remuneração do dentista proprietário — o salário que você paga a si mesmo, incluído no cálculo do break-even.',
  },
  insalubridade: {
    short: 'insalubridade',
    friendly: 'TODO(#20)',
    tooltip:
      'Adicional obrigatório por lei (NR-15): 40% do salário mínimo para profissionais expostos a risco biológico, como odontólogos.',
  },
  fundoReserva: {
    short: 'fundo de reserva',
    friendly: 'TODO(#20)',
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
    friendly: 'TODO(#20)',
    tooltip: 'TODO(#20): Imposto Sobre Serviços municipal',
  },
  simplesNacional: {
    short: 'Simples Nacional',
    friendly: 'TODO(#20)',
    tooltip: 'TODO(#20): regime tributário simplificado',
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
