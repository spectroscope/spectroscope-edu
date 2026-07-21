import { describe, expect, it } from "vitest";
import { compile } from "../scenario/compile";
import { advanceScene, initialScene } from "../lab/labScene";
import { lessonFrames, revealFrame, scenarioCursors } from "./frames";
import { loop } from "./lessons/loop";
import { LESSONS } from "./lessons";
import type { RevealLesson, ScenarioLesson } from "./model";

const fold = (evs: ReturnType<typeof compile>) => evs.reduce(advanceScene, initialScene());

describe("scenarioCursors", () => {
  it("resolves the loop cursors monotonically, ending at the full stream", () => {
    const events = compile(loop.dsl, "en");
    const cursors = scenarioCursors(loop.steps, events);
    expect(cursors).toHaveLength(loop.steps.length);
    expect(cursors[0]).toBeGreaterThan(0);
    for (let i = 1; i < cursors.length; i++) expect(cursors[i]).toBeGreaterThanOrEqual(cursors[i - 1]);
    expect(cursors.at(-1)).toBe(events.length);
    cursors.forEach((c) => {
      expect(c).toBeGreaterThanOrEqual(0);
      expect(c).toBeLessThanOrEqual(events.length);
    });
  });

  it("lands the loop on a PENDING gate at the gate step (real fold)", () => {
    const events = compile(loop.dsl, "en");
    const cursors = scenarioCursors(loop.steps, events);
    const scene = fold(events.slice(0, cursors[2]));
    expect(scene.gate).toBe("pending");
    expect(scene.focus).toBe("gate");
  });

  it("shows the gate ALLOWED on the decision step, then a FAILED result on the next", () => {
    const events = compile(loop.dsl, "en");
    const cursors = scenarioCursors(loop.steps, events);
    // step 3 = { until: permission_decision } → gate allowed, not yet failed
    const allowed = fold(events.slice(0, cursors[3]));
    expect(allowed.gate).toBe("allowed");
    expect(allowed.isError).toBe(false);
    // step 4 = { until: tool_result } → permission != success, the run FAILS
    const failed = fold(events.slice(0, cursors[4]));
    expect(failed.isError).toBe(true);
  });

  it("resolves { until, nth } to the nth matching event (the PASS rerun)", () => {
    const events = compile(loop.dsl, "en");
    const cursors = scenarioCursors(loop.steps, events);
    const results = events.filter((e) => e.type === "tool_result");
    expect(results.length).toBeGreaterThanOrEqual(4);
    // step 7 folds up to the 4th tool_result (the rerun that passes).
    const scene = fold(events.slice(0, cursors[7]));
    expect(scene.isError).toBe(false);
  });
});

describe("lessonFrames (scenario)", () => {
  it("builds one non-empty frame per step in both languages", () => {
    for (const lang of ["en", "de"] as const) {
      const frames = lessonFrames(loop, lang);
      expect(frames).toHaveLength(loop.steps.length);
      frames.forEach((f) => expect(f.nodes.length).toBeGreaterThan(0));
    }
  });
});

describe("revealFrame", () => {
  const lesson: RevealLesson = {
    id: "t",
    mode: "reveal",
    difficulty: "core",
    readoutKind: "none",
    title: "t",
    blurb: "t",
    nodes: {
      a: { id: "a", type: "eduCard", x: 0, y: 0, data: { kind: "model", title: "a" } },
      b: { id: "b", type: "eduCard", x: 200, y: 0, data: { kind: "harness", title: "b" } },
    },
    edges: { e: { id: "e", source: "a", target: "b" } },
    steps: [
      { cap: "one", show: ["a"] },
      { cap: "two", show: ["a", "b"], showEdges: ["e"], activeNodes: ["b"], activeEdges: ["e"] },
    ],
  };

  it("shows only the visible subset per step", () => {
    const f0 = revealFrame(lesson, lesson.steps[0]);
    expect(f0.nodes.map((n) => n.id)).toEqual(["a"]);
    expect(f0.edges).toHaveLength(0);

    const f1 = revealFrame(lesson, lesson.steps[1]);
    expect(f1.nodes.map((n) => n.id).sort()).toEqual(["a", "b"]);
    expect(f1.edges).toHaveLength(1);
    expect((f1.nodes.find((n) => n.id === "b")!.data as { active: boolean }).active).toBe(true);
    expect((f1.edges[0].data as { active: boolean }).active).toBe(true);
  });
});

// Guards the whole class of bug the adversarial review caught: an advance marker
// that never matches collapses the step (and every step after it) onto the end
// of the stream, so half a lesson renders a finished run. Every scenario lesson's
// cursors must strictly increase and only the last step may reach the stream end.
describe("scenario lesson cursors are well-formed (no dead/collapsed steps)", () => {
  const scenarioLessons = LESSONS.filter((l): l is ScenarioLesson => l.mode === "scenario");
  for (const lesson of scenarioLessons) {
    for (const lang of ["en", "de"] as const) {
      it(`${lesson.id} [${lang}]`, () => {
        const events = compile(lesson.dsl, lang);
        const cursors = scenarioCursors(lesson.steps, events);
        for (let i = 1; i < cursors.length; i++) {
          expect(cursors[i], `step ${i} did not advance past step ${i - 1}`).toBeGreaterThan(cursors[i - 1]);
        }
        for (let i = 0; i < cursors.length - 1; i++) {
          expect(cursors[i], `non-final step ${i} collapsed to the stream end`).toBeLessThan(events.length);
        }
        expect(cursors.at(-1)).toBe(events.length);
      });
    }
  }
});

// Declutter: a scenario lesson never crosses the network boundary, so the "your
// mac" + "outside" frames and the external services are dropped — only the OS band
// stays. This is what makes the map tight enough to zoom the cards in bigger.
describe("scenario frames are decluttered (no your-mac / outside / boundary)", () => {
  const scenarioLessons = LESSONS.filter((l): l is ScenarioLesson => l.mode === "scenario");
  const GONE = ["z-mac", "z-outside", "z-boundary", "netz", "mcpserver"];
  for (const lesson of scenarioLessons) {
    it(`${lesson.id} drops the frames + external services, keeps the OS band`, () => {
      const frames = lessonFrames(lesson, "en");
      for (const f of frames) {
        const ids = new Set(f.nodes.map((n) => n.id));
        for (const gone of GONE) expect(ids.has(gone), `${lesson.id} still has ${gone}`).toBe(false);
        expect(ids.has("z-os"), `${lesson.id} lost the OS band`).toBe(true);
        // no dangling rail to a removed external service
        const targets = new Set(f.nodes.map((n) => n.id));
        for (const e of f.edges) {
          expect(targets.has(e.source), `edge ${e.id} source missing`).toBe(true);
          expect(targets.has(e.target), `edge ${e.id} target missing`).toBe(true);
        }
      }
    });
  }
});

// Stable subagent slots: a worker keeps the same position across steps as its
// siblings spawn (reserved slots), so the fan-out reveals in place, not by shoving
// the earlier workers down. This is the "already there" the owner asked for.
describe("subagent positions are stable across a lesson's steps", () => {
  const withSubs = LESSONS.filter(
    (l): l is ScenarioLesson => l.mode === "scenario" && l.dsl != null,
  );
  for (const lesson of withSubs) {
    it(`${lesson.id}: every subagent node has one fixed position`, () => {
      const frames = lessonFrames(lesson, "en");
      const seen = new Map<string, { x: number; y: number }>();
      let anySub = false;
      for (const f of frames) {
        for (const n of f.nodes) {
          if (!n.id.startsWith("sub-")) continue;
          anySub = true;
          const prev = seen.get(n.id);
          if (prev) {
            expect(n.position.x, `${n.id} x moved`).toBe(prev.x);
            expect(n.position.y, `${n.id} y moved`).toBe(prev.y);
          } else {
            seen.set(n.id, { x: n.position.x, y: n.position.y });
          }
        }
      }
      // fleet + context-window have workers; the rest simply have none (fine).
      if (lesson.id === "fleet") expect(anySub, "fleet grew no workers").toBe(true);
    });
  }
});

// The edu layout reads left-to-right: the user sits in its own LEFT column, its
// right edge clear of the wide agent's x-range, so the user->agent rail is a
// short left-to-right hop and never crosses. Pins the arrangement so a refactor
// cannot silently reintroduce the criss-cross (or a first-render overlap nudge).
const AGENT_W = 540; // .pf-agent--wide
const USER_W = 400; // .pf-user--wide
describe("scenario frames read left-to-right (user left of the agent, no x-overlap)", () => {
  const scenarioLessons = LESSONS.filter((l): l is ScenarioLesson => l.mode === "scenario");
  for (const lesson of scenarioLessons) {
    it(`${lesson.id}: user column is clear of the agent, llm is to the right`, () => {
      const frames = lessonFrames(lesson, "en");
      for (const f of frames) {
        const agent = f.nodes.find((n) => n.id === "agent");
        const user = f.nodes.find((n) => n.id === "user");
        const llm = f.nodes.find((n) => n.id === "llm");
        expect(agent, "no agent node").toBeTruthy();
        if (user) {
          // the user's right edge is left of the agent's left edge -> clean rail
          expect(user.position.x + USER_W).toBeLessThanOrEqual(agent!.position.x);
        }
        // the llm sits to the right of the agent
        if (llm) expect(llm.position.x).toBeGreaterThanOrEqual(agent!.position.x + AGENT_W);
      }
    });
  }
});

// The stable camera rect: one rect per lesson, identical on every frame, finite and
// positive, and — for scenario lessons — tight enough that it excludes the old
// far-right "outside" extent (which used to start at x≈1372).
describe("Frame.bbox is a single stable rect per lesson", () => {
  for (const lesson of LESSONS) {
    it(`${lesson.id}: same finite rect on every frame`, () => {
      const frames = lessonFrames(lesson, "en");
      const b0 = frames[0].bbox;
      expect(b0.width).toBeGreaterThan(0);
      expect(b0.height).toBeGreaterThan(0);
      expect(Number.isFinite(b0.x) && Number.isFinite(b0.y)).toBe(true);
      for (const f of frames) {
        expect(f.bbox.x).toBe(b0.x);
        expect(f.bbox.y).toBe(b0.y);
        expect(f.bbox.width).toBe(b0.width);
        expect(f.bbox.height).toBe(b0.height);
      }
      // decluttered (no outside zone / external services) is asserted separately;
      // here just guard against a runaway rect. The clean left-to-right layout
      // legitimately spans the former "outside" x-range for the llm column.
      if (lesson.mode === "scenario") {
        expect(b0.x + b0.width, `${lesson.id} rect ran away`).toBeLessThan(2200);
      }
    });
  }
});

// Every lesson builds one non-empty frame per step (both modes, both languages).
describe("every catalog lesson renders a frame per step", () => {
  for (const lesson of LESSONS) {
    for (const lang of ["en", "de"] as const) {
      it(`${lesson.id} [${lang}]`, () => {
        const frames = lessonFrames(lesson, lang);
        expect(frames).toHaveLength(lesson.steps.length);
        frames.forEach((f, i) => expect(f.nodes.length, `step ${i} has no nodes`).toBeGreaterThan(0));
      });
    }
  }
});
