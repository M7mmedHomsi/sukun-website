// Sends the waitlist welcome email through Resend.
//
// Drop this file next to the waitlist function's index.ts, along with the
// generated templates.ts, then call sendWelcomeEmail() after a successful
// insert. It never throws: a Resend outage must not fail a signup, because
// by the time this runs the person is already on the list.

import { render, type Lang } from "./templates.ts";

const RESEND_ENDPOINT = "https://api.resend.com/emails";

// hello@ is a real inbox, so replies and unsubscribe requests reach someone.
const FROM = Deno.env.get("WAITLIST_FROM") ?? "سُكون <hello@sukunlife.app>";
const REPLY_TO = Deno.env.get("WAITLIST_REPLY_TO") ?? "hello@sukunlife.app";

// Until a one-click endpoint exists, unsubscribe is a mailto. RFC-valid, and
// mail clients render it as a normal unsubscribe. See the README before any
// bulk send — Gmail and Yahoo want an HTTPS one-click for bulk volume.
const UNSUBSCRIBE =
  Deno.env.get("WAITLIST_UNSUBSCRIBE_URL") ??
  "mailto:hello@sukunlife.app?subject=Unsubscribe";

// Commercial email is generally required to carry a physical postal address.
const POSTAL_ADDRESS = Deno.env.get("WAITLIST_POSTAL_ADDRESS") ?? "Sukun";

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

export async function sendWelcomeEmail(args: WelcomeArgs): Promise<WelcomeResult> {
  const apiKey = Deno.env.get("RESEND_API_KEY");
  if (!apiKey) {
    console.error("[waitlist] RESEND_API_KEY is not set; skipping welcome email");
    return { sent: false, error: "missing_api_key" };
  }

  const lang = normaliseLang(args.lang);
  const { subject, html, text } = render(lang, {
    unsubscribeUrl: UNSUBSCRIBE,
    postalAddress: POSTAL_ADDRESS
  });

  try {
    const res = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        // Resend de-duplicates retries carrying the same key for 24h, so a
        // function retry cannot send the same person two welcome emails.
        "Idempotency-Key": `waitlist-welcome-${args.email.trim().toLowerCase()}`
      },
      body: JSON.stringify({
        from: FROM,
        to: [args.email],
        reply_to: REPLY_TO,
        subject,
        html,
        text,
        headers: {
          "List-Unsubscribe": `<${UNSUBSCRIBE}>`,
          "List-Unsubscribe-Post": "List-Unsubscribe=One-Click"
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
