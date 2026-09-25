/* One-click unsubscribe (RFC 8058) for Sukun waitlist mail.
 *
 * The waitlist function signs a token per recipient and puts this URL in the
 * List-Unsubscribe header. Nothing here touches Supabase — the opt-out is
 * recorded against a Resend Audience, which is also the list the launch
 * broadcast sends to, so an unsubscribe there is honoured automatically.
 *
 * Env (Vercel project settings):
 *   RESEND_API_KEY        same key the waitlist function uses
 *   RESEND_AUDIENCE_ID    the audience holding waitlist contacts
 *   UNSUBSCRIBE_SECRET    shared with the waitlist function; signs the token
 *
 * GET  shows a confirmation page rather than acting, because virus scanners
 *      and mail previews fetch links and would otherwise unsubscribe people
 *      who never clicked.
 * POST acts. Gmail's one-click sends List-Unsubscribe=One-Click; our own
 *      confirmation button sends confirm=1.
 */

const crypto = require("node:crypto");

const b64urlDecode = (s) =>
  Buffer.from(s.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8");

/** Returns { email, lang } or null if the signature does not check out. */
function verify(token, secret) {
  if (typeof token !== "string" || !token.includes(".")) return null;
  const idx = token.lastIndexOf(".");
  const payload = token.slice(0, idx);
  const sig = token.slice(idx + 1);

  const expected = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("base64url");

  // Same length both sides, or timingSafeEqual throws instead of comparing.
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;

  try {
    const data = JSON.parse(b64urlDecode(payload));
    if (!data || typeof data.e !== "string") return null;
    return { email: data.e, lang: data.l === "en" ? "en" : "ar" };
  } catch {
    return null;
  }
}

async function markUnsubscribed(email) {
  const key = process.env.RESEND_API_KEY;
  const audience = process.env.RESEND_AUDIENCE_ID;
  if (!key || !audience) {
    console.error("[unsubscribe] RESEND_API_KEY or RESEND_AUDIENCE_ID missing");
    return false;
  }

  const base = `https://api.resend.com/audiences/${audience}/contacts`;
  const headers = { Authorization: `Bearer ${key}`, "Content-Type": "application/json" };

  const patch = await fetch(`${base}/${encodeURIComponent(email)}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify({ unsubscribed: true })
  });
  if (patch.ok) return true;

  // Not in the audience yet (signed up before it existed, say). Add them
  // already unsubscribed so a later broadcast still skips them.
  if (patch.status === 404) {
    const created = await fetch(base, {
      method: "POST",
      headers,
      body: JSON.stringify({ email, unsubscribed: true })
    });
    if (created.ok) return true;
    console.error("[unsubscribe] create failed", created.status, await created.text());
    return false;
  }

  console.error("[unsubscribe] patch failed", patch.status, await patch.text());
  return false;
}

const COPY = {
  ar: {
    dir: "rtl",
    title: "إلغاء الاشتراك",
    // Asked, before anything has happened.
    askHead: "هل تريد إلغاء الاشتراك؟",
    askBody: "لن تصلك بعدها أي رسائل من قائمة انتظار سكون.",
    askBtn: "تأكيد إلغاء الاشتراك",
    // Done.
    doneHead: "تم إلغاء اشتراكك",
    doneBody: "لن تصلك رسائل أخرى من قائمة انتظار سكون. إن غيّرت رأيك، يمكنك التسجيل من جديد في أي وقت.",
    back: "العودة إلى الموقع",
    failHead: "تعذّر إلغاء الاشتراك",
    failBody: "حدث خطأ من جهتنا. راسلنا على hello@sukunlife.app وسنتولّى الأمر."
  },
  en: {
    dir: "ltr",
    title: "Unsubscribe",
    askHead: "Unsubscribe from Sukun email?",
    askBody: "You won't receive anything further from the Sukun waitlist.",
    askBtn: "Yes, unsubscribe me",
    doneHead: "You've been unsubscribed",
    doneBody: "You won't receive any more Sukun waitlist email. If you change your mind, you can join again at any time.",
    back: "Back to the site",
    failHead: "We couldn't unsubscribe you",
    failBody: "Something went wrong on our side. Email hello@sukunlife.app and we'll take care of it."
  }
};

function page(lang, ok, confirmToken) {
  const c = COPY[lang] || COPY.ar;
  const heading = confirmToken ? c.askHead : ok ? c.doneHead : c.failHead;
  const text = confirmToken ? c.askBody : ok ? c.doneBody : c.failBody;
  const form = confirmToken
    ? `<form method="POST" action="/api/unsubscribe?t=${encodeURIComponent(confirmToken)}">
         <input type="hidden" name="confirm" value="1">
         <button type="submit">${c.askBtn}</button>
       </form>`
    : "";

  return `<!doctype html><html lang="${lang}" dir="${c.dir}"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex">
<title>${c.title} · Sukun</title><style>
:root{color-scheme:light}
*{box-sizing:border-box}
body{margin:0;min-height:100vh;display:grid;place-items:center;padding:24px;
  background:#FCFBFE;color:#1C1830;
  font-family:-apple-system,'SF Arabic','Geeza Pro','Segoe UI',Tahoma,Arial,sans-serif}
.card{max-width:520px;width:100%;background:#fff;border:1px solid #EEE6F5;
  border-radius:28px;padding:48px 40px;text-align:center;
  box-shadow:0 18px 50px rgba(28,24,48,.07)}
.orb{inline-size:64px;block-size:64px;border-radius:999px;margin:0 auto 24px;
  background:radial-gradient(circle at 30% 30%,#EDB7BE,#C78CBF 39%,#9887D2 58%,#89ACEE 100%)}
h1{margin:0 0 14px;font-size:1.5rem;line-height:1.5;font-weight:700}
p{margin:0;color:#5E5670;font-size:1rem;line-height:1.75}
button,a.back{display:inline-block;margin-block-start:28px;padding:14px 30px;
  border:0;border-radius:999px;font:inherit;font-weight:600;font-size:1rem;
  color:#fff;text-decoration:none;cursor:pointer;
  background:linear-gradient(135deg,#89ACEE,#9887D2 38%,#C78CBF 72%,#EDB7BE)}
a.quiet{display:inline-block;margin-block-start:20px;color:#967FB3;font-size:.9rem}
</style></head><body>
<main class="card">
  <div class="orb" aria-hidden="true"></div>
  <h1>${heading}</h1>
  <p>${text}</p>
  ${form}
  <a class="${confirmToken ? "quiet" : "back"}" href="https://sukunlife.app">${c.back}</a>
</main></body></html>`;
}

module.exports = async function handler(req, res) {
  const secret = process.env.UNSUBSCRIBE_SECRET;
  if (!secret) {
    console.error("[unsubscribe] UNSUBSCRIBE_SECRET is not set");
    res.status(500).send("not configured");
    return;
  }

  const url = new URL(req.url, `https://${req.headers.host}`);
  const token = url.searchParams.get("t") || "";
  const claim = verify(token, secret);

  if (!claim) {
    // A bad or tampered token. Say so plainly; there is nothing to leak,
    // since without a valid signature we do not know whose address it is.
    res.status(400).setHeader("Content-Type", "text/html; charset=utf-8");
    res.send(page("ar", false, null));
    return;
  }

  if (req.method === "GET") {
    res.status(200).setHeader("Content-Type", "text/html; charset=utf-8");
    res.send(page(claim.lang, true, token));
    return;
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "GET, POST");
    res.status(405).send("method not allowed");
    return;
  }

  const done = await markUnsubscribed(claim.email);

  // RFC 8058: the one-click POST wants a plain 2xx, not a page.
  const raw = typeof req.body === "string" ? req.body : "";
  const isOneClick =
    raw.includes("List-Unsubscribe=One-Click") ||
    (req.body && req.body["List-Unsubscribe"] === "One-Click");

  if (isOneClick) {
    res.status(done ? 200 : 500).send(done ? "unsubscribed" : "error");
    return;
  }

  res.status(done ? 200 : 500).setHeader("Content-Type", "text/html; charset=utf-8");
  res.send(page(claim.lang, done, null));
};

// Exported for tests.
module.exports.verify = verify;
