# Waitlist welcome email — handoff for the backend dev

When someone joins the waitlist, send them the welcome email. Everything here
is ready to drop into the existing `supabase/functions/waitlist/` function.

The send has to happen inside that function, not on the website: the Resend API
key is a secret, and a static site can't hold one — anything the browser has,
any visitor can read. The function is also the only place that already knows
whether a signup was **new** or a **duplicate**, which is what stops people
getting a second welcome email every time they resubmit the form.

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
supabase secrets set WAITLIST_POSTAL_ADDRESS="Sukun, <street, city, country>"
supabase functions deploy waitlist --no-verify-jwt
```

Create the key in Resend with **Sending access**, not Full access — this
function only ever sends.

Optional overrides, all with working defaults in `send-welcome.ts`:

| Secret | Default |
|---|---|
| `WAITLIST_FROM` | `سُكون <hello@sukunlife.app>` |
| `WAITLIST_REPLY_TO` | `hello@sukunlife.app` |
| `WAITLIST_UNSUBSCRIBE_URL` | `mailto:hello@sukunlife.app?subject=Unsubscribe` |
| `WAITLIST_POSTAL_ADDRESS` | `Sukun` |

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

## Things that still need a decision

1. **The postal address.** Both templates ended at `· Sukun` with no address.
   Commercial email is generally required to carry a real physical one, and its
   absence is a spam-filter signal. Set `WAITLIST_POSTAL_ADDRESS` before any
   real send.

2. **One-click unsubscribe.** Unsubscribe is currently a `mailto:`, which is
   RFC-valid and fine at waitlist volume. Gmail and Yahoo require an HTTPS
   one-click endpoint for bulk senders (over ~5,000/day), so before the launch
   announcement this should become a real URL — the site is on Vercel, so a
   small `/api/unsubscribe` route plus a Resend Audience is the natural home.
   The `List-Unsubscribe` and `List-Unsubscribe-Post` headers are already being
   sent and will just need the URL swapped.

3. **The launch-day gift.** Both emails promise *"reserved under this email and
   unlocks automatically when you sign in on launch day"* / *"محفوظة باسم بريدك
   الإلكتروني هذا، وتُفعَّل تلقائياً عند تسجيل دخولك يوم الإطلاق"*. That's a
   commitment the app has to honour: on launch, an account whose email is in
   `waitlist_signups` should get a month of Premium without doing anything.
   Worth putting on the backlog now rather than finding it on launch day.

4. **Free-tier limits.** Resend's free plan is 100 emails/day and 3,000/month.
   A launch push clears 100 quickly, and over the limit sends are rejected —
   which, with the fire-and-forget wiring above, fails silently. Watch the
   dashboard, or upgrade before promoting the form.

5. **Domain warm-up.** `sukunlife.app` is newly verified, so it has no sending
   reputation yet. The first few hundred are the most likely to land in spam.
   Confirm SPF, DKIM and DMARC are all green in Resend before volume.

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
