// edu abstraction card — a React Flow node for harness parts the live system map
// has no card for (skills, hooks, the loop, session.jsonl-as-concept). Drawn in
// the simulator's visual language (surface + hairline + a left tick coloured by
// the shared event vocabulary) so a learner meets one world, not two. Reveal-on-
// click for `detail` rows; a progressive-disclosure `body` that opens on `expanded`.

import { useState } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { nodeTypes as simNodeTypes } from "../lab/flowmap/nodes";
import { useLang } from "../state/lang";
import type { EduCardData, Loc } from "./model";

const ll = (v: Loc | undefined, de: boolean): string =>
  v == null ? "" : typeof v === "string" ? v : de ? v.de ?? v.en : v.en;
const html = (s: string) => ({ dangerouslySetInnerHTML: { __html: s } });

// The 8 invisible handles every sim card exposes (side letter + s/t), so rail
// edges can anchor to an edu card exactly like a sim card.
function Handles() {
  const sides: [Position, string][] = [
    [Position.Left, "l"],
    [Position.Right, "r"],
    [Position.Top, "t"],
    [Position.Bottom, "b"],
  ];
  return (
    <>
      {sides.map(([pos, s]) => (
        <span key={s}>
          <Handle id={`${s}s`} type="source" position={pos} isConnectable={false} />
          <Handle id={`${s}t`} type="target" position={pos} isConnectable={false} />
        </span>
      ))}
    </>
  );
}

function EduCard({ data }: NodeProps) {
  const d = data as EduCardData;
  const de = useLang() === "de";
  const [open, setOpen] = useState(false);
  const hasDetail = Array.isArray(d.detail) && d.detail.length > 0;
  const bodyOpen = Boolean(d.expanded) && Array.isArray(d.body) && d.body.length > 0;

  return (
    <div className={`edu-card k-${d.kind}${d.active ? " is-active" : ""}${open ? " is-open" : ""}`}>
      <Handles />
      {d.eyebrow && <div className="edu-card-eyebrow">{d.eyebrow}</div>}
      <div className="edu-card-title" {...html(ll(d.title, de))} />
      {d.sub && <div className="edu-card-sub" {...html(ll(d.sub, de))} />}

      {hasDetail && (
        <button className="edu-card-inspect nodrag" onClick={() => setOpen((o) => !o)}>
          {open ? (de ? "− schließen" : "− close") : de ? "＋ untersuchen" : "＋ inspect"}
        </button>
      )}
      {open && hasDetail && (
        <ul className="edu-card-detail nowheel">
          {d.detail!.map((row, i) => (
            <li key={i} {...html(ll(row, de))} />
          ))}
        </ul>
      )}

      {bodyOpen && (
        <div className="edu-card-body nowheel">
          {d.body!.map((b) => (
            <div key={b.n} className="edu-card-body-row">
              <span className="edu-card-body-n">{b.n}</span>
              <span {...html(ll(b.t, de))} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// One world: the simulator's cards + the edu abstraction card, on the same canvas.
export const eduNodeTypes = { ...simNodeTypes, eduCard: EduCard };
