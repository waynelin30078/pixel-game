# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — start Vite dev server
- `npm run build` — production build
- `npm run preview` — preview production build
- `npm run lint` — run oxlint (config in `.oxlintrc.json`; react + oxc plugins)

There is no test runner configured in this project.

## Environment

Configuration is read via Vite's `import.meta.env` from a `.env` file (see `.env.example`):

- `VITE_GOOGLE_APP_SCRIPT_URL` — URL of a Google Apps Script web app that acts as the entire backend (question bank + score recording). It lives outside this repo.
- `VITE_PASS_THRESHOLD` — minimum correct answers to pass (default 7 if unset).
- `VITE_QUESTION_COUNT` — number of questions per game (default 10 if unset).

When `VITE_GOOGLE_APP_SCRIPT_URL` is unset or still contains the placeholder `YOUR_SCRIPT_ID`, `src/utils/api.js` transparently falls back to local mock data/scoring so the game is fully playable without a backend. Keep this fallback in sync with the real GAS contract when changing `fetchQuestions`/`submitAnswers`.

## Architecture

This is a single-page pixel-art quiz game ("QUIZ QUEST") built with React 19 + Vite, no router despite `react-router-dom` being a dependency — navigation is a manual state machine, not routes.

**State machine (`src/App.jsx`)**: `App` owns a `phase` enum (`HOME → LOADING → GAME → SUBMITTING → RESULT`) plus `playerId`, `questions`, and `result` state, and passes callbacks down (`onStart`, `onFinish`, `onRestart`, `onHome`). Pages in `src/pages/` are dumb views driven entirely by these props — there is no page-level routing or URL state.

- `HomePage` — collects a player ID, kicks off `onStart(id)`.
- `GamePage` — one question at a time, each mapped 1:1 to a "boss" (see below). Runs its own 30s-per-question countdown timer and auto-submits (`answer: null`) on timeout. Scoring/correctness is *not* known client-side — answers are collected as `{questionId, answer}` and correctness is resolved server-side by the GAS backend (`onFinish(answers)` → `submitAnswers`).
- `ResultPage` — renders whatever `submitAnswers` returned (`score`, `total`, `passed`, `highScore`, `isFirstClear`).

**Boss avatars (`src/utils/dicebear.js`)**: 100 fixed seeds (`boss-stage-0..99`) map question index → a deterministic DiceBear pixel-art SVG URL (`api.dicebear.com`, no API key). `preloadAllBosses()` is fired once on app mount to warm the browser cache for all 100 before they're needed; `BossAvatar` falls back to an emoji if the image fails to load.

**Visual system**: `src/styles/global.css` defines the whole pixel/CRT aesthetic via CSS custom properties (`--color-*`, `--font-pixel` = 'Press Start 2P', `--font-ui` = 'Noto Sans TC') plus reusable classes (`.pixel-box`, `.btn-pixel`/`.btn-gold`/`.btn-red`/`.btn-ghost`, `.hp-bar-container`/`.hp-bar-fill`, `.pixel-input`, `.crt-overlay`) and shared keyframe animations (`blink`, `slideUp`, `pixelPop`, `shake`, `hitFlash`, `float`, `glitch`, `stageEnter`). Components mix these classes with inline `style` objects rather than a CSS-in-JS library — follow that pattern for new UI rather than introducing a new styling approach. `Starfield` (canvas-based) and `Scanlines` (CRT overlay div) are fixed-position decorative layers mounted once in `App` behind all page content (`zIndex: 0`), with page content at `zIndex: 1`.

**UI copy is bilingual**: user-facing strings and code comments are Traditional Chinese (zh-TW); keep new user-facing copy consistent with this unless told otherwise.
