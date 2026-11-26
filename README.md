# Homeschool App (working name)

A mastery-based online school for home-educated UK secondary students (KS3/KS4), designed from the start for neurodivergent learners. Phase 1 contains the full platform foundations and one complete maths chain: **fractions** (6 skills).

The plan, architecture and reasoning are in the project's plan doc ("Online school: honest assessment and build plan").

## What works in Phase 1

- Parent sign-up, login, logout, password reset by email; parents create child logins (username + password, no child email).
- Row-level security: a student sees only their own data; a parent only their linked children. Tested in `supabase/tests/rls_test.sql`.
- Six-stage lessons for 6 fraction skills: Introduction, Teaching (with an interactive demo and step-by-step worked examples), Guided practice (hints), On your own, Skill check (5 questions, no help), Review. Lessons resume where the student left off.
- Server-side marking with exact fraction arithmetic: accepts equivalent forms, mixed numbers and decimals; flags unsimplified answers; matches common wrong answers to named misconceptions.
- Mastery levels worked out from evidence only (see `src/engine/mastery.ts`), spaced reviews (1, 3, 7, 21, 60 days), knowledge-gap diagnosis through the prerequisite map, explained recommendations.
- Parent view: plain-English insights from real answers, skill-by-skill levels with reasons, introduced/practised/assessed/demonstrated/retained breakdown, every recent answer as evidence, weekly goals, data download (JSON) and account deletion.
- Settings saved to the account: Lexend, Atkinson Hyperlegible, OpenDyslexic or Verdana; text size; line and letter spacing; seven background/contrast themes; reduced motion; simplified view; read-aloud speed and auto-read; feedback style.

## Not in Phase 1 (by design)

English, the AI tutor, the starting diagnostic, PDF reports, payments, and the content-editor screens. **All lesson content is Draft** until a qualified maths teacher has reviewed it.

## Project layout

```
src/engine/        Pure learning engine (no UI, no database): marking, mastery, reviews, gaps, insights
src/content/       Curriculum and lessons (version-controlled; Draft/In review/Verified status)
src/app/           Next.js pages and server actions
src/components/    UI: lesson player, practice runner, demos, read-aloud, settings
supabase/          Database migration and security tests
e2e/journey.mjs    Browser test of the whole parent + child journey
```

## Tests

```
npm test                       # engine: 46 tests, including every question generator over 300 seeds
psql … -f supabase/tests/stub_auth.sql -f supabase/migrations/0001_init.sql -f supabase/tests/rls_test.sql
BASE=http://localhost:3000 node e2e/journey.mjs   # needs the app and a local Supabase running
```

## Setting up

1. **Database (Supabase, London region).** In the Supabase dashboard open *SQL Editor*, paste the whole of `supabase/migrations/0001_init.sql`, and press *Run*.
2. **Auth settings.** In *Authentication → URL Configuration* set the Site URL to your live address and add `https://YOUR-ADDRESS/auth/callback` to Redirect URLs. In *Authentication → Providers → Email*, keep "Confirm email" on, and set the minimum password length to 8.
3. **Hosting (Vercel).** Import this repository, and add these environment variables (from Supabase *Project Settings → API Keys*):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (the "anon" public key)
   - `SUPABASE_SERVICE_ROLE_KEY` (the "service_role" secret key; keep it secret, server only)
   - `NEXT_PUBLIC_SITE_URL` (your live address, e.g. `https://homeschool-app.vercel.app`)
4. Functions run in London (`vercel.json`).

### Local development

```
npm install
npx supabase start            # needs Docker
cp .env.example .env.local    # fill in the keys printed by supabase start
npm run dev
```
