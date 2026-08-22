/**
 * Gera os ícones PNG do PWA (docs/icons) a partir do SVG mestre.
 * Uso: npm run generate:icons
 */
import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ICONS_DIR = path.join(__dirname, '..', 'docs', 'icons');
const SOURCE_SVG = path.join(ICONS_DIR, 'icon.svg');

const MASKABLE_SAFE_ZONE = 0.8; // ícone ocupa 80% da tela, deixando margem de segurança

async function generateStandardIcon(size) {
  const outFile = path.join(ICONS_DIR, `icon-${size}.png`);
  await sharp(SOURCE_SVG).resize(size, size).png().toFile(outFile);
  console.log(`  ✔ icon-${size}.png`);
}

async function generateMaskableIcon(size) {
  const outFile = path.join(ICONS_DIR, `icon-maskable-${size}.png`);
  const inner = Math.round(size * MASKABLE_SAFE_ZONE);
  const iconBuffer = await sharp(SOURCE_SVG).resize(inner, inner).png().toBuffer();

  await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: '#4338CA',
    },
  })
    .composite([{ input: iconBuffer, gravity: 'center' }])
    .png()
    .toFile(outFile);
  console.log(`  ✔ icon-maskable-${size}.png`);
}

async function generateAppleTouchIcon() {
  const outFile = path.join(ICONS_DIR, 'apple-touch-icon.png');
  await sharp(SOURCE_SVG).resize(180, 180).flatten({ background: '#4338CA' }).png().toFile(outFile);
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
