// A collapsible side drawer, modelled on LLM_Simulator_v3's panels/Drawer: it
// docks a panel to the left or right of the map and folds to a thin labelled
// rail so the map stays the hero. Open/closed state is owned by the parent
// (SimView), so both drawers read the same stepper cursor as everything else.

import type { ReactNode } from "react";
import { useLang } from "./state/lang";

export function Drawer(props: {
  side: "left" | "right";
  open: boolean;
  title: string;
  onToggle: () => void;
  children: ReactNode;
}) {
  const lang = useLang();
  const { side, open, title } = props;
  // Chevron points the way the panel would move: open = fold back toward its
  // edge, closed = unfold toward the map.
  const chevron = open ? (side === "left" ? "‹" : "›") : side === "left" ? "›" : "‹";
  const collapseLabel = lang === "de" ? `${title} einklappen` : `collapse ${title}`;
  const expandLabel = lang === "de" ? `${title} ausklappen` : `expand ${title}`;

  return (
    <aside className={`edu-drawer edu-drawer--${side}${open ? " is-open" : ""}`}>
      {open ? (
        <>
          <div className="edu-drawer-head">
            <span className="edu-drawer-title">{title}</span>
            <button
              type="button"
              className="edu-drawer-toggle"
              onClick={props.onToggle}
              aria-expanded={true}
              aria-label={collapseLabel}
              title={collapseLabel}
            >
              {chevron}
            </button>
          </div>
          <div className="edu-drawer-body">{props.children}</div>
        </>
      ) : (
        <button
          type="button"
          className="edu-drawer-rail"
          onClick={props.onToggle}
          aria-expanded={false}
          title={expandLabel}
        >
          <span className="edu-drawer-chevron" aria-hidden="true">
            {chevron}
          </span>
          <span className="edu-drawer-rail-label">{title}</span>
        </button>
      )}
    </aside>
  );
}
