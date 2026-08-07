"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import {
  buildContextBlock,
  buildIndex,
  identifyComponent,
  resolveElement,
  rulesFor,
  summaryOf,
  tokensFromStylesheets,
  type InspectorData,
  type PinnedContext,
} from "./resolve";

/**
 * The inspect mode. Lazy-loaded by InspectorGate only when the URL carries
 * `?inspect` — nothing here runs during normal use (phase board: opt-in,
 * never always-on; read-only by design: the mode selects and reports, it
 * never writes).
 *
 * Interaction: hover highlights, click pins (and is swallowed, so links and
 * buttons don't fire while inspecting), Esc unpins then exits. The panel and
 * its children are excluded from targeting via the data-gw-inspector root.
 *
 * Context comes from `/system/inspector.json`, which sits behind the same
 * gate as the rest of the record (proxy.ts). When that fetch fails (a gated
 * deploy, cookie absent), the mode degrades to token names read from the
 * page's own stylesheets: still useful, never a leak.
 */

const IGNORE = "[data-gw-inspector]";

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

function rectOf(el: Element): Rect {
  const r = el.getBoundingClientRect();
  return { top: r.top, left: r.left, width: r.width, height: r.height };
}

export function InspectorOverlay({ onExit }: { onExit: () => void }) {
  const [data, setData] = useState<InspectorData | null>(null);
  const [gated, setGated] = useState(false);
  const [hoverRect, setHoverRect] = useState<Rect | null>(null);
  const [pinned, setPinned] = useState<PinnedContext | null>(null);
  const [pinnedRect, setPinnedRect] = useState<Rect | null>(null);
  const [copied, setCopied] = useState(false);
  const [docExpanded, setDocExpanded] = useState(false);
  const probeRef = useRef<HTMLDivElement>(null);
  const dataRef = useRef<InspectorData | null>(null);
  const pinnedRef = useRef<PinnedContext | null>(null);
  useEffect(() => {
    dataRef.current = data;
  }, [data]);
  useEffect(() => {
    pinnedRef.current = pinned;
  }, [pinned]);

  useEffect(() => {
    let alive = true;
    fetch("/system/inspector.json")
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((d: InspectorData) => {
        if (alive) setData(d);
      })
      .catch(() => {
        if (!alive) return;
        setGated(true);
        setData({
          project: "",
          tokens: tokensFromStylesheets(),
          components: [],
          patterns: [],
          patternsDocUrl: "",
          docs: [],
        });
      });
    return () => {
      alive = false;
    };
  }, []);

  const pin = useCallback((el: Element) => {
    const d = dataRef.current;
    const probe = probeRef.current;
    if (!d || !probe) return;
    const index = buildIndex(d.tokens, probe);
    setPinned({
      element: el,
      component: identifyComponent(el, d.components),
      matches: resolveElement(el, index),
    });
    setPinnedRect(rectOf(el));
    setCopied(false);
    setDocExpanded(false); // a new pin starts collapsed
  }, []);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const t = e.target as Element | null;
      if (!t || t.closest(IGNORE)) {
        setHoverRect(null);
        return;
      }
      setHoverRect(rectOf(t));
    };
    const onClick = (e: MouseEvent) => {
      const t = e.target as Element | null;
      if (!t || t.closest(IGNORE)) return; // panel clicks pass through
      e.preventDefault();
      e.stopPropagation();
      pin(t);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (pinnedRef.current) {
        setPinned(null);
        setPinnedRect(null);
      } else {
        onExit();
      }
    };
    const onScroll = () => {
      setHoverRect(null);
      if (pinnedRef.current) setPinnedRect(rectOf(pinnedRef.current.element));
    };
    document.addEventListener("mousemove", onMove, true);
    document.addEventListener("click", onClick, true);
    document.addEventListener("keydown", onKey, true);
    window.addEventListener("scroll", onScroll, true);
    return () => {
      document.removeEventListener("mousemove", onMove, true);
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("keydown", onKey, true);
      window.removeEventListener("scroll", onScroll, true);
    };
  }, [pin, onExit]);

  const copy = async () => {
    if (!pinned) return;
    await navigator.clipboard.writeText(buildContextBlock(data, pinned));
    setCopied(true);
  };

  const box = (r: Rect, cls: string, key: string) => (
    <div
      key={key}
      data-gw-inspector
      className={`pointer-events-none fixed z-[9998] ${cls}`}
      style={{ top: r.top, left: r.left, width: r.width, height: r.height }}
    />
  );

  return (
    <div data-gw-inspector>
      {/* Probe: hidden, rendered, owned here — buildIndex canonicalizes token values through it. */}
      <div ref={probeRef} aria-hidden className="fixed -left-[9999px] top-0 h-1 w-1" />

      {hoverRect && box(hoverRect, "border border-dashed border-brand-main", "hover")}
      {pinnedRect && box(pinnedRect, "border-2 border-brand-main bg-brand-subtle/20", "pinned")}

      <aside
        data-gw-inspector
        className="fixed bottom-4 right-4 z-[9999] flex max-h-[70vh] w-96 max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-panel border border-edge-regular bg-surface-popout text-fg-primary shadow-modal"
      >
        <header className="flex items-center justify-between gap-sm border-b border-edge-light px-md py-sm">
          <div>
            <p className="text-sm font-semibold">Inspect mode</p>
            <p className="text-2xs text-fg-tertiary">Read-only. Click an element to pin it. Esc exits.</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onExit}>
            Exit
          </Button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-md py-sm text-xs">
          {gated && (
            <p className="mb-2 rounded-sm bg-surface-inset px-2 py-1 text-2xs text-fg-tertiary">
              The record is gated on this deploy. Showing token names from the stylesheet only.
            </p>
          )}
          {!pinned && <p className="text-fg-secondary">Nothing pinned yet. Hover to highlight, click to pin.</p>}
          {pinned && (
            <>
              <p className="break-all font-mono text-2xs text-fg-secondary">
                {pinned.element.tagName.toLowerCase()}
                {typeof pinned.element.className === "string" && pinned.element.className
                  ? `.${pinned.element.className.trim().split(/\s+/).slice(0, 4).join(".")}`
                  : ""}
              </p>
              {pinned.component && (
                <div className="mt-1 rounded-sm bg-surface-inset px-2 py-1">
                  <p>
                    <span className="font-mono font-semibold">{pinned.component.component.name}</span>
                    <span className="text-fg-tertiary"> · {pinned.component.component.file}</span>
                  </p>
                  {pinned.component.component.docblock &&
                    (() => {
                      // Summary by default. The depth is one click away here
                      // and always whole in the copied block, so trimming the
                      // panel costs the reader nothing.
                      const { head, rest } = summaryOf(pinned.component.component.docblock);
                      return (
                        <p className="mt-0.5 text-2xs text-fg-secondary">
                          {docExpanded ? `${head} ${rest}` : head}
                          {rest && (
                            <button
                              type="button"
                              onClick={() => setDocExpanded((v) => !v)}
                              className="ml-1 text-brand-main underline-offset-2 hover:underline"
                            >
                              {docExpanded ? "less" : "more"}
                            </button>
                          )}
                        </p>
                      );
                    })()}
                  <p className="mt-0.5 text-2xs text-fg-tertiary">
                    {pinned.component.activeVariants.length > 0 && (
                      <>
                        variant {pinned.component.activeVariants.join(", ")} of{" "}
                        {[...new Set(pinned.component.component.variants.map((v) => v.name))].length} ·{" "}
                      </>
                    )}
                    {pinned.component.component.usage.count > 0
                      ? `used ${pinned.component.component.usage.count}x: ${pinned.component.component.usage.files.join(", ")}`
                      : "no callsites outside the styleguide"}
                  </p>
                </div>
              )}
              <ul className="mt-2 space-y-1">
                {pinned.matches.map((m, i) => (
                  <li key={i} className="flex items-baseline gap-2">
                    <span className="w-24 shrink-0 text-fg-tertiary">{m.property}</span>
                    {m.tokens[0] ? (
                      <span className="font-mono text-fg-primary">
                        {m.tokens[0].name}
                        {m.tokens[0].utility && (
                          <span className="text-fg-tertiary"> · {m.tokens[0].utility}</span>
                        )}
                      </span>
                    ) : (
                      <span className="font-mono text-warning-strong">{m.value} · no token</span>
                    )}
                  </li>
                ))}
                {pinned.matches.length === 0 && <li className="text-fg-tertiary">No tokens resolved here.</li>}
              </ul>
            </>
          )}

          {/* Docs. Rules that name the pinned component link straight to their
              own heading; when none exist, the gap is stated and links to the
              file where it would be written. Both open in a new tab so the
              pin survives the detour. */}
          {data && (data.docs.length > 0 || pinned?.component) && (
            <div className="mt-3 border-t border-edge-light pt-2">
              <p className="text-2xs font-semibold uppercase tracking-wide text-fg-tertiary">Docs</p>

              {pinned?.component &&
                (() => {
                  const name = pinned.component.component.name;
                  const rules = rulesFor(data, name);
                  if (rules.length) {
                    return (
                      <ul className="mt-1 space-y-0.5">
                        {rules.map((r) => (
                          <li key={r.url}>
                            <a
                              href={r.url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-brand-main underline-offset-2 hover:underline"
                            >
                              {r.title}
                            </a>
                          </li>
                        ))}
                      </ul>
                    );
                  }
                  return (
                    <p className="mt-1 text-fg-tertiary">
                      No rules recorded for {name}.
                      {data.patternsDocUrl && (
                        <>
                          {" "}
                          <a
                            href={data.patternsDocUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-brand-main underline-offset-2 hover:underline"
                          >
                            Write one
                          </a>
                        </>
                      )}
                    </p>
                  );
                })()}

              {data.docs.length > 0 && (
                <ul className="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5 text-2xs">
                  {data.docs.map((d) => (
                    <li key={d.url}>
                      <a
                        href={d.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-fg-secondary underline-offset-2 hover:text-fg-primary hover:underline"
                      >
                        {d.label}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        <footer className="border-t border-edge-light px-md py-sm">
          <Button size="sm" onClick={copy} disabled={!pinned}>
            {copied ? "Copied" : "Copy context for the session"}
          </Button>
        </footer>
      </aside>
    </div>
  );
}
