// Receives form submissions from the site, checks the Cloudflare Turnstile
// result server-side, then forwards the answers to the matching Google Form.
// Only the Google Forms listed below can be posted to, so this isn't an open relay.
const FORMS = {
  contact:
    "https://docs.google.com/forms/d/e/1FAIpQLScL7uxdm7zq06aunRXfEKGSNTfLfmxH_9LP8RHxxD27K2-pIA/formResponse",
  prayer:
    "https://docs.google.com/forms/d/e/1FAIpQLSeRYDCKSNwDlsorW5Ki2SongcuPGNXFXWp01JBRY3LczUEh-A/formResponse",
  "update-info":
    "https://docs.google.com/forms/d/e/1FAIpQLSf0T7QjStoyT9y9c-1fJwwzwkYVUoTSElPf16bkC9q2VN1vBA/formResponse",
};

const MAX_FIELDS = 30;
const MAX_VALUE_LENGTH = 5000;

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

export default async (req) => {
  if (req.method !== "POST") {
    return json({ ok: false, error: "method" }, 405);
  }

  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    console.error("submit function: missing TURNSTILE_SECRET_KEY");
    return json({ ok: false, error: "server" }, 500);
  }

  const target = FORMS[new URL(req.url).searchParams.get("form")];
  if (!target) {
    return json({ ok: false, error: "unknown-form" }, 400);
  }

  const params = new URLSearchParams(await req.text());

  // Hidden field real visitors never see; bots tend to fill it in. Pretend
  // success so they don't learn they were caught.
  if (params.get("website")) {
    return json({ ok: true });
  }

  const token = params.get("cf-turnstile-response");
  if (!token) {
    return json({ ok: false, error: "captcha" }, 400);
  }

  try {
    const check = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        secret,
        response: token,
        remoteip: req.headers.get("x-nf-client-connection-ip") || "",
      }),
    });
    const result = await check.json();
    if (!result.success) {
      return json({ ok: false, error: "captcha" }, 400);
    }
  } catch (err) {
    console.error("submit function: Turnstile verification failed", err);
    return json({ ok: false, error: "server" }, 502);
  }

  const answers = new URLSearchParams();
  let count = 0;
  for (const [key, value] of params) {
    if (!/^entry\.\d+$/.test(key)) continue;
    if (++count > MAX_FIELDS) {
      return json({ ok: false, error: "too-many-fields" }, 400);
    }
    answers.append(key, value.slice(0, MAX_VALUE_LENGTH));
  }
  if (!count) {
    return json({ ok: false, error: "empty" }, 400);
  }

  try {
    const res = await fetch(target, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: answers,
    });
    if (!res.ok) {
      console.error(`submit function: Google Forms returned ${res.status}`);
      return json({ ok: false, error: "upstream" }, 502);
    }
  } catch (err) {
    console.error("submit function: failed to reach Google Forms", err);
    return json({ ok: false, error: "upstream" }, 502);
  }

  return json({ ok: true });
};

export const config = {
  path: "/api/submit",
};
