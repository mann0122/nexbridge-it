/**
 * Self-hosted, cookieless website stats (D-063).
 *
 * Two routes, both same-origin only (no CORS headers on purpose):
 *
 *   POST /api/hit    the beacon (src/scripts/beacon.ts). One row per page
 *                    view or named click. Answers 204 before the row is
 *                    written — the write rides ctx.waitUntil.
 *   GET  /api/stats  the dashboard's feed (src/scripts/stats.ts). Needs
 *                    `Authorization: Bearer <STATS_KEY>` and returns
 *                    aggregates only — never a row.
 *
 * What is NOT here, deliberately: no cookie, no id, no IP or user agent at
 * rest. A visitor is SHA-256(salt | ip | ua) cut to 16 hex, under a salt that
 * is random per UTC day and deleted afterwards (lazily by the first hit of
 * the next day, and reliably by the daily cron — `housekeeping`). The token
 * links one visitor's hits within a day, which is how "visitors" is counted,
 * and the same person tomorrow is a new token. Be exact about the limit:
 * once the salt row is gone it cannot be recomputed from the database, but
 * D1's Time Travel keeps point-in-time backups of the store for a bounded
 * window, so "deleted" means deleted from the live database, not from every
 * backup — the Datenschutz text (D-064) is worded to that, not beyond it.
 *
 * The schema is worker/migrations/0001_stats.sql; the payload and JSON shape
 * are the contract with the two scripts named above. Change them together.
 */

/** Payload field grammar. Anything outside it is a 400, not a guess. */
const EVENT = /^[a-z0-9_.-]{1,40}$/;
const VALUE = /^[A-Za-z0-9._:/@-]{0,80}$/;
const PATH = /^\/[A-Za-z0-9._~/-]{0,199}$/;
const LANG = /^[a-z]{2}$/;
const COUNTRY = /^[A-Z]{2}$/;

/* Crawlers that run JS and would otherwise count as visitors. The beacon
   already drops `navigator.webdriver` (Lighthouse, Playwright) on its side;
   this is the server's second look. Kept narrow — a false match hides a real
   visitor, a false pass costs one row. */
const BOT_UA =
  /bot|crawl|spider|slurp|headless|lighthouse|pagespeed|ptst|python|curl|wget|java\/|okhttp|phantom|selenium|puppeteer|playwright|scrapy|httpclient|monitor/i;

/** Bodies are ~150 bytes; anything past this is not the beacon. */
const MAX_BODY = 1024;

const RANGES = new Set([7, 30, 90]);

const DAY_MS = 86_400_000;

/* -------------------------------------------------------------------- */
/* POST /api/hit                                                         */
/* -------------------------------------------------------------------- */

export async function handleHit(request, env, ctx) {
  if (request.method !== 'POST') return json({ error: 'method' }, 405, { Allow: 'POST' });

  const length = Number(request.headers.get('content-length') ?? 0);
  if (length > MAX_BODY) return json({ error: 'too large' }, 413);
  const text = await request.text();
  if (text.length > MAX_BODY) return json({ error: 'too large' }, 413);

  let body;
  try {
    body = JSON.parse(text);
  } catch {
    return json({ error: 'json' }, 400);
  }
  const hit = normalise(body, request);
  if (!hit) return json({ error: 'payload' }, 400);

  // Same answer for a bot as for a visitor: a crawler that can tell it was
  // filtered has been handed a test to pass.
  const ua = request.headers.get('user-agent') ?? '';
  if (!ua || BOT_UA.test(ua)) return new Response(null, { status: 204 });

  ctx.waitUntil(
    store(env.DB, hit, request.headers.get('cf-connecting-ip') ?? '', ua).catch((err) => {
      // A lost row, not a lost visitor: the page already has its 204.
      console.error(JSON.stringify({ route: 'hit', error: String(err) }));
    }),
  );
  return new Response(null, { status: 204 });
}

/** The beacon's `{e, v, p, r, l, w}` as a row, or null when it is not one. */
function normalise(body, request) {
  if (!body || typeof body !== 'object') return null;
  const { e, v = '', p, r = '', l = '', w } = body;
  if (typeof e !== 'string' || !EVENT.test(e)) return null;
  if (typeof v !== 'string' || !VALUE.test(v)) return null;
  if (typeof p !== 'string') return null;
  if (typeof r !== 'string' || r.length > 2048) return null;

  // Query and hash never reach a row; a trailing slash is the same page
  // (auto-trailing-slash serves both spellings).
  let path = p.split(/[?#]/, 1)[0];
  if (path.length > 1 && path.endsWith('/')) path = path.slice(0, -1);
  if (!PATH.test(path)) return null;

  return {
    event: e,
    value: v,
    path,
    ref: referrerHost(r, request),
    lang: typeof l === 'string' && LANG.test(l) ? l : '',
    device: deviceClass(w),
    country: countryOf(request),
  };
}

/** The referrer's host alone; '' for direct visits and our own pages. */
function referrerHost(r, request) {
  if (!r) return '';
  let host;
  try {
    host = new URL(r).hostname.toLowerCase();
  } catch {
    return '';
  }
  const own = new URL(request.url).hostname.toLowerCase();
  const bare = (h) => h.replace(/^www\./, '');
  return bare(host) === bare(own) ? '' : host;
}

/* Breakpoints are Tailwind's md/lg — the same lines the layout changes on,
   so "mobile" here means "saw the mobile layout". */
function deviceClass(w) {
  if (typeof w !== 'number' || !Number.isFinite(w) || w <= 0) return '';
  if (w < 768) return 'mobile';
  if (w < 1024) return 'tablet';
  return 'desktop';
}

function countryOf(request) {
  const c = request.cf?.country;
  return typeof c === 'string' && COUNTRY.test(c) ? c : '';
}

async function store(db, hit, ip, ua) {
  const now = new Date();
  const day = now.toISOString().slice(0, 10);
  const salt = await dailySalt(db, day);
  const visitor = (await sha256Hex(`${salt}|${ip}|${ua}`)).slice(0, 16);
  await db
    .prepare(
      'INSERT INTO hits (ts, day, event, value, path, ref, lang, device, country, visitor) ' +
        'VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)',
    )
    .bind(
      Math.floor(now.getTime() / 1000),
      day,
      hit.event,
      hit.value,
      hit.path,
      hit.ref,
      hit.lang,
      hit.device,
      hit.country,
      visitor,
    )
    .run();
}

/**
 * Today's salt, created by whoever asks first. One batch = one transaction:
 * concurrent first beacons of a day all insert-or-ignore, then all read the
 * single winner. The delete removes past days from the live database (the
 * cron in wrangler.jsonc does the same without waiting for a visitor).
 */
async function dailySalt(db, day) {
  const fresh = randomHex(16);
  const [, read] = await db.batch([
    db.prepare('INSERT OR IGNORE INTO salts (day, salt) VALUES (?1, ?2)').bind(day, fresh),
    db.prepare('SELECT salt FROM salts WHERE day = ?1').bind(day),
    db.prepare('DELETE FROM salts WHERE day < ?1').bind(day),
  ]);
  return read.results?.[0]?.salt ?? fresh;
}

/* -------------------------------------------------------------------- */
/* GET /api/stats                                                        */
/* -------------------------------------------------------------------- */

export async function handleStats(request, env) {
  if (request.method !== 'GET') return json({ error: 'method' }, 405, { Allow: 'GET' });
  // Unset in a deploy = nobody can read, and the dashboard says why. Never
  // fall back to a default key.
  if (!env.STATS_KEY) return json({ error: 'stats key not configured' }, 503);
  if (!(await bearerMatches(request, env.STATS_KEY))) {
    return json({ error: 'unauthorized' }, 401, { 'WWW-Authenticate': 'Bearer' });
  }

  const days = Number(new URL(request.url).searchParams.get('days') ?? 30);
  if (!RANGES.has(days)) return json({ error: 'days' }, 400);

  const to = new Date();
  const from = new Date(to.getTime() - (days - 1) * DAY_MS);
  const range = { from: from.toISOString().slice(0, 10), to: to.toISOString().slice(0, 10), days };
  const win = (sql) => env.DB.prepare(sql).bind(range.from, range.to);

  // One round trip. `event = 'pageview'` rows are visits; everything else is
  // a named click. "visitors" is COUNT(DISTINCT) of a hash that rotates
  // daily, so across a range it is the sum of daily uniques — the dashboard
  // labels it that way.
  const [totals, series, pages, referrers, countries, devices, langs, events] = await env.DB.batch([
    win(
      "SELECT COALESCE(SUM(event = 'pageview'), 0) AS views, " +
        "COUNT(DISTINCT CASE WHEN event = 'pageview' THEN visitor END) AS visitors, " +
        "COALESCE(SUM(event <> 'pageview'), 0) AS events FROM hits WHERE day BETWEEN ?1 AND ?2",
    ),
    win(
      "SELECT day, SUM(event = 'pageview') AS views, " +
        "COUNT(DISTINCT CASE WHEN event = 'pageview' THEN visitor END) AS visitors " +
        'FROM hits WHERE day BETWEEN ?1 AND ?2 GROUP BY day ORDER BY day',
    ),
    win(
      'SELECT path, COUNT(*) AS views, COUNT(DISTINCT visitor) AS visitors FROM hits ' +
        "WHERE day BETWEEN ?1 AND ?2 AND event = 'pageview' GROUP BY path ORDER BY views DESC LIMIT 20",
    ),
    win(
      'SELECT ref, COUNT(*) AS views FROM hits ' +
        "WHERE day BETWEEN ?1 AND ?2 AND event = 'pageview' GROUP BY ref ORDER BY views DESC LIMIT 10",
    ),
    win(
      'SELECT country, COUNT(DISTINCT visitor) AS visitors FROM hits ' +
        "WHERE day BETWEEN ?1 AND ?2 AND event = 'pageview' GROUP BY country ORDER BY visitors DESC LIMIT 10",
    ),
    win(
      'SELECT device, COUNT(DISTINCT visitor) AS visitors FROM hits ' +
        "WHERE day BETWEEN ?1 AND ?2 AND event = 'pageview' GROUP BY device ORDER BY visitors DESC LIMIT 10",
    ),
    win(
      'SELECT lang, COUNT(*) AS views FROM hits ' +
        "WHERE day BETWEEN ?1 AND ?2 AND event = 'pageview' GROUP BY lang ORDER BY views DESC",
    ),
    win(
      'SELECT event, value, COUNT(*) AS count FROM hits ' +
        "WHERE day BETWEEN ?1 AND ?2 AND event <> 'pageview' GROUP BY event, value ORDER BY count DESC LIMIT 50",
    ),
  ]);

  return json({
    range,
    totals: totals.results[0] ?? { views: 0, visitors: 0, events: 0 },
    series: zeroFill(series.results, from, days),
    pages: pages.results,
    referrers: referrers.results,
    countries: countries.results,
    devices: devices.results,
    langs: langs.results,
    events: events.results,
  });
}

/** Every day of the range in order, zero where nothing was counted. */
function zeroFill(rows, from, days) {
  const byDay = new Map(rows.map((r) => [r.day, r]));
  const out = [];
  for (let i = 0; i < days; i++) {
    const day = new Date(from.getTime() + i * DAY_MS).toISOString().slice(0, 10);
    const r = byDay.get(day);
    out.push({ day, views: r?.views ?? 0, visitors: r?.visitors ?? 0 });
  }
  return out;
}

/* Both sides hashed first so the comparison sees two equal-length buffers
   whatever the key's length — a plain `===` would leak length and prefix
   through timing. */
async function bearerMatches(request, key) {
  const header = request.headers.get('authorization') ?? '';
  const given = header.startsWith('Bearer ') ? header.slice(7).trim() : '';
  if (!given) return false;
  const [a, b] = await Promise.all([sha256(given), sha256(key)]);
  return crypto.subtle.timingSafeEqual(a, b);
}

/* -------------------------------------------------------------------- */
/* Scheduled housekeeping                                                */
/* -------------------------------------------------------------------- */

/** Rows older than this are dropped. Two years of daily counts is more
    history than any decision here needs; the Datenschutz text names it. */
const RETENTION_DAYS = 730;

/**
 * Runs from the cron in wrangler.jsonc once a day. The salt sweep is the
 * same statement `dailySalt` runs on the first hit of a day — here it does
 * not depend on a visitor turning up. The retention sweep is by row time.
 */
export async function housekeeping(db) {
  const now = Date.now();
  const today = new Date(now).toISOString().slice(0, 10);
  const cutoff = Math.floor(now / 1000) - RETENTION_DAYS * 86_400;
  const [salts, hits] = await db.batch([
    db.prepare('DELETE FROM salts WHERE day < ?1').bind(today),
    db.prepare('DELETE FROM hits WHERE ts < ?1').bind(cutoff),
  ]);
  console.log(
    JSON.stringify({
      route: 'housekeeping',
      salts: salts.meta?.changes ?? 0,
      hits: hits.meta?.changes ?? 0,
    }),
  );
}

/* -------------------------------------------------------------------- */
/* Helpers                                                               */
/* -------------------------------------------------------------------- */

function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
      ...headers,
    },
  });
}

function sha256(text) {
  return crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
}

async function sha256Hex(text) {
  return hex(new Uint8Array(await sha256(text)));
}

function randomHex(bytes) {
  return hex(crypto.getRandomValues(new Uint8Array(bytes)));
}

function hex(bytes) {
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}
