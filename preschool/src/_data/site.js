// Public Cloudflare Turnstile site key. Set TURNSTILE_SITE_KEY in Netlify; the
// fallback is Cloudflare's published always-pass test key, for local previews.
module.exports = {
  turnstileSiteKey: process.env.TURNSTILE_SITE_KEY || "1x00000000000000000000AA",
};
