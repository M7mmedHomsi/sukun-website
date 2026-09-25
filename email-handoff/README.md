# Waitlist welcome email — handoff for the backend dev

When someone joins the waitlist, send them the welcome email. Everything here
is ready to drop into the existing `supabase/functions/waitlist/` function.

It can't be sent from the browser — the Resend API key is a secret, and
anything a static page holds, any visitor can read. A serverless function on
the marketing site's host could hold one, and that was considered; the waitlist
function won because it fires on the real insert rather than on a second call
the browser might never make, it already knows whether a signup was **new** or
a **duplicate** (which is what stops people getting another welcome email every
time they resubmit), and it needs no public mail-sending endpoint that strangers
could point at arbitrary addresses.

## What to copy

| From here | To |
|---|---|
| `waitlist/send-welcome.ts` | `supabase/functions/waitlist/send-welcome.ts` |
| `waitlist/templates.ts` | `supabase/functions/waitlist/templates.ts` |

`templates.ts` is generated — don't hand-edit it. The sources are
`templates/welcome-{ar,en}.{html,txt}`; after changing one, run
`node build-templates.mjs` from `email-handoff/` and copy the result across.

## Wiring it into index.ts

Two additions. First the import:

```ts
import { sendWelcomeEmail } from "./send-welcome.ts";
```

Then, after the insert has succeeded and only when the signup was new:

```ts
// Fire-and-forget: the response goes back immediately and the email sends
// after it. The person is already on the list, so a Resend problem must not
// make the form look broken.
EdgeRuntime.waitUntil(
  sendWelcomeEmail({ email, lang: body.lang })
);
```

If `EdgeRuntime.waitUntil` isn't available in your runtime version, plain
`await sendWelcomeEmail(...)` works too — it just adds roughly half a second to
the form submit. `sendWelcomeEmail` never throws; on failure it logs and
returns `{ sent: false, error }`.

Place it on the **201 / new signup** path only. On the `already_joined: true`
path, send nothing.

### One change to request validation

The website now posts a fifth field:

```json
{ "name": "...", "email": "...", "country": "...", "source": "website", "lang": "ar" }
```

`lang` is `"ar"` or `"en"`, and it picks which of the two templates to send.
Nothing needs storing and there's no migration — the function just reads it off
the request body. **If your validator rejects unknown fields, it needs to allow
this one**, otherwise every signup from the site starts failing. Anything other
than `"en"` falls back to Arabic, so a missing value is safe.

## Secrets

```bash
supabase secrets set RESEND_API_KEY="re_..."
supabase secrets set RESEND_AUDIENCE_ID="<audience uuid>"
supabase secrets set UNSUBSCRIBE_SECRET="$(openssl rand -hex 32)"
supabase functions deploy waitlist --no-verify-jwt
```

Create the key in Resend with **Sending access**, not Full access — this
function only ever sends and manages contacts.

`UNSUBSCRIBE_SECRET` must be **the same value** set on Vercel; see the
unsubscribe section below. Generate it once and set it in both places.

Optional overrides, all with working defaults in `send-welcome.ts`:

| Secret | Default |
|---|---|
| `WAITLIST_FROM` | `سُكون <hello@sukunlife.app>` |
| `WAITLIST_REPLY_TO` | `hello@sukunlife.app` |
| `WAITLIST_UNSUBSCRIBE_BASE` | `https://sukunlife.app/api/unsubscribe` |
| `WAITLIST_POSTAL_ADDRESS` | `Dubai - United Arab Emirates` |

## Unsubscribe

One-click unsubscribe (RFC 8058) is live, and it does not touch Supabase.

`send-welcome.ts` signs a token per recipient — `base64url({e,l}).HMAC-SHA256`
— and puts `https://sukunlife.app/api/unsubscribe?t=<token>` in both the
`List-Unsubscribe` header and the email footer. The endpoint lives in the
website repo at `api/unsubscribe.js` (Vercel), verifies the signature, and
marks the contact `unsubscribed: true` in the Resend audience.

Signing matters: without it, the URL would be a plain email address and anyone
could unsubscribe anyone by editing it. Verification is timing-safe, so the
signature can't be brute-forced a byte at a time. If `UNSUBSCRIBE_SECRET` is
missing the code falls back to a `mailto:` and drops the one-click header
rather than shipping an unsigned link.

**On Vercel**, set three environment variables:

| Variable | Value |
|---|---|
| `RESEND_API_KEY` | same key |
| `RESEND_AUDIENCE_ID` | same audience uuid |
| `UNSUBSCRIBE_SECRET` | **the same secret as Supabase** |

A mismatch between the two secrets means every unsubscribe link 400s, so check
it after deploying: click the footer link in a test email and you should get the
confirmation page, not an error.

`GET` deliberately only shows a confirmation page with a button; it never
unsubscribes on its own, because virus scanners and mail previews fetch links
and would otherwise opt people out who never clicked. The `POST` acts.

Because the audience is also the list a launch broadcast sends to, an
unsubscribe there is honoured automatically by future campaigns — no extra
suppression list to maintain.

## Testing without spamming anyone

Resend's sandbox addresses don't reach a real inbox and don't affect your
sending reputation:

- `delivered@resend.dev` — succeeds
- `bounced@resend.dev` — hard bounce
- `complained@resend.dev` — marked as spam

```bash
curl -H "Content-Type: application/json" -X POST \
  "https://<PROJECT_REF>.supabase.co/functions/v1/waitlist" \
  -d '{"name":"Test","email":"delivered@resend.dev","country":"Kuwait","lang":"ar"}'
```

Then check the Resend dashboard's Emails tab. Send one to a real Gmail and a
real Outlook address too — those two are where Arabic RTL and the gradient
backgrounds are most likely to misbehave.

Note that a repeat test with the same address returns `already_joined: true`
and sends nothing, which is correct. Delete the row to test the new-signup path
again.

## Before the first real send

1. **Create the Resend audience** and put its id in both Supabase and Vercel.
   Without it the email still sends, but nobody is added to the launch list and
   unsubscribes have nowhere to be recorded.

2. **Generate `UNSUBSCRIBE_SECRET` once** and set the identical value in both
   places. This is the single most likely thing to be got wrong.

3. **Free-tier limits.** Resend's free plan is 100 emails/day and 3,000/month.
   A launch push clears 100 quickly, and over the limit sends are rejected —
   which, with the fire-and-forget wiring above, fails silently. Watch the
   dashboard, or upgrade before promoting the form.

4. **Domain warm-up.** `sukunlife.app` is newly verified, so it has no sending
   reputation yet. The first few hundred are the most likely to land in spam.
   Confirm SPF, DKIM and DMARC are all green in Resend before volume.

5. **The launch-day gift** is confirmed as going ahead. Both emails promise
   *"reserved under this email and unlocks automatically when you sign in on
   launch day"* / *"محفوظة باسم بريدك الإلكتروني هذا، وتُفعَّل تلقائياً عند
   تسجيل دخولك يوم الإطلاق"*, so on launch an account whose email is in
   `waitlist_signups` needs a month of Premium applied without the person doing
   anything. Worth a ticket now rather than a scramble on the day.

## What was fixed in the templates

The originals are unchanged in Resend; these are the corrected copies.

- **`{{{RESEND_UNSUBSCRIBE_URL}}}` removed from the English template.** That's a
  Broadcasts merge variable. Sent transactionally through `POST /emails` it is
  never substituted, so recipients would have seen an Unsubscribe link pointing
  at the literal text. The Arabic one had `href="#"`, dead in a different way.
  Both now use a real placeholder filled at send time.
- **The Arabic template declared itself LTR English** — `dir="ltr" lang="en"` on
  `<html>`, `<body>` and the outer `<td>`. Inline `text-align:right` hid most of
  it, but bidi ordering still broke wherever Arabic met Latin or digits, and
  screen readers announced it as English. Now `dir="rtl" lang="ar"`.
- **The gift button was not a link** in either language — a styled `<span>` with
  no `href`. It now links to `https://sukunlife.app`.
- **Added plain-text alternatives.** A missing `text/plain` part costs you spam
  score, and it's what Apple Watch and text-only clients display.
- Arabic line-heights raised (44/26/22px type needs room for diacritics) and
  `letter-spacing` left at 0, since spacing breaks Arabic letter joining.
