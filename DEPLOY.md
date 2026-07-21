# Deploying spectroscope-edu

The app ships to **Cloudflare Workers Static Assets** with a pass-through worker
— the same arrangement as the `spectroscope-website` and `spectroscope-dev`
repos. The one difference: this is a **Vite single-page app**, so it has a build
step. Cloudflare serves the built `./dist`, and `not_found_handling:
single-page-application` routes every path to `index.html`.

- `wrangler.jsonc` — worker name `spectroscope-edu`, `assets.directory: ./dist`,
  SPA fallback, `workers_dev` + `preview_urls` on until the custom domain lands.
- `src/worker.js` — pass-through: `env.ASSETS.fetch(request)`. No API, no
  backend; the whole UI rides scripted scenarios compiled to `RunEvent[]`.
- `package.json` — `build` = `tsc -b && vite build` → `./dist`; `deploy` =
  `npm run build && wrangler deploy`.

## Two ways to deploy

**1. Cloudflare Workers Builds (git-connected — the production path, push =
deploy).** Connect this GitHub repo to a Cloudflare Workers project once, in the
dashboard:

- Build command: `npm run build`
- Deploy command: `npx wrangler deploy`
- Output/assets directory: `./dist` (already set in `wrangler.jsonc`)

`dist/` is git-ignored on purpose — the build runs on Cloudflare, so the repo
stays source-only. After the connection is made, **every push to `main`
deploys** (usually live within ~1 min). Only push verified states.

**2. Local one-shot** (needs a Cloudflare token in the environment):

    npm install
    npm run deploy        # tsc -b && vite build && wrangler deploy

Open the `workers.dev` preview URL the deploy prints and check the app in both
themes (spectroscope | paper), then the `edu | simulator` switch.

## Custom domain

Target: **`edu.spectroscope.dev`** (a subdomain of the developer site). Wire it
in the Cloudflare dashboard (Workers → this worker → Custom Domains) once the
`workers.dev` preview looks right; keep the preview URL until the domain
resolves. Nothing else routes to this worker, so there is no cutover ordering to
worry about (unlike `spectroscope-dev/DEPLOY.md`, which had to move a shared
route).

## Discipline

- **Never push without an explicit owner instruction** — on the git-connected
  worker, push = deploy.
- Keep it green before any push: `npm run typecheck` and `npm test` (tsc-b +
  vitest), plus a browser check in both themes.
- Business English for all artifacts; MIT.
