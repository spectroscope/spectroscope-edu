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
