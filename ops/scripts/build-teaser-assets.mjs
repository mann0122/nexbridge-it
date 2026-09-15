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
import os from 'node:os';
import { createRequire } from 'node:module';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const SRC_DIR = path.join(ROOT, 'ops', 'teaser-src');
const OUT_DIR = path.join(ROOT, 'website', 'public', 'teaser');

/** Must match HASH_CHARS in website/src/scripts/teaser.ts. */
const HASH_CHARS = 16;
/** Cloudflare static assets reject anything larger — a hard deploy failure. */
const MAX_BYTES = 25 * 1024 * 1024;
const WARN_BYTES = 20 * 1024 * 1024;
/** What the encoder aims at. The gap absorbs container and muxing overhead. */
const TARGET_BYTES = 22 * 1024 * 1024;

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
  // Escape hatch for anyone whose ffmpeg-static download was blocked.
  const override = process.env.FFMPEG_BINARY;
  if (override) {
    if (fs.existsSync(override)) return override;
    fail(`FFMPEG_BINARY is set to "${override}", which does not exist.`);
  }
  try {
    const require = createRequire(import.meta.url);
    const bin = require('ffmpeg-static');
    if (bin && fs.existsSync(bin)) return bin;
  } catch {
    /* fall through to the friendlier message below */
  }
  return fail(
    'No ffmpeg binary from ffmpeg-static.\n' +
      '  If you have run `npm install` in the repo root, the package is there but its\n' +
      '  postinstall download was blocked (proxy or offline). Re-run the install with\n' +
      '  network access, or set FFMPEG_BINARY to an ffmpeg you already have.',
  );
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

/**
 * Source duration in seconds, parsed out of ffmpeg's own banner.
 * ffmpeg-static ships no ffprobe, so `ffmpeg -i` (which exits non-zero with no
 * output file, by design) is the probe we have.
 */
function probeDuration(bin, file) {
  const out = spawnSync(bin, ['-i', file], { encoding: 'utf8' }).stderr ?? '';
  const m = out.match(/Duration:\s*(\d+):(\d+):(\d+(?:\.\d+)?)/);
  if (!m) fail(`Could not read the duration of ${rel(file)} — is it a video file?`);
  return Number(m[1]) * 3600 + Number(m[2]) * 60 + Number(m[3]);
}

/**
 * Encode the full film to a size that actually fits.
 *
 * Quality-based encoding (a fixed -crf) cannot promise a file size: the same
 * setting gives 3 MiB for a short film and 34 MiB for a long one, which is
 * exactly how the first version blew the 25 MiB Cloudflare cap. So the target
 * is the budget, and the bitrate is derived from it:
 *
 *     video bitrate = (budget × 8 / duration) − audio bitrate
 *
 * Two passes, because one-pass VBR overshoots on exactly the material that is
 * already tight. Long films get scaled down as well — below roughly 1.2 Mbit/s
 * a 1080p picture is worse than a clean 720p one at the same size.
 */
function encodeFilm(bin, source, dest, label) {
  const duration = probeDuration(bin, source);
  const audioKbps = 96;
  const budgetBits = TARGET_BYTES * 8;
  const videoKbps = Math.floor(budgetBits / duration / 1000) - audioKbps;

  if (videoKbps < 200) {
    fail(
      `${label} is ${Math.round(duration)}s long. Fitting it under ${(MAX_BYTES / 1024 / 1024) | 0} MiB ` +
        `would need ${videoKbps} kbit/s, which would look broken.\n` +
        `  Cut the film down, or move the films to Cloudflare R2 and drop the size cap.`,
    );
  }

  // Keep the picture only as large as the bitrate can carry.
  const scale = videoKbps < 1200 ? 'scale=-2:720' : videoKbps < 2500 ? 'scale=-2:1080' : null;
  const logFile = path.join(os.tmpdir(), `nb-teaser-${path.basename(dest, '.mp4')}`);
  const nullSink = process.platform === 'win32' ? 'NUL' : '/dev/null';
  const common = ['-c:v', 'libx264', '-b:v', `${videoKbps}k`, '-preset', 'medium', '-pix_fmt', 'yuv420p'];
  if (scale) common.push('-vf', scale);

  console.log(
    `  ${Math.round(duration)}s → ${videoKbps} kbit/s${scale ? `, ${scale.split(':')[1]}p` : ''} (2 passes)`,
  );

  run(bin, ['-y', '-i', source, ...common, '-pass', '1', '-passlogfile', logFile, '-an', '-f', 'mp4', nullSink],
    `${label} (pass 1)`);
  run(bin, ['-y', '-i', source, ...common, '-pass', '2', '-passlogfile', logFile,
    '-c:a', 'aac', '-b:a', `${audioKbps}k`, '-movflags', '+faststart', dest], `${label} (pass 2)`);

  // Two-pass logs are scratch; leaving them in tmp is untidy, not harmful.
  for (const f of [`${logFile}-0.log`, `${logFile}-0.log.mbtree`]) {
    if (fs.existsSync(f)) fs.unlinkSync(f);
  }
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

/* Codes first: forgetting one is the commonest mistake by far, and checking
   the directory ahead of it answered "ops/teaser-src/ does not exist" to a
   founder whose real problem was an unset variable. */
for (const teaser of TEASERS) {
  const code = (process.env[teaser.codeEnv] ?? '').trim();
  if (!code) fail(`${teaser.codeEnv} is not set. Every teaser needs its own 4-digit code.`);
  if (!/^\d{4}$/.test(code)) fail(`${teaser.codeEnv} must be exactly 4 digits — got "${code}".`);
}

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

  // Full film, encoded to fit the cap rather than to a fixed quality.
  // faststart moves the index to the front so the browser can start playing
  // before the whole file has arrived.
  encodeFilm(ffmpeg, job.source, filmPath, `${job.id} film`);

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
    /* Remove the oversize file before refusing. Failing with it still on disk
       left an undeployable film in public/ AND skipped the sweep below, so the
       previously retired code kept working — the opposite of what a refusal
       should leave behind. The earlier films stay as they were: no sweep has
       run, so whatever worked before this run still works. */
    fs.unlinkSync(filmPath);
    fail(
      `${job.film} came out at ${mib} MiB. Cloudflare static assets cap a single file at ` +
        `25 MiB, so this would fail the deploy.\n` +
        `  Nothing was swept — the previously generated films and their codes still work.\n` +
        `  Shorten the film or re-run with a higher -crf.`,
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
/* Dotfiles are exempt: public/teaser/ cannot exist in git while empty, so a
   .gitkeep is the natural way to carry it — and the sweep used to eat it. */
const stale = fs.readdirSync(OUT_DIR).filter((f) => !f.startsWith('.') && !keep.has(f));
for (const f of stale) {
  fs.unlinkSync(path.join(OUT_DIR, f));
  console.log(`removed stale ${f}`);
}

console.log(
  `✓ ${jobs.length} teaser${jobs.length === 1 ? '' : 's'} built.\n` +
    `  Commit ${rel(OUT_DIR)}/ and deploy. The codes stay out of the repo — ` +
    `they only ever live in your shell and in the conversations where you hand them out.`,
);
