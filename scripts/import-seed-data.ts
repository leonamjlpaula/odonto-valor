/**
 * import-seed-data.ts
 *
 * Importa dados de uma planilha XLSX (ou CSV) e gera os arrays TypeScript
 * para colar em src/lib/vrpo-seed-data.ts e prisma/seed.ts.
 *
 * Uso:
 *   npx ts-node scripts/import-seed-data.ts --mode=procedimentos --file=planilha.xlsx
 *   npx ts-node scripts/import-seed-data.ts --mode=materiais     --file=materiais.xlsx
 *   npx ts-node scripts/import-seed-data.ts --mode=vrpo          --file=vrpo.xlsx
 *   npx ts-node scripts/import-seed-data.ts --mode=todos         --file=planilha.xlsx
 *
 * Formatos esperados nas abas (ou arquivo CSV):
 *
 *   Aba "procedimentos" (ou arquivo):
 *     codigo | nome | especialidade | tempo_minutos | vrpo_referencia (opcional)
 *
 *   Aba "materiais" (ou arquivo):
 *     nome | unidade | preco
 *
 *   Aba "vrpo" (ou arquivo):
 *     codigo | valor_referencia
 *
 * Especialidades válidas:
 *   diagnostico, radiologia, testes-exames, prevencao, odontopediatria,
 *   dentistica, endodontia, periodontia, protese, cirurgia, ortodontia
 *
 * Para XLSX com múltiplas abas, use --mode=todos e o script lê cada aba pelo nome.
 * Para CSV, use --mode com o tipo específico.
 */

import * as fs from 'fs'
import * as path from 'path'
import * as XLSX from 'xlsx'

// ─── CLI args ─────────────────────────────────────────────────────────────────

const args = process.argv.slice(2)
const getArg = (name: string) => {
  const found = args.find((a) => a.startsWith(`--${name}=`))
  return found ? found.split('=').slice(1).join('=') : null
}

const mode = getArg('mode') ?? 'todos'
const filePath = getArg('file')
const outDir = getArg('out') ?? '.'

if (!filePath) {
  console.error('Erro: --file é obrigatório. Ex: --file=planilha.xlsx')
  process.exit(1)
}

const resolvedPath = path.resolve(filePath)
if (!fs.existsSync(resolvedPath)) {
  console.error(`Erro: arquivo não encontrado: ${resolvedPath}`)
  process.exit(1)
}

// ─── Especialidades válidas ───────────────────────────────────────────────────

const ESPECIALIDADES_VALIDAS = new Set([
  'diagnostico',
  'radiologia',
  'testes-exames',
  'prevencao',
  'odontopediatria',
  'dentistica',
  'endodontia',
  'periodontia',
  'protese',
  'cirurgia',
  'ortodontia',
])

// ─── Helpers ──────────────────────────────────────────────────────────────────

function normalize(s: unknown): string {
  return String(s ?? '').trim()
}

function parseFloat2(s: unknown): number | null {
  const str = normalize(s).replace(',', '.')
  const n = parseFloat(str)
  return isNaN(n) ? null : n
}

function sheetToRows(sheet: XLSX.WorkSheet): Record<string, unknown>[] {
  return XLSX.utils.sheet_to_json(sheet, { defval: '' })
}

// Normaliza o nome da coluna: minúsculas, sem espaços/acentos
function colKey(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '')
}

function findCol(row: Record<string, unknown>, ...candidates: string[]): unknown {
  for (const c of candidates) {
    // Try exact match first
    if (c in row) return row[c]
    // Try normalized match
    const normalized = colKey(c)
    for (const key of Object.keys(row)) {
      if (colKey(key) === normalized) return row[key]
    }
  }
  return ''
}

// ─── Parsers ──────────────────────────────────────────────────────────────────

interface ProcedimentoRow {
  codigo: string
  nome: string
  especialidade: string
  tempo_minutos: number
  vrpo_referencia: number | null
}

interface MaterialRow {
  nome: string
  unidade: string
  preco: number
}

interface VrpoRow {
  codigo: string
  valor_referencia: number
}

function parseProcedimentos(rows: Record<string, unknown>[]): {
  valid: ProcedimentoRow[]
  errors: string[]
} {
  const valid: ProcedimentoRow[] = []
  const errors: string[] = []

  rows.forEach((row, i) => {
    const lineNum = i + 2 // header is row 1
    const codigo = normalize(findCol(row, 'codigo', 'código', 'code'))
    const nome = normalize(findCol(row, 'nome', 'name', 'procedimento'))
    const esp = normalize(
      findCol(row, 'especialidade', 'especialidad', 'specialty', 'esp')
    ).toLowerCase()
    const tempoRaw = findCol(row, 'tempo_minutos', 'tempo', 'minutos', 'time_minutes', 'time')
    const vrpoRaw = findCol(row, 'vrpo_referencia', 'vrpo', 'valor_vrpo', 'referencia', 'ref')

    if (!codigo && !nome) return // skip empty rows

    const rowErrors: string[] = []

    if (!codigo) rowErrors.push('código ausente')
    if (!nome) rowErrors.push('nome ausente')
    if (!esp || !ESPECIALIDADES_VALIDAS.has(esp)) {
      rowErrors.push(
        `especialidade inválida: "${esp}" — use: ${[...ESPECIALIDADES_VALIDAS].join(', ')}`
      )
    }

    const tempo = parseFloat2(tempoRaw)
    if (tempo === null || tempo <= 0) rowErrors.push(`tempo_minutos inválido: "${tempoRaw}"`)

    if (rowErrors.length > 0) {
      errors.push(`Linha ${lineNum}: ${rowErrors.join('; ')}`)
      return
    }

    const vrpo = parseFloat2(vrpoRaw)

    valid.push({
      codigo,
      nome,
      especialidade: esp,
      tempo_minutos: tempo!,
      vrpo_referencia: vrpo,
    })
  })

  return { valid, errors }
}

function parseMateriais(rows: Record<string, unknown>[]): {
  valid: MaterialRow[]
  errors: string[]
} {
  const valid: MaterialRow[] = []
  const errors: string[] = []

  rows.forEach((row, i) => {
    const lineNum = i + 2
    const nome = normalize(findCol(row, 'nome', 'name', 'material'))
    const unidade = normalize(findCol(row, 'unidade', 'unit', 'embalagem', 'unid'))
    const precoRaw = findCol(row, 'preco', 'preço', 'price', 'valor')

    if (!nome && !unidade) return // skip empty rows

    const rowErrors: string[] = []
    if (!nome) rowErrors.push('nome ausente')
    if (!unidade) rowErrors.push('unidade ausente')
    const preco = parseFloat2(precoRaw)
    if (preco === null || preco <= 0) rowErrors.push(`preco inválido: "${precoRaw}"`)

    if (rowErrors.length > 0) {
      errors.push(`Linha ${lineNum}: ${rowErrors.join('; ')}`)
      return
    }

    valid.push({ nome, unidade, preco: preco! })
  })

  return { valid, errors }
}

function parseVrpo(rows: Record<string, unknown>[]): {
  valid: VrpoRow[]
  errors: string[]
} {
  const valid: VrpoRow[] = []
  const errors: string[] = []

  rows.forEach((row, i) => {
    const lineNum = i + 2
    const codigo = normalize(findCol(row, 'codigo', 'código', 'code', 'cod'))
    const valorRaw = findCol(row, 'valor_referencia', 'valor', 'vrpo', 'referencia', 'value')

    if (!codigo) return // skip empty rows

    const valor = parseFloat2(valorRaw)
    if (valor === null || valor <= 0) {
      errors.push(`Linha ${lineNum}: valor_referencia inválido: "${valorRaw}" para código "${codigo}"`)
      return
    }

    valid.push({ codigo, valor_referencia: valor })
  })

  return { valid, errors }
}

// ─── Generators ───────────────────────────────────────────────────────────────

function generateProcedimentosTs(rows: ProcedimentoRow[]): string {
  const lines = rows.map((r) => {
    return `  {
    codigo: '${r.codigo}',
    nome: '${r.nome.replace(/'/g, "\\'")}',
    especialidadeCodigo: '${r.especialidade}',
    tempoMinutos: ${r.tempo_minutos},
    materiais: [],
  },`
  })
  return `// ─── Procedimentos importados (${rows.length}) ──────────────────────────────────────
// Adicione composições de materiais manualmente nos procedimentos relevantes.

export const PROCEDIMENTOS_IMPORTADOS = [\n${lines.join('\n')}\n]`
}

function generateMateriaisTs(rows: MaterialRow[]): string {
  const lines = rows.map((r) => {
    return `  { nome: '${r.nome.replace(/'/g, "\\'")}', unidade: '${r.unidade.replace(/'/g, "\\'")}', preco: ${r.preco.toFixed(2)} },`
  })
  return `// ─── Materiais importados (${rows.length}) ───────────────────────────────────────────

export const MATERIAIS_IMPORTADOS = [\n${lines.join('\n')}\n]`
}

function generateVrpoTs(rows: VrpoRow[]): string {
  const lines = rows.map((r) => {
    return `  { codigo: '${r.codigo}', valorReferencia: ${r.valor_referencia.toFixed(2)} },`
  })
  return `// ─── VRPO Referências importadas (${rows.length}) ──────────────────────────────────

export const VRPO_REFERENCIAS_IMPORTADAS = [\n${lines.join('\n')}\n]`
}

function generateVrpoForSeed(rows: VrpoRow[]): string {
  const lines = rows.map((r) => {
    return `  { codigo: '${r.codigo}', valorReferencia: ${r.valor_referencia.toFixed(2)} },`
  })
  return `// Substitua VRPO_REFERENCIAS em prisma/seed.ts pelo array abaixo:\nconst VRPO_REFERENCIAS = [\n${lines.join('\n')}\n]`
}

// ─── Write output ─────────────────────────────────────────────────────────────

function writeOutput(filename: string, content: string) {
  const outPath = path.resolve(outDir, filename)
  fs.writeFileSync(outPath, content, 'utf-8')
  console.log(`  ✓ Escrito: ${outPath}`)
}

function printErrors(label: string, errors: string[]) {
  if (errors.length === 0) return
  console.warn(`\n⚠ Erros em ${label} (${errors.length} linhas ignoradas):`)
  errors.slice(0, 20).forEach((e) => console.warn(`  - ${e}`))
  if (errors.length > 20) console.warn(`  ... e mais ${errors.length - 20} erros`)
}

// ─── Main ─────────────────────────────────────────────────────────────────────

function main() {
  console.log(`\nLendo arquivo: ${resolvedPath}`)

  const ext = path.extname(resolvedPath).toLowerCase()
  let workbook: XLSX.WorkBook

  if (ext === '.csv') {
    // Read as UTF-8 text and parse manually to preserve accents
    const fileContent = fs.readFileSync(resolvedPath, 'utf-8')
    workbook = XLSX.read(fileContent, { type: 'string', raw: false })
  } else {
    workbook = XLSX.readFile(resolvedPath)
  }

  const sheetNames = workbook.SheetNames

  console.log(`Abas encontradas: ${sheetNames.join(', ') || '(arquivo CSV)'}`)
  console.log(`Modo: ${mode}\n`)

  const getSheet = (candidates: string[]): XLSX.WorkSheet | null => {
    for (const name of candidates) {
      // Case-insensitive search
      const found = sheetNames.find((s) => s.toLowerCase() === name.toLowerCase())
      if (found) return workbook.Sheets[found]
    }
    // If only one sheet (CSV), use it
    if (sheetNames.length === 1) return workbook.Sheets[sheetNames[0]]
    return null
  }

  const shouldRun = (target: string) =>
    mode === 'todos' || mode === target

  // ─── Procedimentos ──────────────────────────────────────────────────────────
  if (shouldRun('procedimentos')) {
    const sheet = getSheet(['procedimentos', 'procedures', 'Procedimentos', 'Sheet1'])
    if (!sheet) {
      if (mode === 'procedimentos') {
        console.error('Aba "procedimentos" não encontrada.')
        process.exit(1)
      }
      console.log('Aba "procedimentos" não encontrada — pulando.')
    } else {
      const rows = sheetToRows(sheet)
      const { valid, errors } = parseProcedimentos(rows)
      printErrors('procedimentos', errors)
      console.log(`Procedimentos: ${valid.length} válidos, ${errors.length} com erro`)

      // Separate VRPO references from procedure data
      const vrpoFromProcs = valid
        .filter((r) => r.vrpo_referencia !== null)
        .map((r) => ({ codigo: r.codigo, valor_referencia: r.vrpo_referencia! }))

      writeOutput('procedimentos-importados.ts', generateProcedimentosTs(valid))
      if (vrpoFromProcs.length > 0) {
        writeOutput(
          'vrpo-de-procedimentos.ts',
          generateVrpoTs(vrpoFromProcs) +
            '\n\n' +
            generateVrpoForSeed(vrpoFromProcs)
        )
        console.log(`  → ${vrpoFromProcs.length} referências VRPO extraídas da coluna vrpo_referencia`)
      }
    }
  }

  // ─── Materiais ──────────────────────────────────────────────────────────────
  if (shouldRun('materiais')) {
    const sheet = getSheet(['materiais', 'materials', 'Materiais', 'Sheet2'])
    if (!sheet) {
      if (mode === 'materiais') {
        console.error('Aba "materiais" não encontrada.')
        process.exit(1)
      }
      console.log('Aba "materiais" não encontrada — pulando.')
    } else {
      const rows = sheetToRows(sheet)
      const { valid, errors } = parseMateriais(rows)
      printErrors('materiais', errors)
      console.log(`Materiais: ${valid.length} válidos, ${errors.length} com erro`)
      writeOutput('materiais-importados.ts', generateMateriaisTs(valid))
    }
  }

  // ─── VRPO ───────────────────────────────────────────────────────────────────
  if (shouldRun('vrpo')) {
    const sheet = getSheet(['vrpo', 'VRPO', 'referencias', 'Referências', 'Sheet3'])
    if (!sheet) {
      if (mode === 'vrpo') {
        console.error('Aba "vrpo" não encontrada.')
        process.exit(1)
      }
      console.log('Aba "vrpo" não encontrada — pulando.')
    } else {
      const rows = sheetToRows(sheet)
      const { valid, errors } = parseVrpo(rows)
      printErrors('vrpo', errors)
      console.log(`VRPO: ${valid.length} válidos, ${errors.length} com erro`)
      writeOutput('vrpo-importado.ts', generateVrpoTs(valid) + '\n\n' + generateVrpoForSeed(valid))
    }
  }

  console.log('\nImportação concluída.')
  console.log('Copie os arrays gerados para src/lib/vrpo-seed-data.ts e prisma/seed.ts.')
}

main()
