# Sukun CMS API — Integration Guide

*For the CMS developer. Covers the `/admin` content-management API and the public
`/waitlist` signup endpoint. Both are Supabase Edge Functions in `supabase/functions/`.*

## Base URL & auth

- **Base:** `https://<PROJECT_REF>.supabase.co/functions/v1`
- **Auth — pick one:**
  1. **Server-to-server (recommended for the CMS backend):** send header
     `X-Admin-Key: <ADMIN_API_KEY>`. The key is a function secret
     (`supabase secrets set ADMIN_API_KEY=...`) — keep it server-side only,
     never in browser code.
  2. **Admin user JWT:** `Authorization: Bearer <supabase-jwt>` of a user whose id
     is in the `admin_users` table (insert the row via SQL editor:
     `insert into admin_users (user_id, note) values ('<auth-uid>', 'CMS');`).
- Both `admin` and `waitlist` are deployed with `--no-verify-jwt`; auth is enforced
  inside the functions.

## Response envelope

Same envelope as the whole `/v1` API:

```json
{ "success": true,  "data": { ... }, "error": null, "meta": { "page": 1, "per_page": 25, "total": 42 } }
{ "success": false, "data": null, "error": { "code": "validation_failed", "message": "..." }, "meta": null }
```

`error.code` values: `unauthorized` (401), `not_found` (404), `validation_failed` (400/405),
`conflict` (409, unique violation), `internal` (500).

## Generic CRUD

Every resource below supports the same five routes:

| Route | Notes |
|---|---|
| `GET /admin/{resource}` | List. `?page=` `?per_page=` (max 100, default 25), `?search=` (ilike on the resource's searchable columns), plus exact-match filters listed per resource (e.g. `?status=draft`). |
| `GET /admin/{resource}/{id}` | Single row. |
| `POST /admin/{resource}` | Create. Body = JSON with the writable fields. Unknown fields are rejected with a message listing what is allowed. Returns 201 + the row. |
| `PATCH /admin/{resource}/{id}` | Partial update — send only the fields to change. Returns the updated row. |
| `DELETE /admin/{resource}/{id}` | Returns `{ "deleted": true }`. FK-protected rows answer 400. |

**Field discovery:** `GET /admin/resources` returns, for every resource, its id column,
writable fields, required-on-create fields, searchable columns, and filters —
use it to build CMS forms without reading the SQL schema.

## Resources

Bilingual content is always a `*_ar` / `*_en` column pair (Arabic-first product).

| Resource | Table | Required on create | Filters |
|---|---|---|---|
| `categories` | categories | domain, slug, name_ar, name_en | domain |
| `narrators` | narrators | name_ar, name_en | — |
| `content` | content_items | type, slug, title_ar, title_en | type, status, category_id, is_premium |
| `media-assets` | media_assets | content_id, audio_url, duration_sec | content_id, dialect, narrator_id, locale |
| `breathing-patterns` | breathing_patterns (id = content_id) | content_id, inhale_sec, exhale_sec, default_cycles | — |
| `article-bodies` | article_bodies (id = content_id) | content_id, body_md_ar, body_md_en | — |
| `quotes` | quotes | text_ar, text_en | theme, is_active |
| `quote-schedule` | daily_quote_schedule (id = shown_on date) | shown_on, quote_id | quote_id |
| `courses` | courses | slug, title_ar, title_en | status, is_premium |
| `course-lessons` | course_lessons | course_id, position, title_ar, title_en | course_id |
| `assessments` | assessments | type, slug, title_ar, title_en | type, is_active |
| `assessment-questions` | assessment_questions | assessment_id, position, text_ar, text_en, options | assessment_id |
| `assessment-outcomes` | assessment_outcomes | assessment_id, code, title_ar, title_en | assessment_id |
| `journal-prompts` | journal_prompts | text_ar, text_en | is_active |
| `habit-templates` | habit_templates | intent, name_ar, name_en | intent |
| `badges` | badges | code, name_ar, name_en | — |
| `challenges` | challenges | title_ar, title_en, active_on | active_on |
| `moods` | moods | id (smallint), code, label_ar, label_en, emoji, valence | — |
| `context-tags` | context_tags | id (smallint), code, label_ar, label_en | — |
| `waitlist` | waitlist_signups | *(read-only + delete)* | country, source |

Enum values (Postgres enums — invalid values answer `validation_failed`):

- `content.type`: `meditation` `sleep_story` `soundscape` `sleep_music`
  `breathing_exercise` `grounding_exercise` `article` `game`
- `content.status` / `courses.status`: `draft` `published` `archived`
- `media-assets.dialect`: `msa` `khaleeji` `egyptian` `levantine` · `locale`: `ar` `en`
- `assessments.type`: `onboarding` `personality`
- `habit-templates.intent`: `build` `break` · `default_frequency`: `hourly` `daily` `weekly` `monthly`

## Special endpoints

### Publishing workflow

Content is created as `draft` and is invisible to the app until published:

```
POST /admin/content/{id}/publish     → status=published, published_at=now
POST /admin/content/{id}/unpublish   → back to draft
```

(Archiving: `PATCH /admin/content/{id}` with `{"status": "archived"}`.)

### Media upload (audio files & cover art)

1. `POST /admin/storage/upload-url` with `{"bucket": "audio", "path": "meditation/deep-calm/msa.m4a"}`
   → `{ signed_url, token, ... }`. Buckets: `audio` (private) or `covers` (public).
2. `PUT` the file bytes to `signed_url` (header `Content-Type: audio/mp4` etc.).
3. Register it:
   - **Audio:** create a `media-assets` row whose `audio_url` is the **object path inside
     the bucket** (`meditation/deep-calm/msa.m4a`) — *not* a full URL. The app's
     `/media/stream` endpoint signs it at playback time.
   - **Covers:** the bucket is public — store the full public URL in `cover_url`:
     `https://<PROJECT_REF>.supabase.co/storage/v1/object/public/covers/<path>`.

### Plan limits (free-tier tuning, composite key)

```
GET    /admin/plan-limits
PUT    /admin/plan-limits                      { "tier": "free", "feature": "meditation", "max_count": 1, "period": "month" }   (upsert)
DELETE /admin/plan-limits?tier=free&feature=meditation
```

### Waitlist

```
GET /admin/waitlist?page=1&search=ahmad&country=Kuwait
GET /admin/waitlist/export        → CSV download (name,email,country,source,created_at)
```

## Public waitlist signup (marketing site)

No auth, no account — call it straight from the website form:

```
POST /waitlist
{ "name": "Sara", "email": "sara@example.com", "country": "Kuwait", "source": "landing-page" }
```

- `name`, `email`, `country` required (≤200 chars); `source` optional, defaults to `website`.
- Success: 201 `{ "already_joined": false, "id": "...", "created_at": "..." }`.
- Duplicate email (case-insensitive): 200 `{ "already_joined": true }` — the form can
  always show "you're on the list".

## Examples

```bash
BASE="https://<PROJECT_REF>.supabase.co/functions/v1"
KEY="X-Admin-Key: $ADMIN_API_KEY"

# list draft meditations
curl -H "$KEY" "$BASE/admin/content?type=meditation&status=draft"

# create a quote
curl -H "$KEY" -H "Content-Type: application/json" -X POST "$BASE/admin/quotes" \
  -d '{"text_ar": "النص", "text_en": "The text", "theme": "gratitude"}'

# schedule it for a day
curl -H "$KEY" -H "Content-Type: application/json" -X POST "$BASE/admin/quote-schedule" \
  -d '{"shown_on": "2026-09-01", "quote_id": "<uuid>"}'

# publish content
curl -H "$KEY" -X POST "$BASE/admin/content/<uuid>/publish"

# waitlist signup (public, from the website)
curl -H "Content-Type: application/json" -X POST "$BASE/waitlist" \
  -d '{"name": "Sara", "email": "sara@example.com", "country": "Kuwait"}'
```

## Deployment (repo owner, one-time)

```bash
supabase db push                          # applies 20260819120000_cms_admin_and_waitlist.sql
supabase secrets set ADMIN_API_KEY="$(openssl rand -hex 32)"
supabase functions deploy admin --no-verify-jwt
supabase functions deploy waitlist --no-verify-jwt
```

Then hand the CMS developer: the base URL, the `ADMIN_API_KEY`, and this document.
