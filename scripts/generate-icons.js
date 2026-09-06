/**
 * Gera os ícones PNG do PWA (docs/icons) a partir do SVG mestre.
 * Uso: npm run generate:icons
 */
import { mkdir } from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ICONS_DIR = path.join(__dirname, '..', 'docs', 'icons');
const SOURCE_SVG = path.join(ICONS_DIR, 'icon.svg');

/**
 * Variante de sangria total (cantos retos) do SVG mestre.
 *
 * Os ícones "maskable" (Android) e o apple-touch-icon são recortados pelo
 * próprio sistema — Android em círculo/squircle, iOS em superelipse. Se o
 * arquivo já vier com o canto arredondado, sobra um anel de fundo liso em
 * volta do desenho depois do recorte. Servindo o quadrado inteiro, as
 * facetas vão até a borda e quem arredonda é o sistema.
 *
 * O "S" (imagem embutida no SVG) ocupa uma faixa central de 173×230,
 * então já cabe folgada na zona segura do maskable (círculo de 80%): o
 * canto mais distante dele fica a ~144px do centro, contra um limite de
 * 204px. Por isso não precisa ser reduzido.
 */
function readFullBleedSvg() {
  return readFileSync(SOURCE_SVG, 'utf8').replace('rx="112"', 'rx="0"');
}

async function generateStandardIcon(size) {
  const outFile = path.join(ICONS_DIR, `icon-${size}.png`);
  await sharp(SOURCE_SVG).resize(size, size).png().toFile(outFile);
  console.log(`  ✔ icon-${size}.png`);
}

async function generateMaskableIcon(size) {
  const outFile = path.join(ICONS_DIR, `icon-maskable-${size}.png`);
  await sharp(Buffer.from(readFullBleedSvg())).resize(size, size).png().toFile(outFile);
  console.log(`  ✔ icon-maskable-${size}.png`);
}

async function generateAppleTouchIcon() {
  const outFile = path.join(ICONS_DIR, 'apple-touch-icon.png');
  await sharp(Buffer.from(readFullBleedSvg())).resize(180, 180).png().toFile(outFile);
  console.log('  ✔ apple-touch-icon.png');
}

async function generateFavicon() {
  const outFile = path.join(ICONS_DIR, 'favicon-32.png');
  await sharp(SOURCE_SVG).resize(32, 32).png().toFile(outFile);
  console.log('  ✔ favicon-32.png');
}

async function main() {
  await mkdir(ICONS_DIR, { recursive: true });
  console.log('Gerando ícones do PWA...');

  await Promise.all([
    generateStandardIcon(192),
    generateStandardIcon(512),
    generateMaskableIcon(192),
    generateMaskableIcon(512),
    generateAppleTouchIcon(),
    generateFavicon(),
  ]);

  console.log('Concluído.');
}

main().catch((error) => {
  console.error('Falha ao gerar ícones:', error);
  process.exitCode = 1;
});
