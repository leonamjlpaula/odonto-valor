import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ─── Especialidades (11) ──────────────────────────────────────────────────────

const ESPECIALIDADES = [
  { codigo: 'diagnostico', nome: 'Diagnóstico', faixaInicio: 100, faixaFim: 190 },
  { codigo: 'radiologia', nome: 'Radiologia', faixaInicio: 200, faixaFim: 390 },
  { codigo: 'testes-exames', nome: 'Testes e Exames', faixaInicio: 400, faixaFim: 490 },
  { codigo: 'prevencao', nome: 'Prevenção', faixaInicio: 500, faixaFim: 590 },
  { codigo: 'odontopediatria', nome: 'Odontopediatria', faixaInicio: 600, faixaFim: 890 },
  { codigo: 'dentistica', nome: 'Dentística', faixaInicio: 900, faixaFim: 1990 },
  { codigo: 'endodontia', nome: 'Endodontia', faixaInicio: 2000, faixaFim: 2990 },
  { codigo: 'periodontia', nome: 'Periodontia', faixaInicio: 3000, faixaFim: 3990 },
  { codigo: 'protese', nome: 'Prótese', faixaInicio: 4000, faixaFim: 4990 },
  { codigo: 'cirurgia', nome: 'Cirurgia', faixaInicio: 5000, faixaFim: 5990 },
  { codigo: 'ortodontia', nome: 'Ortodontia', faixaInicio: 6000, faixaFim: 6990 },
];

// ─── VRPO Reference values (65+ procedures) ───────────────────────────────────
// Values based on VRPO (Valores Referenciais para Procedimentos Odontológicos)
// Reference table — adjust to the latest CFO publication when available.

const VRPO_REFERENCIAS = [
  // Diagnóstico (100–190)
  { codigo: '100', valorReferencia: 150.0 }, // Consulta / Exame Clínico
  { codigo: '110', valorReferencia: 120.0 }, // Plano de Tratamento
  { codigo: '120', valorReferencia: 180.0 }, // Consulta de Urgência / Emergência
  { codigo: '130', valorReferencia: 200.0 }, // Exame Clínico para Laudo / Perícia
  { codigo: '140', valorReferencia: 85.0 }, // Orientação de Saúde Bucal
  { codigo: '150', valorReferencia: 120.0 }, // Documentação Fotográfica Inicial
  { codigo: '160', valorReferencia: 100.0 }, // Avaliação de Risco em Saúde Bucal
  { codigo: '170', valorReferencia: 180.0 }, // Segunda Opinião / Revisão de Caso Clínico
  // Radiologia (200–390)
  { codigo: '200', valorReferencia: 35.0 }, // Radiografia Periapical
  { codigo: '210', valorReferencia: 45.0 }, // Radiografia Interproximal (Bite-wing)
  { codigo: '220', valorReferencia: 85.0 }, // Radiografia Oclusal
  { codigo: '230', valorReferencia: 280.0 }, // Radiografia Panorâmica — interpretação
  { codigo: '240', valorReferencia: 350.0 }, // Telerradiografia Lateral — interpretação
  { codigo: '250', valorReferencia: 120.0 }, // Série Periapical Completa (4 filmes)
  { codigo: '260', valorReferencia: 480.0 }, // CBCT — laudagem
  { codigo: '270', valorReferencia: 45.0 }, // Radiografia Periapical Digital (RVG)
  { codigo: '280', valorReferencia: 40.0 }, // Radiografia de Tecidos Moles
  { codigo: '290', valorReferencia: 95.0 }, // Montagem de Documentação Radiográfica
  { codigo: '300', valorReferencia: 55.0 }, // Radiografia Carpal
  { codigo: '310', valorReferencia: 200.0 }, // Série Periapical Ampliada (8 filmes)
  // Testes e Exames (400–490)
  { codigo: '400', valorReferencia: 85.0 }, // Teste de Vitalidade Pulpar
  { codigo: '410', valorReferencia: 120.0 }, // Teste de Sensibilidade Dentinária
  { codigo: '420', valorReferencia: 95.0 }, // Sondagem Periodontal (Periodontograma)
  { codigo: '430', valorReferencia: 75.0 }, // Tomada de Cor / Biometria Dental
  { codigo: '440', valorReferencia: 95.0 }, // Fluorescência de Cárie (DIAGNOdent)
  { codigo: '450', valorReferencia: 130.0 }, // Análise Oclusal
  { codigo: '460', valorReferencia: 110.0 }, // Teste de Fluxo Salivar / Salivometria
  // Prevenção (500–590)
  { codigo: '500', valorReferencia: 95.0 }, // Profilaxia Dental
  { codigo: '510', valorReferencia: 120.0 }, // Raspagem Supra/Subgengival por Sextante
  { codigo: '520', valorReferencia: 65.0 }, // Aplicação Tópica de Flúor
  { codigo: '530', valorReferencia: 95.0 }, // Selante (por dente)
  { codigo: '540', valorReferencia: 150.0 }, // Orientação de Higiene Oral Individualizada
  { codigo: '550', valorReferencia: 85.0 }, // Aplicação de Dessensibilizante Dentinário
  { codigo: '560', valorReferencia: 110.0 }, // Profilaxia com Jato de Bicarbonato
  { codigo: '570', valorReferencia: 280.0 }, // Raspagem Supragengival (4 sextantes)
  { codigo: '580', valorReferencia: 380.0 }, // Remoção de Tártaro — Boca Toda (6 sextantes)
  { codigo: '590', valorReferencia: 75.0 }, // Aplicação de Flúor em Moldeira (consultório)
  { codigo: '595', valorReferencia: 95.0 }, // Instrução de Higiene — Necessidades Especiais
  { codigo: '598', valorReferencia: 130.0 }, // Controle Periodontal (Manutenção de Suporte)
  // Odontopediatria (600–890)
  { codigo: '600', valorReferencia: 120.0 }, // Atendimento Odontopediátrico / Consulta
  { codigo: '610', valorReferencia: 85.0 }, // Restauração em Dente Decíduo — 1 Face
  { codigo: '611', valorReferencia: 120.0 }, // Restauração em Dente Decíduo — 2 Faces
  { codigo: '620', valorReferencia: 150.0 }, // Pulpotomia em Dente Decíduo
  { codigo: '630', valorReferencia: 180.0 }, // Pulpectomia em Dente Decíduo
  { codigo: '640', valorReferencia: 95.0 }, // Exodontia de Dente Decíduo
  { codigo: '650', valorReferencia: 110.0 }, // Aplicação de Flúor em Moldeira (Preventivo)
  { codigo: '660', valorReferencia: 130.0 }, // Selante Oclusal em Dente Decíduo
  { codigo: '670', valorReferencia: 350.0 }, // Coroa de Aço Inoxidável em Dente Decíduo
  { codigo: '680', valorReferencia: 85.0 }, // Controle de Cárie de Mamadeira / Remineralização
  { codigo: '690', valorReferencia: 85.0 }, // Tratamento de Cárie Incipiente (Remineralização)
  { codigo: '700', valorReferencia: 350.0 }, // Instalação de Mantenedor de Espaço Fixo
  { codigo: '710', valorReferencia: 150.0 }, // Controle e Remoção de Hábito de Sucção
  { codigo: '720', valorReferencia: 150.0 }, // Exodontia de Dente Decíduo com Complicação
  { codigo: '730', valorReferencia: 95.0 }, // Restauração com Ionômero de Vidro em Decíduo
  { codigo: '740', valorReferencia: 180.0 }, // Coroa de Policarbonato Provisória
  { codigo: '750', valorReferencia: 80.0 }, // Selante Ionomérico de Fossas e Fissuras
  { codigo: '760', valorReferencia: 180.0 }, // Controle de Bruxismo em Criança
  { codigo: '770', valorReferencia: 120.0 }, // Aconselhamento em Ortodontia Preventiva
  { codigo: '780', valorReferencia: 120.0 }, // Emergência Odontopediátrica
  // Dentística (900–1990)
  { codigo: '900', valorReferencia: 185.0 }, // Restauração de Resina Composta — 1 Face
  { codigo: '910', valorReferencia: 240.0 }, // Restauração de Resina Composta — 2 Faces
  { codigo: '920', valorReferencia: 290.0 }, // Restauração de Resina Composta — 3 Faces
  { codigo: '930', valorReferencia: 340.0 }, // Restauração de Resina Composta — 4+ Faces
  { codigo: '940', valorReferencia: 155.0 }, // Restauração de Amálgama — 1 Face
  { codigo: '950', valorReferencia: 200.0 }, // Restauração de Amálgama — 2 Faces
  { codigo: '960', valorReferencia: 245.0 }, // Restauração de Amálgama — 3 Faces
  { codigo: '970', valorReferencia: 450.0 }, // Clareamento Dental Caseiro (por arco)
  { codigo: '980', valorReferencia: 650.0 }, // Clareamento Dental de Consultório (boca toda)
  { codigo: '990', valorReferencia: 120.0 }, // Restauração de Ionômero de Vidro
  { codigo: '1000', valorReferencia: 850.0 }, // Faceta de Resina Composta Direta
  { codigo: '1010', valorReferencia: 1200.0 }, // Faceta Indireta (Porcelana / E-Max) — Cimentação
  { codigo: '1020', valorReferencia: 320.0 }, // Proteção Pulpar Direta
  { codigo: '1030', valorReferencia: 150.0 }, // Proteção Pulpar Indireta
  { codigo: '1040', valorReferencia: 380.0 }, // Recontorno Estético (Fechamento de Diastema)
  { codigo: '1050', valorReferencia: 175.0 }, // Restauração Cervical — Classe V
  { codigo: '1060', valorReferencia: 680.0 }, // Inlay / Onlay de Resina ou Cerâmica — Cimentação
  { codigo: '1070', valorReferencia: 850.0 }, // Overlay (Cobertura Cuspídea) — Cimentação
  { codigo: '1080', valorReferencia: 130.0 }, // Recobrimento de Colo com Ionômero
  { codigo: '1090', valorReferencia: 280.0 }, // Restauração com Amálgama em Dente Posterior (MOD)
  { codigo: '1100', valorReferencia: 150.0 }, // Desgaste Seletivo / Ajuste Oclusal
  { codigo: '1110', valorReferencia: 280.0 }, // Clareamento Dental Caseiro — Dente Não Vital
  { codigo: '1120', valorReferencia: 580.0 }, // Restauração de Resina Composta Indireta — Cimentação
  { codigo: '1130', valorReferencia: 120.0 }, // Tratamento de Hipersensibilidade Dentinária
  { codigo: '1140', valorReferencia: 280.0 }, // Aplicação de Resina Infiltrante (Icon)
  { codigo: '1150', valorReferencia: 180.0 }, // Remoção de Manchas Intrínsecas — Microabrasão
  { codigo: '1160', valorReferencia: 320.0 }, // Restauração de Fratura Coronária (> 2 faces)
  { codigo: '1170', valorReferencia: 350.0 }, // Clareamento de Dente Não Vital (Interno)
  { codigo: '1180', valorReferencia: 350.0 }, // Restauração de Erosão Dentária (Classe III/IV)
  { codigo: '1190', valorReferencia: 750.0 }, // Cerômero — Cimentação
  { codigo: '1200', valorReferencia: 320.0 }, // Faceta Direta de Compômero
  { codigo: '1210', valorReferencia: 285.0 }, // Restauração de Classe IV (Ângulo Incisal)
  // Endodontia (2000–2990)
  { codigo: '2000', valorReferencia: 380.0 }, // Tratamento Endodôntico — Unirradicular
  { codigo: '2010', valorReferencia: 450.0 }, // Tratamento Endodôntico — Birradicular
  { codigo: '2020', valorReferencia: 550.0 }, // Tratamento Endodôntico — Trirradicular
  { codigo: '2030', valorReferencia: 680.0 }, // Tratamento Endodôntico — Multirradicular (4+)
  { codigo: '2040', valorReferencia: 480.0 }, // Cirurgia Parendodôntica — Anterior
  { codigo: '2050', valorReferencia: 550.0 }, // Apicectomia com Obturação Retrógrada
  { codigo: '2060', valorReferencia: 350.0 }, // Curetagem Periapical
  { codigo: '2070', valorReferencia: 550.0 }, // Retratamento Endodôntico — Unirradicular
  { codigo: '2080', valorReferencia: 750.0 }, // Retratamento Endodôntico — Multirradicular
  { codigo: '2090', valorReferencia: 950.0 }, // Cirurgia Parendodôntica — Posterior
  { codigo: '2100', valorReferencia: 480.0 }, // Obturação Retrógrada com MTA
  { codigo: '2110', valorReferencia: 250.0 }, // Urgência Endodôntica (Abertura de Câmara)
  { codigo: '2120', valorReferencia: 180.0 }, // Curativo Endodôntico Intracanal (por sessão)
  { codigo: '2130', valorReferencia: 420.0 }, // Biopulpectomia (Trauma / Pulpa Vital)
  { codigo: '2140', valorReferencia: 680.0 }, // Apicificação com MTA (Dente Imaturo)
  { codigo: '2150', valorReferencia: 580.0 }, // Obturação com Guta-Percha Termoplastificada
  { codigo: '2160', valorReferencia: 350.0 }, // Curetagem Periapical
  { codigo: '2170', valorReferencia: 320.0 }, // Instalação de Espigão de Fibra (Endodôntico)
  { codigo: '2180', valorReferencia: 180.0 }, // Sessões Intermediárias de Trat. Endodôntico
  // Periodontia (3000–3990)
  { codigo: '3000', valorReferencia: 280.0 }, // Raspagem e Alisamento Radicular por Sextante
  { codigo: '3010', valorReferencia: 1680.0 }, // Raspagem Total — 6 Sextantes (Boca Toda)
  { codigo: '3020', valorReferencia: 450.0 }, // Cirurgia Periodontal a Retalho por Sextante
  { codigo: '3030', valorReferencia: 350.0 }, // Gengivectomia
  { codigo: '3040', valorReferencia: 650.0 }, // Cirurgia de Recobrimento Radicular
  { codigo: '3050', valorReferencia: 750.0 }, // Enxerto Ósseo Guiado (com Membrana)
  { codigo: '3060', valorReferencia: 420.0 }, // Curetagem Subgengival por Sextante
  { codigo: '3070', valorReferencia: 180.0 }, // Aplicação de Clorexidina Subgengival
  { codigo: '3080', valorReferencia: 850.0 }, // Cirurgia a Retalho Mucogengival
  { codigo: '3090', valorReferencia: 450.0 }, // Frenectomia Labial Superior
  { codigo: '3100', valorReferencia: 480.0 }, // Frenectomia Lingual
  { codigo: '3110', valorReferencia: 950.0 }, // Enxerto de Tecido Conjuntivo Subepitelial
  { codigo: '3120', valorReferencia: 680.0 }, // Aumento de Coroa Clínica (Cirúrgico)
  { codigo: '3130', valorReferencia: 220.0 }, // Manutenção Periodontal (Visita de Suporte)
  { codigo: '3140', valorReferencia: 450.0 }, // Raspagem com Ultrassom — Boca Toda
  { codigo: '3150', valorReferencia: 650.0 }, // Cirurgia Óssea Ressectiva por Sextante
  { codigo: '3160', valorReferencia: 1200.0 }, // Regeneração Tecidual Guiada (RTG)
  { codigo: '3170', valorReferencia: 1500.0 }, // Tratamento com Proteína de Matriz de Esmalte
  { codigo: '3180', valorReferencia: 680.0 }, // Tratamento de Periimplantite (por sessão)
  { codigo: '3190', valorReferencia: 95.0 }, // Controle de Placa / Orientação Avançada
  // Prótese (4000–4990)
  { codigo: '4000', valorReferencia: 950.0 }, // Coroa de Porcelana sobre Metal (PFM)
  { codigo: '4010', valorReferencia: 1200.0 }, // Coroa Full Porcelana (Zircônia / E-Max)
  { codigo: '4020', valorReferencia: 650.0 }, // Coroa Provisória Direta (por dente)
  { codigo: '4030', valorReferencia: 2800.0 }, // Prótese Parcial Fixa (PPF — 3 Unidades)
  { codigo: '4040', valorReferencia: 980.0 }, // Prótese Total Superior — Entrega
  { codigo: '4050', valorReferencia: 980.0 }, // Prótese Total Inferior — Entrega
  { codigo: '4060', valorReferencia: 1800.0 }, // PPR — até 4 Elementos
  { codigo: '4070', valorReferencia: 1500.0 }, // PPR — 5 ou mais Elementos
  { codigo: '4080', valorReferencia: 850.0 }, // Reembasamento de Prótese Total
  { codigo: '4090', valorReferencia: 1100.0 }, // Conserto de Prótese Total
  { codigo: '4100', valorReferencia: 1800.0 }, // Coroa sobre Implante (Zircônia) — Cimentação
  { codigo: '4110', valorReferencia: 1500.0 }, // Coroa sobre Implante (PFM) — Cimentação
  { codigo: '4120', valorReferencia: 850.0 }, // Placa Miorrelaxante Total (Bruxismo)
  { codigo: '4130', valorReferencia: 180.0 }, // Moldeira de Clareamento (por arco)
  { codigo: '4140', valorReferencia: 750.0 }, // Inlay / Onlay de Porcelana — Cimentação
  { codigo: '4150', valorReferencia: 1800.0 }, // Prótese Adesiva Maryland Bridge — Cimentação
  { codigo: '4160', valorReferencia: 3500.0 }, // Overdenture sobre 2 Implantes — Entrega
  { codigo: '4170', valorReferencia: 480.0 }, // Núcleo Metálico Fundido (NMF) — Cimentação
  { codigo: '4180', valorReferencia: 1200.0 }, // Faceta de Porcelana (por dente) — Cimentação
  { codigo: '4190', valorReferencia: 1200.0 }, // Prótese Total Imediata — Entrega e Adaptação
  { codigo: '4200', valorReferencia: 2400.0 }, // Prótese Total Bimaxilar (Par) — Entrega
  { codigo: '4210', valorReferencia: 280.0 }, // Cimentação Definitiva de Prótese (por unidade)
  { codigo: '4220', valorReferencia: 380.0 }, // Provisório de Longa Duração (Bisacrílico)
  { codigo: '4230', valorReferencia: 350.0 }, // Sobremoldagem / Liner de Prótese
  { codigo: '4240', valorReferencia: 280.0 }, // Moldagem de Precisão com Silicona de Adição
  // Cirurgia (5000–5990)
  { codigo: '5000', valorReferencia: 280.0 }, // Exodontia Simples
  { codigo: '5010', valorReferencia: 450.0 }, // Exodontia com Retalho (por elemento)
  { codigo: '5020', valorReferencia: 680.0 }, // Exodontia de Dente Incluso
  { codigo: '5030', valorReferencia: 850.0 }, // Exodontia de Dente Impactado (Siso Incluso)
  { codigo: '5040', valorReferencia: 380.0 }, // Frenectomia Labial
  { codigo: '5050', valorReferencia: 450.0 }, // Alveoloplastia por Região
  { codigo: '5060', valorReferencia: 550.0 }, // Remoção de Cisto / Biópsia Incisional
  { codigo: '5070', valorReferencia: 350.0 }, // Drenagem de Abscesso
  { codigo: '5080', valorReferencia: 420.0 }, // Instalação de Implante Dentário
  { codigo: '5090', valorReferencia: 350.0 }, // Reabertura de Implante (2° Estágio)
  { codigo: '5100', valorReferencia: 1800.0 }, // Enxerto Ósseo em Bloco (Autógeno)
  { codigo: '5110', valorReferencia: 1500.0 }, // Levantamento de Seio Maxilar (Mini — Crestal)
  { codigo: '5120', valorReferencia: 2500.0 }, // Levantamento de Seio Maxilar (Externo)
  { codigo: '5130', valorReferencia: 480.0 }, // Exodontia Múltipla (até 3 dentes)
  { codigo: '5140', valorReferencia: 680.0 }, // Exodontia Múltipla (4 ou mais dentes)
  { codigo: '5150', valorReferencia: 750.0 }, // Exposição Cirúrgica de Dente Incluso
  { codigo: '5160', valorReferencia: 750.0 }, // Remoção de Tórus Palatino
  { codigo: '5170', valorReferencia: 680.0 }, // Remoção de Tórus Mandibular
  { codigo: '5180', valorReferencia: 850.0 }, // Sulcoplastia
  { codigo: '5190', valorReferencia: 280.0 }, // Curetagem Alveolar Pós-Exodontia (Alveolite)
  { codigo: '5200', valorReferencia: 550.0 }, // Biópsia Excisional de Lesão
  { codigo: '5210', valorReferencia: 950.0 }, // Instalação de Enxerto Gengival Livre
  { codigo: '5220', valorReferencia: 480.0 }, // Frenectomia Lingual
  { codigo: '5230', valorReferencia: 180.0 }, // Exodontia de Dente Decíduo com Dificuldade
  { codigo: '5240', valorReferencia: 480.0 }, // Instalação de Mini-Implante Ortodôntico
  // Ortodontia (6000–6990)
  { codigo: '6000', valorReferencia: 350.0 }, // Instalação de Aparelho Ortodôntico Fixo Metálico
  { codigo: '6010', valorReferencia: 180.0 }, // Manutenção Mensal de Aparelho Ortodôntico
  { codigo: '6020', valorReferencia: 280.0 }, // Instalação de Aparelho Removível (Hawley)
  { codigo: '6030', valorReferencia: 850.0 }, // Instalação de Aparelho Funcional Ortopédico
  { codigo: '6040', valorReferencia: 150.0 }, // Contenção Ortodôntica Colada (por arco)
  { codigo: '6050', valorReferencia: 220.0 }, // Instalação de Alinhador Transparente (por arco)
  { codigo: '6060', valorReferencia: 1400.0 }, // Instalação de Aparelho Ortodôntico Estético
  { codigo: '6070', valorReferencia: 180.0 }, // Remoção de Aparelho Ortodôntico Fixo
  { codigo: '6080', valorReferencia: 750.0 }, // Expansão Rápida de Maxila — Instalação
  { codigo: '6090', valorReferencia: 95.0 }, // Manutenção de Aparelho Removível
  { codigo: '6100', valorReferencia: 45.0 }, // Colagem de Braquete Avulso (por braquete)
  { codigo: '6110', valorReferencia: 480.0 }, // Instalação de Mini-Implante Ortodôntico
  { codigo: '6120', valorReferencia: 350.0 }, // Placa de Contenção Removível — Entrega
  { codigo: '6130', valorReferencia: 95.0 }, // Reativação / Dobra de Fio Ortodôntico
  { codigo: '6140', valorReferencia: 850.0 }, // Instalação de Aparelho de Protração Maxilar
  { codigo: '6150', valorReferencia: 1300.0 }, // Instalação de Aparelho Autoligado
  { codigo: '6160', valorReferencia: 280.0 }, // Documentação Ortodôntica
  { codigo: '6170', valorReferencia: 180.0 }, // Consulta de Ortopedia Funcional dos Maxilares
  { codigo: '6180', valorReferencia: 350.0 }, // Instalação de Aparelho Elástico de Contenção
  { codigo: '6190', valorReferencia: 120.0 }, // Controle / Consulta de Alinhadores Transparentes
];

async function main() {
  console.log('Seeding database...');

  // Seed Especialidades
  console.log('Seeding especialidades...');
  for (const esp of ESPECIALIDADES) {
    await prisma.especialidade.upsert({
      where: { codigo: esp.codigo },
      update: { nome: esp.nome, faixaInicio: esp.faixaInicio, faixaFim: esp.faixaFim },
      create: esp,
    });
  }
  console.log(`✓ ${ESPECIALIDADES.length} especialidades seeded`);

  // Seed VRPOReferencia
  console.log('Seeding VRPO references...');
  for (const ref of VRPO_REFERENCIAS) {
    await prisma.vRPOReferencia.upsert({
      where: { codigo: ref.codigo },
      update: { valorReferencia: ref.valorReferencia },
      create: ref,
    });
  }
  console.log(`✓ ${VRPO_REFERENCIAS.length} VRPO references seeded`);

  console.log('Seed complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
