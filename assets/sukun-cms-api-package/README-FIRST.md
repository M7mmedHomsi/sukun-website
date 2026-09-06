# Sukun CMS API — Developer Package

Hi! This package has everything you need to integrate a CMS against the Sukun
backend. Contents:

| File | What it is |
|---|---|
| `README-FIRST.md` | This file — quick start + tested walkthrough |
| `cms-api.pdf` | The full API reference (endpoints, resources, fields, enums, workflows) |
| `cms-api.md` | Same reference in Markdown, if you prefer it in your editor |
| `sukun-cms.postman_collection.json` | Ready-made Postman collection with every endpoint pre-filled |

## 1. What you need from Mohammad (not in this package)

- **`ADMIN_API_KEY`** — a 64-character secret. It is deliberately NOT in these
  files; ask for it through a private channel. Keep it server-side only — it
  grants full write access to the app's content. Never put it in browser code
  or a public repo.

Already included / public:

- **Base URL:** `https://xrxztpcijkhehrrpneve.supabase.co/functions/v1`

## 2. Quick start (5 minutes, Postman)

1. Import `sukun-cms.postman_collection.json` into Postman.
2. Click the collection → **Variables** → paste the key into `admin_key`
   (Current value column, exactly one line, no trailing spaces) → Save.
3. Send **Admin — Discover → "List all resources + fields"**. You should get
   `"success": true` and a map of all 20 resources with their id column,
   writable fields, required-on-create fields, search columns, and filters.
   That response is effectively the API schema — you can generate your CMS
   forms from it.

Troubleshooting: 401 → the `admin_key` variable isn't saved or has a stray
character. "Invalid character in header" → re-paste the key as a single clean
line. HTTP/2 protocol errors → request Settings tab → HTTP version → HTTP/1.x.

## 3. The API in one paragraph

Every resource uses the same five routes: `GET /admin/{resource}` (paginated
list: `?page`, `?per_page` ≤ 100, `?search`, plus per-resource filters),
`GET /admin/{resource}/{id}`, `POST /admin/{resource}` (create),
`PATCH /admin/{resource}/{id}` (partial update), `DELETE /admin/{resource}/{id}`.
Two headers only: `X-Admin-Key` on everything under `/admin`, and
`Content-Type: application/json` when sending a body. Every response is the
same envelope: `{ success, data, error, meta }` — branch on `error.code`:
`unauthorized` 401 · `validation_failed` 400 · `not_found` 404 · `conflict` 409.
Unknown body fields are rejected with a message listing the allowed ones.
Bilingual fields always come as `*_ar` / `*_en` pairs; both are usually
required on create (Arabic-first product).

## 4. Tested walkthrough (all verified against the live project)

**Waitlist (public — no key):**
```
POST /waitlist
{ "name": "Ahmad Test", "email": "ahmad.test1@example.com", "country": "Kuwait", "source": "cms-test" }
→ 201 { "already_joined": false, "id": "..." }     (repeat → 200 { "already_joined": true })
```
Admin side: `GET /admin/waitlist?search=ahmad`, `GET /admin/waitlist/export` (CSV),
`DELETE /admin/waitlist/{id}`.

**Content lifecycle (the flow the CMS lives in):**
```
POST  /admin/content        { "type": "meditation", "slug": "my-item", "title_ar": "...", "title_en": "..." }   → draft
PATCH /admin/content/{id}   { "title_en": "New name" }
POST  /admin/content/{id}/publish      → visible in the app
POST  /admin/content/{id}/unpublish    → hidden again
DELETE /admin/content/{id}
```

**Quotes + daily schedule:**
```
POST /admin/quotes           { "text_ar": "...", "text_en": "...", "theme": "gratitude" }
POST /admin/quote-schedule   { "shown_on": "2030-01-01", "quote_id": "<id>" }   ← that date's daily quote in the app
```

**Media upload (3 steps):**
```
1. POST /admin/storage/upload-url   { "bucket": "audio", "path": "meditation/x/msa.m4a" }  → { signed_url }
2. PUT <signed_url>                 (file bytes, correct Content-Type; no admin key — the URL is the credential)
3. POST /admin/media-assets         { "content_id": "...", "dialect": "msa", "audio_url": "meditation/x/msa.m4a", "duration_sec": 180 }
```
Important pattern: for audio, `audio_url` is the **object path inside the private
bucket**, never a full URL (the app exchanges it for a signed URL at playback).
For covers the `covers` bucket is public — store the full public URL in `cover_url`.

**Plan limits (composite key, careful — live free-tier config):**
```
GET    /admin/plan-limits
PUT    /admin/plan-limits    { "tier": "free", "feature": "meditation", "max_count": 1, "period": "month" }   (upsert)
DELETE /admin/plan-limits?tier=free&feature=meditation
```

## 5. Live reference ids (safe to use in GETs)

```
category (meditation/stress):  d52f14ef-1721-44bc-bbb7-5fe810eddc9b
quote:                         40648d72-8829-5870-9b0a-baae4b52add7
content "episode-01":          a3ab63a7-70a0-4c60-949a-27cb75d2f498   ← real app content, do not delete
assessment "onboarding-v1":    b03ef825-522f-439d-8d5c-dcc19b4bad27
```

## 6. One warning

This points at the **live** database. Anything you publish appears in the real
app immediately. While integrating: keep test items as `draft`, clean up test
rows, and restore any plan-limit values you change.

Full details of every resource and enum: `cms-api.pdf`.
