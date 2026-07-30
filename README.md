# Missmonk

A personal learning hub that packages a diploma engineering curriculum, financial literacy content, self-development books, and bite-sized "wisdom reels" into one installable web app — with Google sign-in and cross-device progress tracking.

## What it actually is

Missmonk is a static web app (`index.html` + `data.json`) backed by Firebase, plus a companion swipeable feed (`reels.html`, internally called **"Nuts"**). Together they cover:

- **`diploma`** — semester-wise engineering coursework (CSE sem 1–6, plus a 2025–2028 reference syllabus), organized as nested folders down to individual lesson pages.
- **`Financial`** — investing and money fundamentals (*The Richest Man in Babylon*, *Stock Investing Mastermind*, *The Intelligent Investor*).
- **`Values & Meaning`** — psychology/self-development books broken into chapters (*Atomic Habits*, *Deep Work*, *The Power of Now*, *The 48 Laws of Power*, *Human Values*, etc.).
- **`Ancient Literature`** and **`Computer Concepts`** — smaller reference shelves (classic texts; programming, networks, OS, DB, graphics, web/app dev).
- **Reels ("Nuts")** — a TikTok-style vertical feed that surfaces one key idea/quote per book at a time, with like, share, WhatsApp, and "ask ChatGPT" actions for each snippet.
- **Account, Progress, and Members pages** — Google login (Firebase Auth), per-lesson completion tracking synced to Firestore, a progress dashboard (Chart.js), and a members list to see how others are doing.
- **Search** across every lesson, book, folder, and course, plus a PWA manifest so it can be installed like a native app.

## Why it was built

The core belief behind Missmonk: **the formal education system teaches subjects, but not financial literacy or human values.** Nobody sits students down to explain how to manage money, how to regulate their own behavior, or why treating other people with basic dignity matters. That gap doesn't stay abstract — a person who never learns self-management or human values is more likely to end up rude, unaware, and disconnected from the consequences of their actions, and at the extreme end, that same absence of values is part of what underlies serious harms like violence and crime. This isn't a claim that reading fixes crime on its own — it's the reasoning for *why* this content deserves the same seriousness as any core subject, instead of being left out entirely.

The books that actually teach this — psychology, money, ethics, self-discipline — exist, but they're long and hard for most people to get through, so the ideas never reach the people who need them. Missmonk's answer is to summarize that content and rebuild it as short, interactive lessons and swipeable "reels," on the belief that even a small dose of the right idea is more helpful than a whole book nobody finishes — as long as the person actually has some interest to begin with.

Beyond that founding motivation, study material is also normally scattered — lecture PDFs in one place, book summaries in another, investing notes somewhere else, and "life advice" content nowhere organized at all. Missmonk was built to collapse all of that into a single scrollable, searchable, syncable space, so that:

- Revisiting engineering coursework and reading personal-growth/finance books can happen in the *same habit loop* instead of competing for separate apps.
- Progress (what's been read, what hasn't) isn't lost when switching phones or browsers — it lives in the cloud against a Google account.
- Dense books can be revisited in seconds through the reels feed, working like spaced repetition for ideas rather than requiring a full re-read.

## Who this is helpful for

- A student who wants their **syllabus and their side-reading in one app**, with a single "percent complete" number to chase.
- Someone building a **personal reading/self-improvement habit** who responds well to short, swipeable prompts rather than sitting down with a whole book.
- Anyone who wants **lightweight, install-free progress tracking** (no separate LMS account, just Google sign-in) across phone and desktop.
- A solo builder or small group who wants a **content structure they fully control** (everything lives in one editable `data.json`) rather than a black-box platform.

## Who this is *not* for

- **Large or multi-tenant audiences.** There's no admin panel, no user-generated content, and no per-user content permissions — every signed-in user sees the same fixed curriculum defined in `data.json`. Adding/editing content means hand-editing JSON and HTML, not using a CMS.
- **Learners who need assessment or certification.** There are no quizzes, grading, or verified credentials — only manual "mark complete" checkboxes and a progress percentage.
- **Anyone needing offline-first or fully self-hosted use.** The app depends on live Firebase (Auth + Firestore) and several CDN scripts (fonts, Bootstrap Icons, Chart.js, SweetAlert2); without internet access and a working Firebase project, login and sync won't function.
- **Teams needing real content management or scalability tooling.** There's no versioning, no role-based access, and no analytics beyond the built-in Members/Progress views — fine for a personal project or small circle, not built for institutional deployment.
- **Users uncomfortable with Google-only authentication**, since sign-in is exclusively via Google OAuth — there's no email/password or SSO alternative.

## Future Features

Ideas we're considering next, building on what's already here:

- **Quizzes & self-checks** after lessons/chapters, so reading turns into something closer to real understanding instead of just "mark as complete."
- **Daily reminder / streak system** to nudge people back into a reading or reels habit, not just track it passively.
- **Personalized reel feed** — surface reels based on what a user has liked, finished, or skipped, instead of one fixed order for everyone.
- **Offline mode** for lessons and reels already opened, so content is still usable without a live connection to Firebase.
- **Content submission/curation flow** so trusted contributors could suggest new books, summaries, or lessons instead of everything being hand-added to `data.json`.
- **Discussion or reflection prompts** on human-values chapters — a space to write a short personal takeaway, not just consume and move on.
- **Multi-language support**, so the human-values and financial-literacy content isn't limited to English readers.

## Tech stack

- Plain HTML/CSS/JS (no build step) — `index.html` is the app shell, `reels.html` is the standalone reels feed.
- **Firebase**: Authentication (Google provider) + Firestore (progress and completion sync).
- **Chart.js** for the progress dashboard, **SweetAlert2** for modals/prompts, **Bootstrap Icons** for iconography.
- `data.json` is the single source of truth for all curriculum content (courses → folders → lessons) and book metadata.
- Ships with a `manifest.json` reference, making it installable as a PWA on mobile/desktop.