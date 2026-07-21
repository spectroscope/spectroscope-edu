# spectroscope-edu

A standalone teaching app for [spectroscope](https://github.com/spectroscope/spectroscope):
learn how an LLM agent works, two ways, with **no backend**.

- **edu** — interactive step-through lessons (anatomy of an agent, the context
  window, the loop, the permission gate, progressive disclosure, orchestrated
  fan-out) on a pan/zoom React Flow canvas.
- **simulator** — a scripted "system map" of an agent-harness run (loop, gate,
  tools, OS band, local/remote LLM, subagents) with **spectrum** and **trace**
  sub-views, all stepping in lockstep.

Built on the current spectro-web tech (React 19 + Vite + TypeScript + React Flow).
Deploys to Cloudflare as static assets. MIT.

> **This repo is bootstrapped, not yet built.** Read `CLAUDE.md` (goals +
> strategy + decisions) then `docs/BUILD-PLAN.md` (the code-verified build plan:
> delta analysis, file-lift list, the backend-free drive seam, phases P0→P4).
> Start at P0.

## Develop

```bash
npm install
npm run dev        # vite dev server
npm run build      # tsc -b && vite build → ./dist
npm run deploy     # build + wrangler deploy (push = deploy — owner instruction only)
```
