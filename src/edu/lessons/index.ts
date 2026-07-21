// The edu lesson catalog — one module per lesson, unified on the simulator's
// rendering world (see ../model, ../frames). Ordered as the teaching arc:
// what an agent is -> the context window -> the loop -> the gate -> the four
// moves -> progressive disclosure -> the fleet, then hooks + the durable spec.

import type { EduLesson, Planned } from "../model";
import { anatomy } from "./anatomy";
import { contextInside } from "./context-inside";
import { loop } from "./loop";
import { gate } from "./gate";
import { mcp } from "./mcp";
import { contextWindow } from "./context-window";
import { progressiveDisclosure } from "./progressive-disclosure";
import { skill } from "./skill";
import { fleet } from "./fleet";
import { fleetMcp } from "./fleet-mcp";
import { hookGate } from "./hook-gate";
import { contractAsFiles } from "./contract-as-files";
import { compose } from "./compose-extensions";
import { multiStep } from "./multi-step";
import { imageGen } from "./image-generation";

export const LESSONS: EduLesson[] = [
  anatomy,
  contextInside,
  loop,
  multiStep,
  gate,
  mcp,
  contextWindow,
  progressiveDisclosure,
  skill,
  fleet,
  fleetMcp,
  hookGate,
  contractAsFiles,
  compose,
  imageGen,
];

// Both former stubs are now built lessons; nothing is left "planned".
export const PLANNED: Planned[] = [];

export type { EduLesson, Planned, Loc } from "../model";
