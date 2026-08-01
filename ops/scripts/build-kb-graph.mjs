#!/usr/bin/env node
/**
 * Builds docs/INDEX.md — the knowledge graph over this repo's documentation.
 *
 * Why this exists: four different files once disagreed about our own domain
 * (see D-020). Prose cross-references rot silently. Declared edges do not,
 * because this script refuses to build when one is broken.
 *
 * Zero dependencies on purpose — node builtins only. This repo must be
 * understandable by one person at 2am.
 *
 * Run: npm run kb
 * Exit 0 = graph written, no errors. Exit 1 = broken edges, nothing written.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const DOCS = path.join(ROOT, 'docs');
const OUT = path.join(DOCS, 'INDEX.md');

/**
 * Root artifacts that belong in the graph but must NOT carry frontmatter.
 * DESIGN.md and PRODUCT.md are parsed by the impeccable skill with
 * format-specific parsers (scripts/lib/design-parser.mjs,
 * scripts/lib/artifact-schema.mjs) and are located as repo-root artifacts by
 * scripts/lib/staleness-deep.mjs. Injecting YAML into them risks breaking the
 * detector, so the graph declares them here instead.
 */
const EXTERNAL_NODES = [
  { id: 'claude-md', title: 'CLAUDE.md (constitution)', type: 'constitution', file: 'CLAUDE.md', depends_on: ['state', 'agent-system'] },
  { id: 'design', title: 'DESIGN.md (visual world)', type: 'artifact', file: 'DESIGN.md', depends_on: ['brand'] },
  { id: 'product', title: 'PRODUCT.md (product schema)', type: 'artifact', file: 'PRODUCT.md', depends_on: ['vision', 'offer', 'brand'] },
  { id: 'readme', title: 'README.md (repo map)', type: 'artifact', file: 'README.md', depends_on: ['state'] },
];

/**
 * The routing table at the top of INDEX.md. Keyed by node id, never by filename —
 * a renamed file must not be able to rot this quietly, which is the entire point
 * of the script. An id here with no matching doc fails the build.
 */
const ROUTING = [
  ['vision', 'What is this venture, who are we, what is out of scope?'],
  ['offer', 'What do we sell, at what price, to whom?'],
  ['brand', 'What may I write, what may I not? Colours, voice, banned words?'],
  ['website-spec', 'What is the website supposed to be?'],
  ['delivery', 'How do we run a client project?'],
  ['decisions', 'Why is something the way it is?'],
  ['agent-system', 'How do the agents work together?'],
  ['state', '**Where do things stand right now?**'],
];

const VALID_TYPES = new Set([
  'knowledge', 'spec', 'playbook', 'decision-log', 'research', 'client', 'constitution', 'artifact', 'state',
]);
const VALID_STATUS = new Set(['active', 'draft', 'superseded']);

// ─── tiny YAML-subset frontmatter parser ────────────────────────────────────
// Handles exactly what our schema uses: `key: scalar` and `key: [a, b, c]`.
// Anything more exotic is a signal the schema is drifting, not a parser gap.
function parseFrontmatter(raw, file) {
  if (!raw.startsWith('---')) return { data: null, body: raw };
  const end = raw.indexOf('\n---', 3);
  if (end === -1) throw new Error(`${file}: frontmatter opened but never closed`);
  const block = raw.slice(3, end).trim();
  const body = raw.slice(end + 4);
  const data = {};
  for (const line of block.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const colon = trimmed.indexOf(':');
    if (colon === -1) throw new Error(`${file}: unparseable frontmatter line: ${trimmed}`);
    const key = trimmed.slice(0, colon).trim();
    let value = trimmed.slice(colon + 1).trim();
    if (value.startsWith('[') && value.endsWith(']')) {
      const inner = value.slice(1, -1).trim();
      data[key] = inner ? inner.split(',').map((s) => s.trim().replace(/^['"]|['"]$/g, '')).filter(Boolean) : [];
    } else {
      data[key] = value.replace(/^['"]|['"]$/g, '');
    }
  }
  return { data, body };
}

function walk(dir, acc = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, acc);
    else if (entry.name.endsWith('.md')) acc.push(full);
  }
  return acc;
}

const rel = (p) => path.relative(ROOT, p).split(path.sep).join('/');

// ─── decisions ──────────────────────────────────────────────────────────────
/** Pull D-entries out of the append-only decision log. */
function parseDecisions(body) {
  const out = new Map();
  //  ## D-018 | 2026-07-27 | Pricing: one public price only | DECIDED — supersedes D-007
  const re = /^##\s+(D-\d{3})\s*\|\s*([\d-]+)\s*\|\s*(.+?)\s*\|\s*(.+)$/gm;
  let m;
  while ((m = re.exec(body)) !== null) {
    const [, id, date, title, statusRaw] = m;
    const status = /SUPERSEDED/i.test(statusRaw) ? 'superseded'
      : /PENDING/i.test(statusRaw) ? 'pending'
        : 'decided';
    out.set(id, { id, date, title, status, statusRaw: statusRaw.trim() });
  }
  return out;
}

// ─── collect ────────────────────────────────────────────────────────────────
const errors = [];
const warnings = [];
const nodes = new Map();

for (const file of walk(DOCS)) {
  if (path.basename(file) === 'INDEX.md') continue; // generated; never an input
  const raw = fs.readFileSync(file, 'utf8');
  const { data, body } = parseFrontmatter(raw, rel(file));
  if (!data) {
    errors.push(`${rel(file)}: missing frontmatter. Every doc in docs/ is a graph node — add an \`id\`.`);
    continue;
  }
  for (const required of ['id', 'title', 'type', 'status', 'owner', 'updated']) {
    if (!data[required]) errors.push(`${rel(file)}: frontmatter missing required key \`${required}\``);
  }
  if (data.type && !VALID_TYPES.has(data.type)) {
    errors.push(`${rel(file)}: unknown type \`${data.type}\` (valid: ${[...VALID_TYPES].join(', ')})`);
  }
  if (data.status && !VALID_STATUS.has(data.status)) {
    errors.push(`${rel(file)}: unknown status \`${data.status}\` (valid: ${[...VALID_STATUS].join(', ')})`);
  }
  if (data.feeds) {
    errors.push(`${rel(file)}: \`feeds\` is computed from other docs' \`depends_on\`, not declared. Remove it.`);
  }
  if (nodes.has(data.id)) {
    errors.push(`${rel(file)}: duplicate id \`${data.id}\` (also in ${nodes.get(data.id).file})`);
    continue;
  }
  const links = [...body.matchAll(/\[\[([a-z0-9-]+)\]\]/g)].map((m) => m[1]);
  nodes.set(data.id, {
    ...data,
    file: rel(file),
    depends_on: data.depends_on || [],
    decisions: data.decisions || [],
    cites_history: data.cites_history || [],
    links: [...new Set(links)],
    external: false,
  });
}

for (const ext of EXTERNAL_NODES) {
  const abs = path.join(ROOT, ext.file);
  if (!fs.existsSync(abs)) {
    errors.push(`${ext.file}: declared as an external graph node but the file does not exist`);
    continue;
  }
  nodes.set(ext.id, {
    status: 'active', owner: 'partner-b', updated: '—',
    decisions: [], cites_history: [], links: [],
    ...ext, external: true,
  });
}

const log = [...nodes.values()].find((n) => n.type === 'decision-log');
const decisions = log
  ? parseDecisions(fs.readFileSync(path.join(ROOT, log.file), 'utf8'))
  : new Map();
if (!log) errors.push('No doc with `type: decision-log` found — expected docs/05-decisions.md');

// ─── validate edges ─────────────────────────────────────────────────────────
const feeds = new Map([...nodes.keys()].map((id) => [id, []]));

for (const node of nodes.values()) {
  for (const dep of node.depends_on) {
    if (!nodes.has(dep)) {
      errors.push(`${node.file}: \`depends_on: [${dep}]\` — no doc declares \`id: ${dep}\``);
    } else {
      feeds.get(dep).push(node.id);
    }
  }
  for (const link of node.links) {
    if (!nodes.has(link)) {
      errors.push(`${node.file}: body links to [[${link}]] — no doc declares \`id: ${link}\``);
    }
  }
  for (const d of node.decisions) {
    const found = decisions.get(d);
    if (!found) {
      errors.push(`${node.file}: cites \`${d}\` — no such entry in the decision log`);
    } else if (found.status === 'superseded') {
      errors.push(
        `${node.file}: cites \`${d}\` as live, but it is SUPERSEDED (${found.statusRaw}). `
        + `Point at the superseding entry, or move it to \`cites_history:\` if the reference is deliberately historical.`,
      );
    } else if (found.status === 'pending') {
      warnings.push(`${node.file}: depends on \`${d}\`, which is still PENDING — work built on it may be premature`);
    }
  }
  for (const d of node.cites_history) {
    if (!decisions.get(d)) errors.push(`${node.file}: \`cites_history: [${d}]\` — no such entry in the decision log`);
  }
}

for (const [id] of ROUTING) {
  if (!nodes.has(id)) errors.push(`ROUTING table in ${rel(fileURLToPath(import.meta.url))} points at \`${id}\` — no doc declares that id`);
}

// ─── report ─────────────────────────────────────────────────────────────────
if (errors.length) {
  console.error(`\n✗ Knowledge graph has ${errors.length} broken edge${errors.length === 1 ? '' : 's'}. ${rel(OUT)} not written.\n`);
  for (const e of errors) console.error(`  • ${e}`);
  console.error('');
  process.exit(1);
}

// ─── emit ───────────────────────────────────────────────────────────────────
const mid = (id) => id.replace(/-/g, '_');
/** Link target relative to docs/, since INDEX.md lives there. */
const docHref = (node) => path.relative(DOCS, path.join(ROOT, node.file)).split(path.sep).join('/');
const byType = (t) => [...nodes.values()].filter((n) => n.type === t).sort((a, b) => a.id.localeCompare(b.id));
const ordered = [...nodes.values()].sort((a, b) => a.file.localeCompare(b.file));

const mermaid = [];
for (const node of ordered) {
  for (const dep of node.depends_on) mermaid.push(`  ${mid(dep)} --> ${mid(node.id)}`);
  for (const link of node.links) {
    if (!node.depends_on.includes(link)) mermaid.push(`  ${mid(node.id)} -.-> ${mid(link)}`);
  }
}

const decisionRows = [...decisions.values()].map((d) => {
  const citedBy = [...nodes.values()].filter((n) => n.decisions.includes(d.id)).map((n) => `\`${n.id}\``);
  const mark = d.status === 'superseded' ? '~~' : '';
  return `| ${mark}${d.id}${mark} | ${d.date} | ${d.title} | ${d.statusRaw} | ${citedBy.join(', ') || '—'} |`;
});

const pending = [...decisions.values()].filter((d) => d.status === 'pending');

const out = `<!-- GENERATED BY ops/scripts/build-kb-graph.mjs — DO NOT EDIT BY HAND.
     Regenerate with \`npm run kb\`. Edit the frontmatter in the source docs instead. -->

# Knowledge graph

The map of this repo's knowledge base. **Read this first** — it tells you which document answers
your question, so you open one file instead of six.

Edges are declared, not inferred: each doc's frontmatter names what it \`depends_on\`, and
\`npm run kb\` refuses to build when an edge points at nothing. Prose cross-references rot
silently; this does not.

Generated ${new Date().toISOString().slice(0, 10)} · ${nodes.size} nodes · ${decisions.size} decisions

## Map

\`\`\`mermaid
graph LR
${[...nodes.values()].map((n) => `  ${mid(n.id)}["${n.id}"]`).join('\n')}

${[...new Set(mermaid)].join('\n')}
\`\`\`

Solid arrow = declared dependency (\`depends_on\`). Dotted = a body reference (\`[[link]]\`).

## Where to look

| Question | Read |
|---|---|
${ROUTING.map(([id, q]) => `| ${q} | [\`${id}\`](${docHref(nodes.get(id))}) |`).join('\n')}

## Nodes

| id | title | type | status | owner | updated | file | feeds |
|---|---|---|---|---|---|---|---|
${ordered.map((n) => `| \`${n.id}\` | ${n.title} | ${n.type} | ${n.status} | ${n.owner} | ${n.updated} | [${n.file}](${docHref(n)}) | ${(feeds.get(n.id) || []).map((f) => `\`${f}\``).join(', ') || '—'} |`).join('\n')}

${['knowledge', 'spec', 'playbook', 'research', 'client'].map((t) => {
  const list = byType(t);
  return list.length ? `**${t}**: ${list.map((n) => `\`${n.id}\``).join(', ')}` : null;
}).filter(Boolean).join(' · ')}

## Decisions

Append-only log. Superseded entries are struck through — they are history, not state.
A doc may only cite a live decision; citing a superseded one fails the build.

| # | date | decision | status | cited by |
|---|---|---|---|---|
${decisionRows.join('\n')}

${pending.length
    ? `### ⏳ Pending — work that depends on these is blocked\n\n${pending.map((d) => `- **${d.id}** — ${d.title}`).join('\n')}`
    : '_No pending decisions._'}

${warnings.length ? `## ⚠ Warnings\n\n${warnings.map((w) => `- ${w}`).join('\n')}\n` : ''}---

_${nodes.size} nodes, ${[...new Set(mermaid)].length} edges, 0 broken. Rebuild: \`npm run kb\`._
`;

fs.writeFileSync(OUT, out, 'utf8');
console.log(`✓ ${rel(OUT)} — ${nodes.size} nodes, ${[...new Set(mermaid)].length} edges, ${decisions.size} decisions.`);
if (warnings.length) {
  console.log(`\n⚠ ${warnings.length} warning${warnings.length === 1 ? '' : 's'}:`);
  for (const w of warnings) console.log(`  • ${w}`);
}
