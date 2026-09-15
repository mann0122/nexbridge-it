/**
 * The site's only Worker code. Everything else on nexbridge-it.com is a static
 * asset served without a script (D-022); this runs only for the paths named in
 * `run_worker_first` in wrangler.jsonc — the teaser videos.
 *
 * Why it exists (D-062): the static-asset server answers a `Range` request with
 * the whole file as a 200. Chrome and Firefox tolerate that; Safari on iOS and
 * macOS does not — it probes a <video> source with `Range: bytes=0-1` and will
 * not play unless it gets a 206 back. So the films and the preview loops were
 * silent on every iPhone.
 *
 * How: the Cache API slices a cached 200 into a 206 on its own when the request
 * carries a Range header (documented behaviour, needs Content-Length). First
 * request per data centre fetches the full file from the asset store and puts
 * it in the cache; every request after that, ranged or not, is answered from
 * there. A wrong-code URL 404s exactly as before — the asset store's 404 is
 * returned untouched, so the gate's "the 404 is the validation" (D-056) holds.
 */
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const isVideo = url.pathname.endsWith('.mp4');
    const method = request.method;
    if (!isVideo || (method !== 'GET' && method !== 'HEAD')) {
      return env.ASSETS.fetch(request);
    }

    const cache = caches.default;
    // The cache key is the URL alone: a plain GET, no Range, so one stored
    // copy answers every slice of it.
    const key = new Request(url.toString(), { method: 'GET' });
    // ignoreMethod: the gate's HEAD probe (scripts/teaser.ts) is matched as if
    // it were a GET; the body is dropped below.
    let res = null;
    let source = 'cache';
    try {
      res = await cache.match(request, { ignoreMethod: true });
      if (!res) {
        source = 'store';
        const asset = await env.ASSETS.fetch(key);
        // Not found (wrong code): hand the store's 404 page back untouched.
        if (!asset.ok) return stamp(asset, 'store-as-is');
        // The store streams its body with no Content-Length, and the cache can
        // only slice what it can measure — so the film is read whole, once per
        // data centre. 25 MiB at most (the asset cap), well inside the Worker's
        // memory, and only on the cold request.
        const bytes = await asset.arrayBuffer();
        const full = new Response(bytes, { status: asset.status, headers: asset.headers });
        full.headers.set('Content-Length', String(bytes.byteLength));
        // One day, not immutable: the name is a hash of the code, not of the
        // bytes, so a film re-encoded under the same code must be able to
        // replace itself within a day.
        full.headers.set('Cache-Control', 'public, max-age=86400');
        full.headers.set('Accept-Ranges', 'bytes');
        await cache.put(key, full);
        res = await cache.match(request, { ignoreMethod: true });
      }
    } catch {
      // A cache that throws must not take the film with it; the fallback
      // below serves it the way the asset store always did.
      res = null;
    }
    // The cache refused or failed (too large, or transient): serve the file
    // as a plain 200 rather than fail the request — what every visitor got
    // before this script existed.
    if (!res) return stamp(await env.ASSETS.fetch(request), 'store-uncached');

    return stamp(res, source, method === 'HEAD');
  },
};

/** Copy (cached responses are immutable) and say which path answered.
    `x-nb-video` is the whole debugging story of this file: read it with
    curl -I when a video misbehaves. */
function stamp(res, source, dropBody = false) {
  const out = new Response(dropBody ? null : res.body, res);
  out.headers.set('x-nb-video', source);
  return out;
}
