/**
 * Gera o modelo em branco do Relatório (docs/templates/relatorio-modelo.xlsx):
 * título, cabeçalho e formatação já prontos — o app só abre este arquivo
 * e preenche as linhas de dado por baixo (ver relatorio.js).
 *
 * Rode de novo sempre que quiser mudar o visual do relatório (cores,
 * larguras de coluna, título) sem mexer no código que gera os dados:
 *
 *   node scripts/generate-relatorio-template.js
 */
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import ExcelJS from 'exceljs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ARQUIVO_SAIDA = path.join(__dirname, '..', 'docs', 'templates', 'relatorio-modelo.xlsx');

// Mesmas colunas de docs/scripts/pages/relatorio.js (CAMPOS_EXPORTACAO +
// "Comissão total") — se uma mudar, a outra precisa acompanhar.
const COLUNAS = [
  { titulo: 'Vaga', largura: 20 },
  { titulo: 'Status da vaga', largura: 16 },
  { titulo: 'Candidato', largura: 24 },
  { titulo: 'LinkedIn', largura: 32 },
  { titulo: 'Pretensão salarial', largura: 18 },
  { titulo: 'Localização', largura: 22 },
  { titulo: 'Modalidade', largura: 14 },
  { titulo: 'Fonte', largura: 12 },
  { titulo: 'Etapa', largura: 18 },
  { titulo: 'Status do candidato', largura: 18 },
  { titulo: 'Observação', largura: 42 },
  { titulo: 'Contratação', largura: 14 },
  { titulo: 'Nível', largura: 10 },
  { titulo: 'Comissão total', largura: 16 },
];

const ROXO = 'FF4F46E5';
const ROXO_ESCURO = 'FF4338CA';

// Linhas fixas — relatorio.js (no navegador) usa os mesmos números pra
// saber onde escrever "gerado em", o total e a primeira linha de dado
// (a seguinte à do cabeçalho). Mudou aqui, muda lá também.
const LINHA_GERADO_EM = 2;
const LINHA_TOTAL = 3;
const LINHA_CABECALHO = 5;

async function gerar() {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'HireCash';
  workbook.created = new Date();

  const sheet = workbook.addWorksheet('Candidatos', {
    views: [{ state: 'frozen', ySplit: LINHA_CABECALHO }],
  });

  sheet.columns = COLUNAS.map((coluna) => ({ width: coluna.largura }));

  // --- Título -----------------------------------------------------
  sheet.mergeCells(1, 1, 1, COLUNAS.length);
  const titulo = sheet.getCell(1, 1);
  titulo.value = 'HireCash — Relatório de Candidatos';
  titulo.font = { bold: true, size: 16, color: { argb: 'FFFFFFFF' } };
  titulo.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
  titulo.fill = {
    type: 'gradient',
    gradient: 'angle',
    degree: 135,
    stops: [
      { position: 0, color: { argb: ROXO } },
      { position: 1, color: { argb: ROXO_ESCURO } },
    ],
  };
  sheet.getRow(1).height = 32;

  // --- "Gerado em" e "Total de candidatos" (texto real vem do app) -
  [LINHA_GERADO_EM, LINHA_TOTAL].forEach((linha) => {
    sheet.mergeCells(linha, 1, linha, COLUNAS.length);
    const celula = sheet.getCell(linha, 1);
    celula.font = { size: 11, color: { argb: 'FF6B7280' } };
    celula.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
  });
  sheet.getCell(LINHA_GERADO_EM, 1).value = 'Gerado em: —';
  sheet.getCell(LINHA_TOTAL, 1).value = 'Total: —';

  // --- Cabeçalho das colunas ----------------------------------------
  const linhaCabecalho = sheet.getRow(LINHA_CABECALHO);
  linhaCabecalho.height = 22;
  COLUNAS.forEach((coluna, indice) => {
    const celula = linhaCabecalho.getCell(indice + 1);
    celula.value = coluna.titulo;
    celula.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    celula.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: ROXO } };
    celula.alignment = { vertical: 'middle', horizontal: 'left', indent: 1, wrapText: true };
    celula.border = {
      top: { style: 'thin', color: { argb: ROXO_ESCURO } },
      bottom: { style: 'thin', color: { argb: ROXO_ESCURO } },
      left: { style: 'thin', color: { argb: ROXO_ESCURO } },
      right: { style: 'thin', color: { argb: ROXO_ESCURO } },
    };
  });

  // Observação quebra linha (texto livre, pode ser longo); as demais
  // colunas ficam numa linha só, alinhadas à esquerda.
  sheet.getColumn(11).alignment = { wrapText: true, vertical: 'top', horizontal: 'left' };

  // As linhas de dado (a partir de LINHA_PRIMEIRO_DADO) ficam em branco
  // aqui de propósito — borda e fundo zebrado são aplicados linha a
  // linha em relatorio.js, exatamente para a quantidade de candidatos
  // encontrados, sem sobrar nem faltar linha estilizada.

  await workbook.xlsx.writeFile(ARQUIVO_SAIDA);
  console.log('Modelo gerado em', ARQUIVO_SAIDA);
}

gerar().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
