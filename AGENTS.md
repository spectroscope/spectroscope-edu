# AGENTS.md — spectroscope-edu

A vendor-neutral guide for AI coding agents (OpenAI Codex, Cursor, etc.). The
deepest, most current context lives in [`CLAUDE.md`](CLAUDE.md) and
[`docs/`](docs/); this file is the quick, self-contained orientation.

## What this is

A standalone, **backend-free teaching app** for spectroscope (an agent
orchestrator). Two experiences behind one sidebar switch:

- **simulator** — a live "system map" of an agent-harness run (the agent loop,
  the permission gate, the tool belt, the operating-system band, the LLM, and
  parallel subagents), driven by scripted scenarios compiled to a deterministic
  event stream and stepped. No server: the whole UI rides a replay seam.
- **edu** — nine interactive, step-through lessons that teach how an LLM agent
  works. As of the current build the lessons render on the **same React Flow
  cards the simulator draws** (one rendering world), so a motif learned in a
  lesson is met again live in the simulator.

## Tech stack

- React 19 + TypeScript + Vite.
- React Flow (`@xyflow/react` v12) for the node/edge canvas.
- State via `useSyncExternalStore` singletons (no Redux). No backend, no fetch.
- Deploy target: Cloudflare Workers Static Assets (SPA).

## Commands

```bash
npm install
npm run dev        # Vite dev server (default port 8743; see .claude/launch.json)
npm run build      # vite build -> dist/
npx tsc -b         # type-check (must be clean)
npx vitest run     # unit tests (pure-logic; must be green — 225+ at time of writing)
```

The "gate" before any commit: **`tsc -b` clean + `vitest run` green + `vite build`
succeeds**, and the app browser-verified in all three themes.

## Architecture (where things live)

```
src/
├── App.tsx / Sidebar.tsx / EduHome.tsx   # shell: home | simulator | edu (hash routing)
├── events.ts                             # the RunEvent union (17 event types)
├── scenario/                             # dsl.ts + compile.ts + registry.ts (scripted runs)
├── state/                                # stepper.ts (the replay engine) + reducer.ts + stores
├── lab/                                  # the SIMULATOR
│   ├── labScene.ts                       #   the folded Scene model
│   └── flowmap/                          #   sceneToFlow.ts + nodes.tsx (the sim's cards) + PacketEdge
├── edu/                                  # the EDU teaching layer (rides the sim's cards)
│   ├── model.ts                          #   the EduLesson type (scenario | reveal modes)
│   ├── frames.ts                         #   lesson + step -> React Flow { nodes, edges } (pure)
│   ├── EduFlow.tsx / EduNodes.tsx        #   the locked-down teaching canvas + edu abstraction cards
│   ├── EduView.tsx / EduReadout.tsx      #   the lesson workspace + the readout rail
│   └── lessons/                          #   one module per lesson + index.ts (the catalog)
└── styles/ + tokens.css + designs.css    # three themes: spectroscope (dark) · paper · still (white)
```

The two engines share one rendering world: edu drives the same `nodeTypes` /
`edgeTypes` as the simulator. Scenario lessons compile a DSL to real events and
fold them with the sim's pure functions; reveal lessons hand-author the visible
cards. See `docs/2026-07-21-edu-on-sim-engine-design.md`.

## Conventions (please follow)

- **Business English** for all code, comments, docs, UI copy, and commits.
- **Design non-negotiables:** colour only on the spectral marks (`--sp-*` /
  `--ev-*` / `--accent`), lowercase brand vocabulary, no shadows, no glow on
  marks, self-hosted OFL fonts, tabular numbers. Never invent hex; use the
  tokens. Zero third-party branding.
- **Humanized copy:** no em-dashes (—) or en-dashes (–) in user-facing strings.
- **Tests:** pure-logic vitest (no jsdom). Add coverage when you touch the
  engine (`frames.ts`, `stepper.ts`, `scenario/compile.ts`).
- **Git identity:** `chris@spectroscope.ai`. Commit after each finished block.
- **Deploy = push.** On Cloudflare, a push to `main` deploys. **Never push
  without an explicit instruction from the owner.**

## Gotchas

- The `stepper` is a module singleton — edu must NOT call `loadReplay` (it would
  hijack the running simulator). Edu folds its own event stream with the exported
  pure functions instead (`frames.ts`).
- No rAF loops in animation paths — the embedded preview pane stalls rAF; use
  `setTimeout` (both the sim and edu do).
- `EduView` is keyed by lesson id in `App.tsx` so it remounts per lesson (a stale
  step index would otherwise index past a shorter lesson's steps).
