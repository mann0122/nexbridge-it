-- Self-hosted, cookieless website stats (D-063).
--
-- One row per beacon: a page view or a named action. Deliberately NOT stored:
-- the IP address, the user agent, any cookie or id. `visitor` is the first
-- 16 hex of SHA-256(salt | ip | ua) under a salt that is random per UTC day
-- and deleted afterwards (see `salts` and the cron in wrangler.jsonc): it
-- links one visitor's rows within a day and is a new value the next day.
-- Rows older than the retention period are deleted by the same cron.
--
-- Applied with `npm run stats:migrate` (remote) / `stats:migrate:local`.

CREATE TABLE IF NOT EXISTS hits (
  id      INTEGER PRIMARY KEY AUTOINCREMENT,
  ts      INTEGER NOT NULL,             -- unix seconds
  day     TEXT    NOT NULL,             -- UTC, YYYY-MM-DD; the grouping key
  event   TEXT    NOT NULL,             -- 'pageview' or a named click, e.g. 'cta'
  value   TEXT    NOT NULL DEFAULT '',  -- the click's value, e.g. 'hero'
  path    TEXT    NOT NULL,             -- normalised, no query, no hash
  ref     TEXT    NOT NULL DEFAULT '',  -- referrer host; '' = direct or same-origin
  lang    TEXT    NOT NULL DEFAULT '',  -- 'de' | 'en' | ''
  device  TEXT    NOT NULL DEFAULT '',  -- 'mobile' | 'tablet' | 'desktop' | ''
  country TEXT    NOT NULL DEFAULT '',  -- ISO 3166-1 alpha-2 from the edge, or ''
  visitor TEXT    NOT NULL              -- daily-rotating hash, see above
);

CREATE INDEX IF NOT EXISTS hits_day       ON hits (day);
CREATE INDEX IF NOT EXISTS hits_day_event ON hits (day, event);

-- One random salt per UTC day. The first beacon of a day writes it
-- (INSERT OR IGNORE — concurrent first beacons all end up reading the same
-- winner); every beacon and the daily cron delete rows older than today.
-- Nothing ever reads a past day's salt, and no endpoint returns one.
CREATE TABLE IF NOT EXISTS salts (
  day  TEXT PRIMARY KEY,
  salt TEXT NOT NULL
);
