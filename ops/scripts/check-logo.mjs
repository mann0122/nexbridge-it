/**
 * D-050 drift guard. The mark's geometry is duplicated across three vector
 * sources on purpose (a public asset, a favicon with its own ground, and an
 * Astro component using tokens). Duplication only stays honest if something
 * fails when it drifts — that something is this script.
 *
 * It checks four things, because a review proved the first one alone is not
 * enough: identical path data, identical paint *sequence* (a swapped facet
 * keeps the vocabulary legal), the placement transform and viewBox of each
 * source, and the dimensions of the two rasters rendered from the geometry.
 */
import fs from 'node:fs';

const PAINT = { 'var(--color-signal)': '#FF4D00', 'var(--color-paper)': '#F7F5F0' };
const norm = (f) => (PAINT[f] ?? f.toUpperCase());

const SOURCES = [
  { file: 'website/public/logo-mark.svg', paint: 'hex', viewBox: '0 0 1145.06 676.8', transform: 'translate(-447.62,-682.21)' },
  { file: 'website/public/favicon.svg', paint: 'hex', viewBox: '0 0 32 32', transform: 'translate(1.5,7.43) scale(0.025326) translate(-447.62,-682.21)' },
  { file: 'website/src/components/Mark.astro', paint: 'token', viewBox: '0 0 1145.06 676.8', transform: 'translate(-447.62,-682.21)' },
];
const RASTERS = [
  { file: 'website/public/apple-touch-icon.png', w: 180, h: 180 },
  { file: 'website/public/og.png', w: 1200, h: 630 },
];

const errors = [];
const read = (f) => {
  if (!fs.existsSync(f)) { errors.push(`missing: ${f}`); return ''; }
  return fs.readFileSync(f, 'utf8');
};

const shapes = SOURCES.map(({ file, paint, viewBox, transform }) => {
  const src = read(file);
  if (/c2pa|jumbf|<metadata|sodipodi|inkscape/i.test(src)) errors.push(`${file}: carries generator metadata`);
  if (/#8B959E|rgb\(139,\s*149,\s*158\)/i.test(src)) errors.push(`${file}: contains the dropped steel colour`);

  const vb = src.match(/viewBox="([^"]+)"/)?.[1];
  if (vb !== viewBox) errors.push(`${file}: viewBox "${vb}" — expected "${viewBox}"`);
  const tf = src.match(/<g transform="([^"]+)"/)?.[1];
  if (tf !== transform) errors.push(`${file}: placement transform "${tf}" — expected "${transform}"`);

  const paths = [...src.matchAll(/<path\s+fill="([^"]+)"\s+d="([^"]+)"/g)]
    .map((m) => ({ fill: m[1], d: m[2] }));
  paths.forEach(({ fill }) => {
    const legal = paint === 'token' ? fill in PAINT : ['#FF4D00', '#F7F5F0'].includes(fill.toUpperCase());
    if (!legal) errors.push(`${file}: illegal paint ${fill} (${paint} source)`);
  });
  return paths;
});

const [ref] = shapes;
if (ref.length !== 5) errors.push(`expected 5 paths, found ${ref.length} in ${SOURCES[0].file}`);
shapes.forEach((paths, i) => {
  if (i === 0) return;
  const name = SOURCES[i].file;
  if (paths.length !== ref.length) { errors.push(`${name}: ${paths.length} paths, expected ${ref.length}`); return; }
  paths.forEach((p, j) => {
    if (p.d !== ref[j].d) errors.push(`${name}: path ${j + 1} geometry differs from ${SOURCES[0].file}`);
    if (norm(p.fill) !== norm(ref[j].fill)) {
      errors.push(`${name}: path ${j + 1} is painted ${p.fill} but ${SOURCES[0].file} paints it ${ref[j].fill}`);
    }
  });
});

for (const { file, w, h } of RASTERS) {
  if (!fs.existsSync(file)) { errors.push(`missing raster: ${file}`); continue; }
  const buf = fs.readFileSync(file);
  const [gw, gh] = [buf.readUInt32BE(16), buf.readUInt32BE(20)];
  if (gw !== w || gh !== h) errors.push(`${file}: ${gw}x${gh} — expected ${w}x${h}`);
}

if (errors.length) {
  console.error('✗ logo mark drift:\n  ' + errors.join('\n  '));
  process.exit(1);
}
console.log(`✓ logo mark — ${ref.length} paths, paints and placement identical across ${SOURCES.length} vector sources;`);
console.log(`  rasters ${RASTERS.map((r) => r.file.split('/').pop() + ' ' + r.w + 'x' + r.h).join(', ')} present.`);
console.log('  Re-export both rasters whenever the geometry changes.');
