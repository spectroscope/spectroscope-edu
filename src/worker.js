// Pass-through worker: serve the built static assets (Vite dist) as a
// single-page app. No API, no backend — the app is fully client-side (scripted
// scenarios compiled to RunEvent[] and folded through the stepper).
export default {
  async fetch(request, env) {
    return env.ASSETS.fetch(request);
  },
};
