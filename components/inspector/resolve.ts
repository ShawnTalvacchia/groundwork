/**
 * Client-side resolution for the element inspector: turn a pinned element's
 * computed styles back into design-system token NAMES. Token names are the
 * system's vocabulary (globals.css: names are load-bearing, values are
 * yours), so the inspector reports names, never bare values.
 *
 * How matching works: token values as authored (oklch, rem, keywords) and an
 * element's computed styles (rgb/oklch serializations, px) rarely compare
 * equal as strings. So every token is probed once per pin through a hidden
 * element, letting the browser canonicalize both sides into the same
 * serialization before comparison. Probing ~200 tokens is single-digit
 * milliseconds, and doing it per pin keeps the index correct across theme
 * flips without watching `data-theme`.
 *
 * No "use client" directive on purpose: these are plain functions imported
 * only by the overlay (see component-patterns.md on style constants for the
 * general rule).
 */

export interface InspectorToken {
  name: string; // "--text-primary"
  raw: string; // "var(--neutral-900)" — the authored chain, for context
  utility: string | null; // "text-fg-primary" — the Tailwind name, if mapped
}

export interface InspectorComponent {
  name: string;
  file: string;
  docblock: string | null;
  signature: string[] | null;
  /** Root tags this component renders — disambiguates shared skins
   *  (Button and LinkButton wear the same base classes on different tags). */
  rootTags: string[];
  variants: { map: string; name: string; classes: string }[];
  usage: { count: number; files: string[] };
}

export interface InspectorPattern {
  title: string;
  body: string;
  /** Deep link to this exact rule on the rendered doc page. */
  url: string;
}

export interface InspectorData {
  project: string;
  tokens: InspectorToken[];
  components: InspectorComponent[];
  patterns: InspectorPattern[];
  /** Where a missing rule would be written — the "none recorded" nudge links
   *  here, so a documentation gap is one click from being filled. */
  patternsDocUrl: string;
  /** `path` is repo-relative for a session to open; `url` is the rendered
   *  page for the human. A page that is not a doc carries no path. */
  docs: { label: string; path: string | null; url: string }[];
}

/**
 * Split a docblock into its summary sentence and the depth behind it.
 *
 * Shared components open with "Name — one line of what it is." and then
 * explain themselves, so the first sentence is already a written summary and
 * the panel can honor that convention rather than truncating blindly. The
 * panel shows the head and puts `rest` behind a toggle; the copy block always
 * sends the whole thing, because a session has the budget for it and a reader
 * squinting at a 24rem panel does not.
 */
export function summaryOf(docblock: string): { head: string; rest: string } {
  // `[\s\S]` rather than `.` with the `s` flag: the build's TS target predates
  // dotAll, and a docblock arrives already flattened but may still hold one.
  const m = docblock.match(/^([\s\S]*?[.!?])\s+([\s\S]+)$/);
  return m ? { head: m[1], rest: m[2] } : { head: docblock, rest: "" };
}

/** Shared UI rules that name this component. One home for the match, so the
 *  panel and the copy block can never disagree about what applies. */
export function rulesFor(
  data: InspectorData | null,
  componentName: string
): InspectorPattern[] {
  return data?.patterns.filter((p) => `${p.title} ${p.body}`.includes(componentName)) ?? [];
}

export interface TokenMatch {
  /** CSS property being reported, e.g. "color", "padding". */
  property: string;
  /** The computed value that matched, e.g. "rgb(33, 38, 46)" or "8px". */
  value: string;
  /** Matching token names, best first. Empty = no token matched. */
  tokens: InspectorToken[];
}

interface TokenIndex {
  colors: Map<string, InspectorToken[]>;
  lengths: Map<string, InspectorToken[]>;
  shadows: Map<string, InspectorToken[]>;
  weights: Map<string, InspectorToken[]>;
  /** Font-family tokens with their resolved first family, lowercased. */
  fonts: { token: InspectorToken; family: string }[];
}

/** Semantic names beat raw ramp steps ("--neutral-200") in reports; a token
 *  the @theme layer maps to a utility is the public API and beats both. */
function rank(t: InspectorToken): number {
  if (t.utility) return 0;
  if (!/-\d{2,4}$/.test(t.name)) return 1;
  return 2;
}

function push(map: Map<string, InspectorToken[]>, key: string, t: InspectorToken) {
  const list = map.get(key) ?? [];
  list.push(t);
  list.sort((a, b) => rank(a) - rank(b));
  map.set(key, list);
}

/** Build the value → token-name index for the CURRENT theme. `probe` must be
 *  a rendered element the caller owns (the overlay passes a hidden div). */
export function buildIndex(tokens: InspectorToken[], probe: HTMLElement): TokenIndex {
  const index: TokenIndex = {
    colors: new Map(),
    lengths: new Map(),
    shadows: new Map(),
    weights: new Map(),
    fonts: [],
  };
  const rootStyle = getComputedStyle(document.documentElement);
  const probeStyle = getComputedStyle(probe);

  for (const t of tokens) {
    const value = rootStyle.getPropertyValue(t.name).trim();
    if (!value) continue;

    // Order matters: "0.9375rem" contains letters but is a length, and a
    // bare "0" parses as several things. Colors, then lengths, then shadows,
    // and font families only as the fallback for --font-* names.
    if (t.name.startsWith("--font-weight-")) {
      push(index.weights, value, t);
      continue;
    }
    if (CSS.supports("color", value)) {
      probe.style.color = "";
      probe.style.color = value;
      if (probe.style.color) push(index.colors, probeStyle.color, t);
      continue;
    }
    if (!value.endsWith("%") && CSS.supports("width", value)) {
      probe.style.width = "";
      probe.style.width = value;
      if (probe.style.width) push(index.lengths, probeStyle.width, t);
      continue;
    }
    if (CSS.supports("box-shadow", value)) {
      probe.style.boxShadow = "";
      probe.style.boxShadow = value;
      if (probe.style.boxShadow && probeStyle.boxShadow !== "none") {
        push(index.shadows, probeStyle.boxShadow, t);
        continue;
      }
    }
    if (/^--font-/.test(t.name) && /[a-zA-Z]/.test(value)) {
      const family = value.split(",")[0].trim().replace(/^["']|["']$/g, "").toLowerCase();
      if (family) index.fonts.push({ token: t, family });
    }
  }
  return index;
}

const TRANSPARENT = new Set(["rgba(0, 0, 0, 0)", "transparent"]);

/** Several tokens can resolve to one value (white is a surface AND a text
 *  color). The property being reported disambiguates: put the token family
 *  that property draws from first, keep the rank order within each half. */
const PREFER: Record<string, RegExp> = {
  color: /^--text-/,
  background: /^--(surface|brand|status)-/,
  "border-color": /^--border-/,
  "font-size": /^--font-size-/,
  "border-radius": /^--radius-/,
  padding: /^--space-/,
  gap: /^--space-/,
};

function byProperty(property: string, tokens: InspectorToken[]): InspectorToken[] {
  const re = PREFER[property];
  if (!re) return tokens;
  return [...tokens.filter((t) => re.test(t.name)), ...tokens.filter((t) => !re.test(t.name))];
}

/** Resolve one element's computed styles against the index. Only properties
 *  that are visibly in play are reported; unmatched values are kept (with an
 *  empty token list) so the report says "not a token" out loud. */
export function resolveElement(el: Element, index: TokenIndex): TokenMatch[] {
  const cs = getComputedStyle(el);
  const out: TokenMatch[] = [];

  const color = (property: string, value: string) => {
    if (!value || TRANSPARENT.has(value)) return;
    out.push({ property, value, tokens: byProperty(property, index.colors.get(value) ?? []) });
  };
  const length = (property: string, value: string) => {
    if (!value || value === "0px") return;
    out.push({ property, value, tokens: byProperty(property, index.lengths.get(value) ?? []) });
  };

  color("color", cs.color);
  color("background", cs.backgroundColor);
  if (parseFloat(cs.borderTopWidth) > 0) color("border-color", cs.borderTopColor);

  length("font-size", cs.fontSize);

  const weightTokens = index.weights.get(cs.fontWeight);
  if (weightTokens?.length) out.push({ property: "font-weight", value: cs.fontWeight, tokens: weightTokens });

  const firstFamily = cs.fontFamily.split(",")[0].trim().replace(/^["']|["']$/g, "").toLowerCase();
  const fontHit = index.fonts.find((f) => f.family === firstFamily);
  if (fontHit) out.push({ property: "font-family", value: firstFamily, tokens: [fontHit.token] });

  length("border-radius", cs.borderTopLeftRadius);
  if (cs.boxShadow !== "none") {
    out.push({ property: "shadow", value: cs.boxShadow, tokens: index.shadows.get(cs.boxShadow) ?? [] });
  }

  const sides = [cs.paddingTop, cs.paddingRight, cs.paddingBottom, cs.paddingLeft];
  for (const v of [...new Set(sides)]) {
    if (v !== "0px") out.push({ property: "padding", value: v, tokens: index.lengths.get(v) ?? [] });
  }
  if ((cs.display.includes("flex") || cs.display.includes("grid")) && cs.gap !== "normal") {
    for (const v of [...new Set(cs.gap.split(" "))]) length("gap", v);
  }

  return out;
}

/** Best-effort React component identity via the fiber tree. Component names
 *  survive in dev; production minification erases most, so callers must
 *  treat null / unknown as normal, not as an error. */
/* ── Component identity ──────────────────────────────────────────────────
   Two detectors, inventory matches ONLY:

   1. SIGNATURE — the component's static class tokens (parsed from its source
      at build) checked against the pinned element and its ancestors,
      innermost first. This is what identifies SERVER components, which never
      appear in the client fiber tree.
   2. FIBER — the client-component fallback. Names in the fiber tree are only
      trusted when they match the inventory: the plumbing between an element
      and its component also reads as PascalCase (LinkComponent,
      SegmentViewNode, InnerScrollAndFocusHandlerOld…), and no suffix pattern
      keeps up with it, so unknown names are never reported.

   Null is still a normal answer — identity stays best-effort. */

export interface IdentifiedComponent {
  component: InspectorComponent;
  /** Variant names whose classes are all present on the matched node. */
  activeVariants: string[];
}

function withVariants(component: InspectorComponent, node: Element): IdentifiedComponent {
  const activeVariants = component.variants
    .filter((v) => v.classes.split(/\s+/).every((t) => node.classList.contains(t)))
    .map((v) => v.name);
  return { component, activeVariants };
}

function fiberName(el: Element, known: Set<string>): string | null {
  const key = Object.keys(el).find((k) => k.startsWith("__reactFiber$"));
  if (!key) return null;
  // The fiber node hangs off the DOM element under a per-render key.
  let fiber = (el as unknown as Record<string, unknown>)[key] as
    | { type: unknown; return: unknown }
    | null;
  while (fiber) {
    const t = fiber.type as { displayName?: string; name?: string; render?: { name?: string } } | string | null;
    const name =
      typeof t === "function" || (t && typeof t === "object")
        ? ((t as { displayName?: string }).displayName ??
          (t as { name?: string }).name ??
          (t as { render?: { name?: string } }).render?.name ??
          null)
        : null;
    if (name && known.has(name)) return name;
    fiber = fiber.return as typeof fiber;
  }
  return null;
}

export function identifyComponent(
  el: Element,
  components: InspectorComponent[]
): IdentifiedComponent | null {
  let node: Element | null = el;
  for (let depth = 0; node && depth < 8; depth++, node = node.parentElement) {
    const tag = node.tagName.toLowerCase();
    for (const c of components) {
      if (c.rootTags.length > 0 && !c.rootTags.includes(tag)) continue;
      if (c.signature && c.signature.every((t) => node!.classList.contains(t))) {
        return withVariants(c, node);
      }
    }
  }
  const name = fiberName(el, new Set(components.map((c) => c.name)));
  if (name) {
    const c = components.find((x) => x.name === name)!;
    return withVariants(c, el);
  }
  return null;
}

/** Fallback token list when the data route is unreachable (a gated deploy):
 *  read :root custom properties straight from the same-origin stylesheets.
 *  Names and current values only — no authored chains, no utilities. */
export function tokensFromStylesheets(): InspectorToken[] {
  const names = new Set<string>();
  for (const sheet of Array.from(document.styleSheets)) {
    let rules: CSSRuleList;
    try {
      rules = sheet.cssRules; // throws on cross-origin sheets
    } catch {
      continue;
    }
    for (const rule of Array.from(rules)) {
      if (!(rule instanceof CSSStyleRule) || !rule.selectorText.includes(":root")) continue;
      for (const prop of Array.from(rule.style)) {
        if (prop.startsWith("--")) names.add(prop);
      }
    }
  }
  return [...names].map((name) => ({ name, raw: "", utility: null }));
}

/* ── The carry-back block ─────────────────────────────────────────────── */

export interface PinnedContext {
  element: Element;
  component: IdentifiedComponent | null;
  matches: TokenMatch[];
}

function describeElement(el: Element): string {
  const tag = el.tagName.toLowerCase();
  const id = el.id ? ` id="${el.id}"` : "";
  const cls = typeof el.className === "string" && el.className ? ` class="${el.className}"` : "";
  return `<${tag}${id}${cls}>`;
}

/** One markdown block, shaped to paste into an LLM session. Voice rules
 *  apply (short chunks, no em dashes). */
export function buildContextBlock(data: InspectorData | null, pinned: PinnedContext): string {
  const el = pinned.element;
  const lines: string[] = [];
  const text = (el.textContent ?? "").trim().replace(/\s+/g, " ").slice(0, 80);

  lines.push(`## UI context from the element inspector (read-only)`);
  lines.push("");
  if (data?.project) lines.push(`Project: ${data.project}`);
  lines.push(`Page: ${window.location.pathname}`);
  lines.push(`Element: ${describeElement(el)}`);
  if (text) lines.push(`Text: "${text}"`);
  if (pinned.component) {
    const { component: c, activeVariants } = pinned.component;
    lines.push("");
    lines.push(`### Component: ${c.name} (${c.file})`);
    if (c.docblock) lines.push(`About: ${c.docblock}`);
    if (c.variants.length) {
      // One clause per variant map: "primary (of primary, secondary, ghost)".
      const parts = [...new Set(c.variants.map((v) => v.map))].map((mapName) => {
        const options = c.variants.filter((v) => v.map === mapName).map((v) => v.name);
        const active = activeVariants.filter((a) => options.includes(a));
        return active.length
          ? `${active.join("/")} (of ${options.join(", ")})`
          : `one of ${options.join(", ")}`;
      });
      lines.push(`Variant here: ${parts.join(" · ")}`);
    }
    lines.push(
      c.usage.count > 0
        ? `Used ${c.usage.count} time${c.usage.count === 1 ? "" : "s"} outside the styleguide: ${c.usage.files.join(", ")}`
        : `No callsites outside the styleguide yet`
    );
    // Only the gap is stated here; rules that DO name it get their own
    // section below, in full, rather than being listed twice.
    if (rulesFor(data, c.name).length === 0) {
      lines.push(`Rules for this component: none recorded in component-patterns.md`);
    }
  }
  lines.push("");
  lines.push(`### Tokens in play`);
  if (pinned.matches.length === 0) {
    lines.push(`- none resolved on this element`);
  }
  for (const m of pinned.matches) {
    const best = m.tokens[0];
    if (best) {
      const util = best.utility ? ` · ${best.utility}` : "";
      const chain = best.raw ? ` · ${best.raw}` : "";
      lines.push(`- ${m.property}: ${best.name}${util}${chain} (${m.value})`);
    } else {
      lines.push(`- ${m.property}: ${m.value} (no token matches: off the design system)`);
    }
  }
  if (data?.patterns.length) {
    // Rules naming the pinned component are constraints on any edit, so they
    // travel in full. The rest travel as titles: still discoverable, without
    // spending the session's context on rules that do not apply here.
    const named = pinned.component ? rulesFor(data, pinned.component.component.name) : [];
    const namedTitles = new Set(named.map((p) => p.title));
    const others = data.patterns.filter((p) => !namedTitles.has(p.title));
    if (named.length) {
      lines.push("");
      lines.push(`### Rules naming this component`);
      for (const p of named) lines.push(`- ${p.title}: ${p.body}`);
    }
    if (others.length) {
      lines.push("");
      lines.push(`### Other shared UI rules (titles only)`);
      for (const p of others) lines.push(`- ${p.title}`);
    }
  }
  if (data?.docs.length) {
    lines.push("");
    lines.push(`### Project docs`);
    // Repo-relative paths, not URLs: a session opens files, it does not browse.
    // Pages with no file behind them fall back to their route.
    for (const d of data.docs) {
      lines.push(`- ${d.label}: ${d.path ?? d.url}`);
    }
  }
  return lines.join("\n");
}
