#!/usr/bin/env node
/**
 * Builds the teaser assets from the two source films (D-049).
 *
 * Run: TEASER_1_CODE=1234 TEASER_2_CODE=5678 npm run teaser:assets
 *
 * Reads ops/teaser-src/ (gitignored — the originals never enter the repo) and
 * writes into website/public/teaser/:
 *
 *   <sha256(code + ':' + id) sliced to 16 hex>.mp4   the full film
 *   <id>-preview.mp4                                  silent 320px hover loop
 *   <id>-poster.webp                                  still frame
 *
 * The full film is named by a hash of its own code, so its URL cannot be
 * guessed, cannot be indexed, and never appears in the built site. The browser
 * recomputes the same name from what the visitor types — see
 * website/src/scripts/teaser.ts, which must keep using the same derivation.
 *
 * This is a courtesy gate, not access control: four digits is 10,000
 * combinations. Nothing confidential belongs behind it.
 *
 * ffmpeg comes from ffmpeg-static (a root devDependency) so there is nothing
 * to install by hand on Windows.
 */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const SRC_DIR = path.join(ROOT, 'ops', 'teaser-src');
const OUT_DIR = path.join(ROOT, 'website', 'public', 'teaser');

/** Must match HASH_CHARS in website/src/scripts/teaser.ts. */
const HASH_CHARS = 16;
/** Cloudflare static assets reject anything larger — a hard deploy failure. */
const MAX_BYTES = 25 * 1024 * 1024;
const WARN_BYTES = 20 * 1024 * 1024;

/** Must match TEASERS in website/src/config/teasers.ts. */
const TEASERS = [
  { id: 'teaser-1', source: 'NBIT1', codeEnv: 'TEASER_1_CODE' },
  { id: 'teaser-2', source: 'NBG1', codeEnv: 'TEASER_2_CODE' },
];

const VIDEO_EXT = ['.mp4', '.mov', '.m4v', '.webm', '.mkv', '.avi'];

const rel = (p) => path.relative(ROOT, p).split(path.sep).join('/');
const fail = (msg) => {
  console.error(`✗ ${msg}`);
  process.exit(1);
};

function ffmpegBin() {
  try {
    const require = createRequire(import.meta.url);
    const bin = require('ffmpeg-static');
    if (bin && fs.existsSync(bin)) return bin;
  } catch {
    /* fall through to the friendlier message below */
  }
  return fail('ffmpeg-static is not installed. Run `npm install` in the repo root first.');
}

function run(bin, args, label) {
  const result = spawnSync(bin, args, { stdio: ['ignore', 'ignore', 'pipe'], encoding: 'utf8' });
  if (result.status !== 0) {
    // ffmpeg's last stderr line is the one that says what actually went wrong.
    const why = (result.stderr ?? '').trim().split('\n').slice(-3).join('\n  ');
    fail(`ffmpeg failed while building ${label}:\n  ${why}`);
  }
}

/** Same derivation as resolveFilm() in website/src/scripts/teaser.ts. */
function filmName(code, id) {
  return `${crypto.createHash('sha256').update(`${code}:${id}`).digest('hex').slice(0, HASH_CHARS)}.mp4`;
}

function findSource(base) {
  for (const ext of VIDEO_EXT) {
    const candidate = path.join(SRC_DIR, base + ext);
    if (fs.existsSync(candidate)) return candidate;
  }
  // Case can differ on macOS and Windows; look the directory over before giving up.
  const entries = fs.existsSync(SRC_DIR) ? fs.readdirSync(SRC_DIR) : [];
  const match = entries.find(
    (e) =>
      path.parse(e).name.toLowerCase() === base.toLowerCase() &&
      VIDEO_EXT.includes(path.extname(e).toLowerCase()),
  );
  return match ? path.join(SRC_DIR, match) : null;
}

/* ---------------------------------------------------------------------- */

const ffmpeg = ffmpegBin();

if (!fs.existsSync(SRC_DIR)) {
  fail(
    `${rel(SRC_DIR)}/ does not exist.\n` +
      `  Create it and drop the two source films in as NBIT1 and NBG1 ` +
      `(any of ${VIDEO_EXT.join(', ')}).`,
  );
}

// Validate everything before writing anything: a half-built teaser directory
// with one film renamed and the other not is worse than a clean refusal.
const jobs = TEASERS.map((teaser) => {
  const code = (process.env[teaser.codeEnv] ?? '').trim();
  if (!code) fail(`${teaser.codeEnv} is not set. Every teaser needs its own 4-digit code.`);
  if (!/^\d{4}$/.test(code)) fail(`${teaser.codeEnv} must be exactly 4 digits — got "${code}".`);

  const source = findSource(teaser.source);
  if (!source) {
    fail(
      `No source film for ${teaser.id}. Expected ${rel(SRC_DIR)}/${teaser.source}` +
        `${VIDEO_EXT.join(' | ')}.`,
    );
  }
  return { ...teaser, code, source, film: filmName(code, teaser.id) };
});

/* The teaser id salts the hash, so reusing one code across both teasers still
   produces two distinct names — that is a legitimate choice, not an error.
   This only trips on a genuine SHA-256 collision, and exists so that if the
   impossible happens we refuse rather than silently overwrite one film. */
if (new Set(jobs.map((j) => j.film)).size !== jobs.length) {
  fail('Two teasers resolved to the same filename. Re-run with a different code for one of them.');
}

fs.mkdirSync(OUT_DIR, { recursive: true });

console.log(`Building teaser assets into ${rel(OUT_DIR)}/\n`);

for (const job of jobs) {
  console.log(`${job.id}  ←  ${rel(job.source)}`);

  const filmPath = path.join(OUT_DIR, job.film);
  const previewPath = path.join(OUT_DIR, `${job.id}-preview.mp4`);
  const posterPath = path.join(OUT_DIR, `${job.id}-poster.webp`);

  // Full film. faststart moves the index to the front so the browser can start
  // playing before the whole file has arrived.
  run(
    ffmpeg,
    ['-y', '-i', job.source, '-c:v', 'libx264', '-crf', '23', '-preset', 'slow',
      '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '128k', '-movflags', '+faststart', filmPath],
    `${job.id} film`,
  );

  // Hover loop: 6s, 320px wide, silent. It is shown blurred under a scrim, so
  // the low resolution costs nothing visually and leaks nothing if taken.
  run(
    ffmpeg,
    ['-y', '-i', job.source, '-t', '6', '-an', '-vf', 'scale=320:-2', '-c:v', 'libx264',
      '-crf', '32', '-preset', 'slow', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', previewPath],
    `${job.id} preview`,
  );

  // Poster. -ss before -i seeks by keyframe, which is both faster and enough
  // precision for a still that is only ever shown blurred.
  run(
    ffmpeg,
    ['-y', '-ss', '1', '-i', job.source, '-frames:v', '1', '-vf', 'scale=960:-2',
      '-q:v', '70', posterPath],
    `${job.id} poster`,
  );

  const size = fs.statSync(filmPath).size;
  const mib = (size / 1024 / 1024).toFixed(1);
  if (size > MAX_BYTES) {
    fail(
      `${job.film} is ${mib} MiB. Cloudflare static assets cap a single file at 25 MiB, ` +
        `so this would fail the deploy.\n  Shorten the film or re-run with a higher -crf.`,
    );
  }

  console.log(`  film     ${job.film}  (${mib} MiB)${size > WARN_BYTES ? '  ⚠ close to the 25 MiB cap' : ''}`);
  console.log(`  preview  ${path.basename(previewPath)}`);
  console.log(`  poster   ${path.basename(posterPath)}\n`);
}

/* Rotating a code changes the film's name. Without this sweep the file under
   the OLD name would stay in public/ and stay reachable by anyone who had the
   old code — the gate would silently keep honouring a retired code. */
const keep = new Set([
  ...jobs.map((j) => j.film),
  ...jobs.map((j) => `${j.id}-preview.mp4`),
  ...jobs.map((j) => `${j.id}-poster.webp`),
]);
const stale = fs.readdirSync(OUT_DIR).filter((f) => !keep.has(f));
for (const f of stale) {
  fs.unlinkSync(path.join(OUT_DIR, f));
  console.log(`removed stale ${f}`);
}

console.log(
  `✓ ${jobs.length} teaser${jobs.length === 1 ? '' : 's'} built.\n` +
    `  Commit ${rel(OUT_DIR)}/ and deploy. The codes stay out of the repo — ` +
    `they only ever live in your shell and in the conversations where you hand them out.`,
);
