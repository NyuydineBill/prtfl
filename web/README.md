# Portfolio

Next.js (App Router, TypeScript, Tailwind CSS) portfolio, backed by Supabase for the contact form, articles CMS, and visitor interactivity (chat, reactions, comments, guestbook, subscribers), with GPT-4o assisting on article drafts and answering visitor questions.

## Local development

```bash
npm install
npm run dev
```

Copy `.env.example` to `.env.local` and fill in:

- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Project Settings → API in the Supabase dashboard.
- `OPENAI_API_KEY` — server-only. Powers both the "Generate with AI" button in the article editor (`gpt-4o`) and the public chat widget (`gpt-4o-mini`). Never exposed to the browser.

## Supabase setup

Run all six files once in your project's SQL editor (Supabase dashboard → SQL Editor), in any order:

- `supabase/schema.sql` — the `messages` table for the contact form. RLS allows the public anon key to `insert` only, never read.
- `supabase/posts-schema.sql` — the `posts` table for articles. RLS allows anyone to read `published` posts, and only a signed-in (`authenticated`) user to create, edit, delete, or read drafts.
- `supabase/storage-schema.sql` — a public `post-images` storage bucket for cover images, uploaded from the article editor.
- `supabase/reactions-schema.sql` — the `reactions` table, shared by article emoji reactions and project upvotes.
- `supabase/comments-schema.sql` — the `comments` table. Public can submit (always lands as `pending`); only approved comments are publicly visible; you moderate at `/admin/comments`.
- `supabase/guestbook-schema.sql` — the `guestbook` table, same moderation shape as comments; moderate at `/admin/guestbook`.
- `supabase/subscribers-schema.sql` — the `subscribers` table for the "get notified" email capture on `/articles`. Emails are write-only from the public side (no anon read) — view them at `/admin/subscribers`.
- `supabase/chat-rate-limit-schema.sql` — a `chat_requests` table plus a `security definer` Postgres function that rate-limits the public `/api/chat` endpoint (20 requests/hour per IP by default). The table has no public policies at all — it's only reachable through that function, so the anon key can't read or forge request counts.

### Creating your admin login

There's no public sign-up page by design — the CMS is single-admin. Create your account directly in the Supabase dashboard: **Authentication → Users → Add user**, set an email and password. Sign in at `/admin/login` with those credentials.

## Content

Most page content is data-driven, sourced from the résumé, in `src/lib/data/`:

- `profile.ts` — name, bio, core expertise, domains, education
- `projects.ts` — flagship projects shown on `/work` and `/work/[slug]`. Add an entry here to add a new case study — the grid and detail page pick it up automatically.
- `experience.ts` — the `/experience` timeline
- `skills.ts` — the `/stack` page, grouped by category
- `teaching.ts` / `leadership.ts` / `certifications.ts` — the `/community` page

Articles are different: they live in Supabase (`posts` table), not in code, so they can be authored from `/admin` without a deploy.

## Articles CMS

- `/articles` and `/articles/[slug]` — public pages, read-only, show `published` posts, with reactions and comments.
- `/admin` — protected dashboard listing every post (draft + published). Requires sign-in; unauthenticated visits redirect to `/admin/login`.
- `/admin/posts/new` and `/admin/posts/[id]/edit` — the editor. Save as draft or publish; publishing sets `published_at` the first time. Upload a cover image directly (Supabase Storage) or paste a URL.
- **Generate with AI**: give it a topic, it calls GPT-4o server-side (`/api/admin/generate-post`, auth-gated) and drops a draft title/excerpt/markdown content into the editor. Nothing is saved automatically — review and edit before hitting Save or Publish.

Route protection is enforced in `src/proxy.ts` (Next.js 16's replacement for `middleware.ts`), which redirects unauthenticated requests to `/admin/*` to `/admin/login`.

## Visitor interactivity

- **AI chat assistant** — floating widget on every public page (hidden on `/admin`). Answers are grounded in the same content data as the rest of the site (`src/lib/chat-knowledge.ts` assembles it into the system prompt) via `gpt-4o-mini`. Public and unauthenticated, so `/api/chat` is rate-limited server-side (see `chat-rate-limit-schema.sql`) — client-side limits alone would be trivially bypassed.
- **Article reactions** — 👍 💡 🔥 on each article. No login required; a localStorage flag soft-prevents the same browser from reacting twice (not abuse-proof, just a low-stakes engagement signal).
- **Article comments** — public submit, always starts `pending`; approve or delete at `/admin/comments`.
- **Project upvotes** — a single ⭐ on `/work` cards and each project's detail page, same `reactions` table with `target_type: 'project'`.
- **Guestbook** — `/guestbook`, public page + submission form, same moderate-before-visible pattern as comments; moderate at `/admin/guestbook`.
- **Subscribers** — email capture on `/articles` ("get notified" form). View the list at `/admin/subscribers`. **This only captures emails — it does not send anything.** Actually notifying subscribers when you publish requires wiring up an email provider (e.g. Resend, Postmark), which isn't set up.

## Deployment

Deploys to Vercel. Set all three environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `OPENAI_API_KEY`) in the Vercel project settings.
