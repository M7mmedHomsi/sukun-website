// Sends the waitlist welcome email through Resend.
//
// Drop this file next to the waitlist function's index.ts, along with the
// generated templates.ts, then call sendWelcomeEmail() after a successful
// insert. It never throws: a Resend outage must not fail a signup, because
// by the time this runs the person is already on the list.

import { render, type Lang } from "./templates.ts";

const RESEND_API = "https://api.resend.com";

// hello@ is a real inbox, so replies reach someone.
const FROM = Deno.env.get("WAITLIST_FROM") ?? "سُكون <hello@sukunlife.app>";
const REPLY_TO = Deno.env.get("WAITLIST_REPLY_TO") ?? "hello@sukunlife.app";
const POSTAL_ADDRESS =
  Deno.env.get("WAITLIST_POSTAL_ADDRESS") ?? "Dubai - United Arab Emirates";

// One-click unsubscribe lives on the marketing site (Vercel). The secret is
// shared with that endpoint, which verifies the signature before acting.
const UNSUBSCRIBE_BASE =
  Deno.env.get("WAITLIST_UNSUBSCRIBE_BASE") ?? "https://sukunlife.app/api/unsubscribe";
const UNSUBSCRIBE_SECRET = Deno.env.get("UNSUBSCRIBE_SECRET") ?? "";

// Optional. When set, each signup is also added to this Resend audience, which
// is the list the launch broadcast goes to — and the list an unsubscribe is
// recorded against.
const AUDIENCE_ID = Deno.env.get("RESEND_AUDIENCE_ID") ?? "";

export interface WelcomeArgs {
  email: string;
  /** From the website's payload. Anything unrecognised falls back to Arabic. */
  lang?: string | null;
}

export interface WelcomeResult {
  sent: boolean;
  id?: string;
  error?: string;
}

function normaliseLang(raw: string | null | undefined): Lang {
  return raw === "en" ? "en" : "ar";
}

function b64url(bytes: Uint8Array): string {
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/** payload.signature, where payload is base64url JSON. Verified by /api/unsubscribe. */
async function unsubscribeUrl(email: string, lang: Lang): Promise<string> {
  if (!UNSUBSCRIBE_SECRET) {
    // Without a secret we cannot sign, and an unsigned link would let anyone
    // unsubscribe anyone. Fall back to the mailto rather than ship that.
    console.error("[waitlist] UNSUBSCRIBE_SECRET not set; falling back to mailto");
    return "mailto:hello@sukunlife.app?subject=Unsubscribe";
  }

  const enc = new TextEncoder();
  const payload = b64url(enc.encode(JSON.stringify({ e: email, l: lang })));
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(UNSUBSCRIBE_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(payload));
  const token = `${payload}.${b64url(new Uint8Array(sig))}`;
  return `${UNSUBSCRIBE_BASE}?t=${encodeURIComponent(token)}`;
}

/** Adds the contact to the launch list. Best effort — never blocks the email. */
async function addToAudience(email: string, apiKey: string): Promise<void> {
  if (!AUDIENCE_ID) return;
  try {
    const res = await fetch(`${RESEND_API}/audiences/${AUDIENCE_ID}/contacts`, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ email, unsubscribed: false })
    });
    // 409 just means they are already on it, which is fine.
    if (!res.ok && res.status !== 409) {
      console.error("[waitlist] audience add failed", res.status, await res.text());
    }
  } catch (err) {
    console.error("[waitlist] audience add threw", err);
  }
}

export async function sendWelcomeEmail(args: WelcomeArgs): Promise<WelcomeResult> {
  const apiKey = Deno.env.get("RESEND_API_KEY");
  if (!apiKey) {
    console.error("[waitlist] RESEND_API_KEY is not set; skipping welcome email");
    return { sent: false, error: "missing_api_key" };
  }

  const email = args.email.trim();
  const lang = normaliseLang(args.lang);
  const unsub = await unsubscribeUrl(email, lang);
  const { subject, html, text } = render(lang, {
    unsubscribeUrl: unsub,
    postalAddress: POSTAL_ADDRESS
  });

  await addToAudience(email, apiKey);

  try {
    const res = await fetch(`${RESEND_API}/emails`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        // Resend de-duplicates retries carrying the same key for 24h, so a
        // function retry cannot send the same person two welcome emails.
        "Idempotency-Key": `waitlist-welcome-${email.toLowerCase()}`
      },
      body: JSON.stringify({
        from: FROM,
        to: [email],
        reply_to: REPLY_TO,
        subject,
        html,
        text,
        headers: {
          "List-Unsubscribe": `<${unsub}>`,
          // Only claim one-click when the URL really is one. A mailto with
          // this header set is invalid and hurts more than it helps.
          ...(unsub.startsWith("https://")
            ? { "List-Unsubscribe-Post": "List-Unsubscribe=One-Click" }
            : {})
        },
        tags: [
          { name: "type", value: "waitlist_welcome" },
          { name: "lang", value: lang }
        ]
      })
    });

    const body = await res.json().catch(() => ({}));

    if (!res.ok) {
      // Log and move on. The signup itself already succeeded.
      console.error("[waitlist] Resend rejected the send", res.status, body);
      return { sent: false, error: body?.message ?? `http_${res.status}` };
    }

    return { sent: true, id: body?.id };
  } catch (err) {
    console.error("[waitlist] Resend request failed", err);
    return { sent: false, error: String(err) };
  }
}
