#!/usr/bin/env node
/**
 * PreToolUse hook on Bash, registered in .claude/settings.json (D-070).
 *
 * Refuses a `git commit` issued from a Claude Code session while a file the
 * knowledge graph covers differs from HEAD and the graph build is red or
 * docs/INDEX.md is stale. CLAUDE.md rule 7 said "run npm run kb before commit"
 * for months and nothing enforced it; a rule that only prose enforces is a
 * wish, and INDEX.md once rotted exactly that way. A commit made outside a
 * session (a terminal, another tool) is not gated: run `npm run kb` by hand.
 *
 * Claude Code's own hook machinery, not a framework: node builtins only, exit 2
 * blocks the command, and what this script writes to stderr is what Claude
 * reads. It runs on every Bash call (one node start) and exits 0 at once unless
 * the command commits; the graph build itself takes well under a second.
 *
 * The hook runs BEFORE the command, so it cannot see what `git add … &&
 * git commit` or `git commit -a` will stage. It therefore gates on every
 * graph-covered file that differs from HEAD — staged, unstaged or untracked —
 * which is also what the build reads: `npm run kb` works on the working tree,
 * and it REWRITES docs/INDEX.md there as a side effect, on a refusal too. A
 * `git rm`/`git mv` step in the same command is refused outright, because the
 * build cannot see a deletion that has not happened yet. Known edges it does
 * not try to cover: globs in pathspecs (refused conservatively), and a commit
 * driven by a wrapper script rather than a `git …` step.
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const INDEX = 'docs/INDEX.md';

/**
 * Paths the graph build checks. Keep in step with EXTERNAL_NODES, LINE_BUDGETS
 * and PROSE_CITERS in build-kb-graph.mjs, and with CLAUDE.md rule 7.
 */
const WATCHED = [
  /^docs\//,
  /^(CLAUDE|README|DESIGN|PRODUCT)\.md$/,
  /^website\/CLAUDE\.md$/,
  /^\.claude\/agents\//,
  /^\.claude\/commands\//,
  /^ops\/scripts\/build-kb-graph\.mjs$/,
];
const isWatched = (p) => WATCHED.some((re) => re.test(p) || re.test(`${p}/`));

let command = '';
try {
  command = String(JSON.parse(fs.readFileSync(0, 'utf8'))?.tool_input?.command ?? '');
} catch {
  process.exit(0); // not a payload we understand — never block on our own bug
}

// ─── parse the command ──────────────────────────────────────────────────────
// Quoted strings are messages and arguments, not commands: `git commit -m "add -a flag"`.
const bare = command.replace(/"(?:\\.|[^"\\])*"|'[^']*'/g, '""');
// git's global options before the subcommand: `git -C <dir> commit`, `git -c k=v commit`, `git --no-pager commit`.
const OPT = String.raw`(?:-[cC]\s+\S+|--(?:work-tree|git-dir|namespace|exec-path)\s+\S+|--?[\w-]+(?:=\S+)?)`;
/** `git <name> …` at the start of a shell step (also `/usr/bin/git`, `\git`); group 1 is the rest of that step. */
const step = (name, flags = '') =>
  new RegExp(String.raw`(?:^|[;&|(\n])\s*(?:\S*/|\\)?git(?:\s+${OPT})*\s+${name}(?=\s|$)([^;&|\n]*)`, flags);
const commit = bare.match(step('commit'));
if (!commit) process.exit(0);

const tokensOf = (m) => m[1].split(/\s+/).filter(Boolean);
const norm = (t) => t.replace(/^\.\//, '').replace(/\/+$/, '');
/** Steps of the given kind that run BEFORE the commit; text after it is message, not command. */
const stepsBefore = (name) => [...bare.matchAll(step(name, 'g'))].filter((m) => m.index < commit.index);

/** Options that take the next token as a value, so that `-m docs` is a message, not a pathspec. */
const VALUE_OPTS = new Set(['-m', '-F', '-t', '-C', '-c', '--author', '--date', '--cleanup', '--fixup',
  '--squash', '--reuse-message', '--reedit-message', '--template', '--file', '--message', '--trailer',
  '--pathspec-from-file']);
function pathspecsOf(tokens) {
  const out = [];
  let afterDashes = false;
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    if (afterDashes) { out.push(t); continue; }
    if (t === '--') { afterDashes = true; continue; }
    if (VALUE_OPTS.has(t)) { i++; continue; }
    if (t.startsWith('-') || t === '""') continue;
    out.push(t);
  }
  return out.map(norm).filter(Boolean);
}

// A `git rm`/`git mv` (or plain rm/mv) step runs after this hook and before the commit, so the
// build cannot see it. Refuse when it names a graph-covered path: split the command instead.
const plainRmMv = [...bare.matchAll(/(?:^|[;&|(\n])\s*(?:rm|mv)\s+([^;&|\n]*)/g)].filter((m) => m.index < commit.index);
const removed = [...stepsBefore('rm'), ...stepsBefore('mv'), ...plainRmMv]
  .flatMap((m) => tokensOf(m).filter((t) => !t.startsWith('-') && t !== '""').map(norm))
  .filter(isWatched);
if (removed.length) {
  process.stderr.write(
    `Commit refused: the command deletes or moves graph-covered paths (${[...new Set(removed)].join(', ')}) in the `
    + 'same step as the commit, and the graph build cannot see a change that has not happened yet. '
    + 'Delete or move first, run `npm run kb`, then commit in a separate command.\n',
  );
  process.exit(2);
}

// ─── what differs from HEAD ─────────────────────────────────────────────────
const git = (...args) => spawnSync('git', ['-c', 'core.quotepath=off', ...args], { cwd: ROOT, encoding: 'utf8' });
const list = (out) => (out || '').split('\0').filter(Boolean);
const staged = list(git('diff', '--cached', '--name-only', '-z').stdout).filter(isWatched);
// docs/INDEX.md is generated, so it is handled on its own below, never as a pending edit.
const unstaged = list(git('diff', '--name-only', '-z').stdout).filter((f) => isWatched(f) && f !== INDEX);
const untracked = list(git('ls-files', '--others', '--exclude-standard', '-z').stdout).filter(isWatched);
if (!staged.length && !unstaged.length && !untracked.length) process.exit(0);
const changed = [...new Set([...staged, ...unstaged, ...untracked])];

const build = spawnSync(process.execPath, [path.join(ROOT, 'ops', 'scripts', 'build-kb-graph.mjs')], {
  cwd: ROOT,
  encoding: 'utf8',
});
if (build.status !== 0) {
  process.stderr.write(
    `Commit refused: the knowledge graph is red (CLAUDE.md rule 7). Graph-covered changes: ${changed.join(', ')}\n`
    + `${build.stderr || build.stdout}`
    + 'Fix the cause, never the symptom, then commit again.\n',
  );
  process.exit(2);
}
if (git('ls-files', '--error-unmatch', INDEX).status !== 0) {
  process.stderr.write(`Commit refused: ${INDEX} is not tracked. Run \`git add ${INDEX}\` in a separate command, then commit again.\n`);
  process.exit(2);
}

// ─── what the command itself will stage ─────────────────────────────────────
const isPath = (t) => fs.existsSync(path.join(ROOT, t))
  || git('ls-files', '--error-unmatch', '--', t).status === 0
  || [...unstaged, ...untracked].some((f) => f === t || f.startsWith(`${t}/`));
const addTokens = stepsBefore('add').flatMap(tokensOf);
const addPaths = pathspecsOf(addTokens).filter((t) => t !== '.' && isPath(t));
const addsEverything = addTokens.some((t) => t === '-A' || t === '--all' || t === '.') && addPaths.length === 0;
const commitTokens = tokensOf(commit);
const commitAll = commitTokens.some((t) => t === '--all' || /^-[a-zA-Z]*a[a-zA-Z]*$/.test(t));
const commitPaths = pathspecsOf(commitTokens).filter(isPath);
const addsTracked = addsEverything || commitAll || addTokens.some((t) => t === '-u' || t === '--update');
const under = (file, paths) => paths.some((p) => file === p || file.startsWith(`${p}/`));
const covered = (file, tracked) => addsEverything || (tracked && addsTracked) || under(file, [...addPaths, ...commitPaths]);

// `git commit <paths>` commits only those paths, whatever is staged elsewhere. Then every
// graph-covered change must be named, and docs/INDEX.md too when it differs from HEAD.
const commitLimited = commitPaths.length > 0 && !commitAll && !commitTokens.some((t) => t === '-i' || t === '--include');
if (commitLimited) {
  const left = changed.filter((f) => !under(f, commitPaths));
  if (git('diff', '--quiet', 'HEAD', '--', INDEX).status !== 0 && !under(INDEX, commitPaths)) left.push(INDEX);
  if (left.length) {
    process.stderr.write(
      `Commit refused: a pathspec commit would leave graph-covered changes out: ${[...new Set(left)].join(', ')}. `
      + `Name them (and ${INDEX}) in the pathspec, or commit without one.\n`,
    );
    process.exit(2);
  }
  process.exit(0);
}

// The build just rewrote docs/INDEX.md. If the staged copy equals it, the commit is consistent.
if (git('diff', '--quiet', '--', INDEX).status === 0) process.exit(0);
// Otherwise the command must stage the fresh INDEX.md together with every pending edit the build saw.
const pending = [...unstaged.filter((f) => !covered(f, true)), ...untracked.filter((f) => !covered(f, false))];
if (pending.length) {
  process.stderr.write(
    `Commit refused: ${INDEX} was rebuilt from the working tree, which has graph-covered edits this `
    + `commit would not include: ${pending.join(', ')}. Stage them together with ${INDEX} in a separate `
    + 'command (or stash them), then commit again.\n',
  );
  process.exit(2);
}
if (!covered(INDEX, true)) {
  process.stderr.write(
    `Commit refused: the graph build regenerated ${INDEX} and the staged copy is stale. `
    + `Run \`git add ${INDEX}\` in a separate command, then commit again.\n`,
  );
  process.exit(2);
}
process.exit(0);
