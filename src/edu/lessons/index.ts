// The edu lesson catalog — one module per lesson, unified on the simulator's
// rendering world (see ../model, ../frames). Ordered as the teaching arc:
// what an agent is -> the context window -> the loop -> the gate -> the four
// moves -> progressive disclosure -> the fleet, then hooks + the durable spec.

import type { EduLesson, Planned } from "../model";
import { anatomy } from "./anatomy";
import { contextInside } from "./context-inside";
import { loop } from "./loop";
import { gate } from "./gate";
import { contextWindow } from "./context-window";
import { progressiveDisclosure } from "./progressive-disclosure";
import { fleet } from "./fleet";
import { hookGate } from "./hook-gate";
import { contractAsFiles } from "./contract-as-files";

export const LESSONS: EduLesson[] = [
  anatomy,
  contextInside,
  loop,
  gate,
  contextWindow,
  progressiveDisclosure,
  fleet,
  hookGate,
  contractAsFiles,
];

// Both former stubs are now built lessons; nothing is left "planned".
export const PLANNED: Planned[] = [];

export type { EduLesson, Planned, Loc } from "../model";
