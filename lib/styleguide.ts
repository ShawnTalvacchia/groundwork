import fs from "node:fs";
import path from "node:path";

// Parses app/globals.css at build time — the styleguide renders exclusively
// from what this returns, so a token edit updates the styleguide in the same
// commit (derived, never authored; same law as lib/system.ts). The parser
// adapts to the CSS as written — its section banners ARE the styleguide's
// grouping — and the CSS never bends to the parser.
//
// Scopes: light (:root), dark (:root[data-theme="dark"] overlaid on light),
// mobile (the max-width:767px :root block overlaid on light). Values shown in
// the styleguide are resolved through the same var() chains the browser walks.

const CSS_PATH = path.join(process.cwd(), "app", "globals.css");

/* ── Data shapes ───────────────────────────────────────────────────── */

export interface TokenDef {
  name: string; // "--brand-main"
  raw: string; // "var(--brand-600)"
  /** First var() target, when raw is an alias — "--brand-600". */
  target: string | null;
  light: string; // fully resolved light value — "#006862"
  /** Resolved dark value; null when identical to light (doesn't flip). */
  dark: string | null;
  /** Resolved mobile value; null when identical to desktop. */
  mobile: string | null;
  /** Trailing /* comment *​/ on the declaration, cleaned. */
  note: string | null;
}

export interface TokenSection {
  /** Banner text, e.g. "_Neutral", "SEMANTIC TOKENS — Surface". */
  title: string;
  /** The banner's remaining prose, when it carries guidance. */
  note: string | null;
  tokens: TokenDef[];
}

export interface StyleguideData {
  /** :root sections, in file order (primitives first, then semantic…). */
  root: TokenSection[];
  /** @theme sections (the Tailwind mapping layer), in file order. */
  theme: TokenSection[];
  /** Token names the dark theme overrides directly. */
  darkOverridden: string[];
  definedCount: number;
}

export interface TokenHealth {
  defined: number;
  /** :root tokens nothing references — the punch-list B5 feed. */
  orphans: string[];
  /** var(--x) references with no definition anywhere. `guarded` = every
   *  occurrence carries a fallback (degrades quietly); unguarded ones
   *  render as `unset` — silent bugs. */
  undefinedRefs: { name: string; count: number; files: string[]; guarded: boolean }[];
}

export interface ComponentEntry {
  name: string; // "ButtonAction"
  file: string; // "components/ui/ButtonAction.tsx"
}

export interface ComponentGroup {
  dir: string; // "ui" | "overlays" | "layout"
  components: ComponentEntry[];
}

/* ── CSS block extraction ──────────────────────────────────────────── */

/** Body of the first block opened by `selector` (brace-balanced). Pass
 *  `containing` to skip matches whose block lacks that substring (several
 *  `@media (max-width: 767px)` blocks exist; only one holds `:root`). */
function blockOf(css: string, selector: RegExp, containing?: string): string {
  const re = new RegExp(selector.source, selector.flags.includes("g") ? selector.flags : selector.flags + "g");
  let m;
  while ((m = re.exec(css))) {
    let i = css.indexOf("{", m.index);
    if (i === -1) return "";
    let depth = 0;
    const start = i + 1;
    for (; i < css.length; i++) {
      if (css[i] === "{") depth++;
      else if (css[i] === "}" && --depth === 0) break;
    }
    const body = css.slice(start, i);
    if (!containing || body.includes(containing)) return body;
  }
  return "";
}

const BANNER_LINE = /^[=─═\-\s]*$/; // decorative banner edges

/** Tokens + their section banners, walked in order. */
function parseBlock(body: string): TokenSection[] {
  const sections: TokenSection[] = [];
  let current: TokenSection = { title: "", note: null, tokens: [] };
  const push = () => {
    if (current.tokens.length) sections.push(current);
  };

  // Walk comments and declarations in file order.
  const item = /\/\*([\s\S]*?)\*\/|(--[\w-]+)\s*:\s*([^;]+);[ \t]*(\/\*([\s\S]*?)\*\/)?/g;
  let m;
  while ((m = item.exec(body))) {
    if (m[1] !== undefined && m[2] === undefined) {
      // A standalone comment — a banner if it uses the file's banner styles:
      // `====` walls, or a first line bracketed in dashes (`---- X ----` /
      // `── X ──`), whose remaining lines may carry prose (kept as the note).
      const text = m[1].trim();
      const firstLine = text.split("\n")[0].trim();
      const isBanner = /[=═]{8,}/.test(text) || /^[-─]{2,}\s*\S.*?[-─]{2,}$/.test(firstLine);
      if (!isBanner) continue;
      const lines = m[1]
        .split("\n")
        .map((l) => l.replace(/^\s*\*?\s*/, "").replace(/^[-─=═\s]+|[-─=═\s]+$/g, "").trim())
        .filter((l) => l && !BANNER_LINE.test(l));
      if (!lines.length) continue;
      push();
      current = { title: lines[0], note: lines.length > 1 ? lines.slice(1).join(" ") : null, tokens: [] };
    } else if (m[2]) {
      const note = m[5]
        ? m[5]
            .split("\n")
            .map((l) => l.trim())
            .join(" ")
            .trim()
        : null;
      current.tokens.push({
        name: m[2],
        raw: m[3].trim(),
        target: m[3].match(/var\((--[\w-]+)/)?.[1] ?? null,
        light: "",
        dark: null,
        mobile: null,
        note,
      });
    }
  }
  push();
  return sections;
}

/** Resolves var() chains against a scope map (browser-style, with fallbacks). */
function resolveValue(value: string, map: Map<string, string>): string {
  let out = value;
  for (let depth = 0; depth < 12 && out.includes("var("); depth++) {
    out = out.replace(/var\((--[\w-]+)(?:\s*,\s*([^()]*))?\)/g, (whole, name, fallback) => {
      const v = map.get(name);
      return v !== undefined ? v : fallback !== undefined ? fallback.trim() : whole;
    });
    if (!/var\((--[\w-]+)/.test(out) || out === value) break;
    value = out;
  }
  return out.trim();
}

/* ── The parse ─────────────────────────────────────────────────────── */

let cache: StyleguideData | null = null;

export function getStyleguide(): StyleguideData {
  if (cache) return cache;
  const css = fs.readFileSync(CSS_PATH, "utf-8");

  const themeSections = parseBlock(blockOf(css, /@theme\s*/));
  const rootSections = parseBlock(blockOf(css, /^:root\s*(?=\{)/m));
  const darkSections = parseBlock(blockOf(css, /:root\[data-theme="dark"\]\s*(?=\{)/));
  // The mobile :root override lives inside ONE of the max-width-767 blocks.
  const mobileMedia = blockOf(css, /@media\s*\(max-width:\s*767px\)\s*/, ":root");
  const mobileSections = parseBlock(blockOf(mobileMedia, /:root\s*(?=\{)/));

  const flat = (s: TokenSection[]) => s.flatMap((x) => x.tokens);
  // Self-referential @theme aliases (`--radius-md: var(--radius-md)`) are
  // Tailwind-mapping no-ops — adding them would make resolution circular.
  const asMap = (defs: TokenDef[]) =>
    new Map(defs.filter((d) => d.target !== d.name).map((d) => [d.name, d.raw]));

  const lightMap = new Map([...asMap(flat(rootSections)), ...asMap(flat(themeSections))]);
  const darkOnly = asMap(flat(darkSections));
  const darkMap = new Map([...lightMap, ...darkOnly]);
  const mobileOnly = asMap(flat(mobileSections));
  const mobileMap = new Map([...lightMap, ...mobileOnly]);

  for (const section of [...rootSections, ...themeSections]) {
    for (const t of section.tokens) {
      t.light = resolveValue(t.raw, lightMap);
      // A scope's direct override of THIS token wins over resolving the
      // light alias chain through that scope (browser semantics).
      const dark = resolveValue(darkOnly.get(t.name) ?? t.raw, darkMap);
      t.dark = dark !== t.light ? dark : null;
      const mobile = resolveValue(mobileOnly.get(t.name) ?? t.raw, mobileMap);
      t.mobile = mobile !== t.light ? mobile : null;
    }
  }

  cache = {
    root: rootSections,
    theme: themeSections,
    darkOverridden: [...darkOnly.keys()],
    definedCount: lightMap.size,
  };
  return cache;
}

/* ── Health: orphans + undefined references ────────────────────────────
   Scanned across app/, components/, lib/, contexts/, hooks/ (.tsx + .css).
   A :root token is in use if anything references it via var() outside its
   own definition, or the @theme layer maps it into a Tailwind utility.
   The styleguide's own pages are excluded — they reference tokens
   dynamically and must never count as product usage. */

const SCAN_DIRS = ["app", "components", "lib", "contexts", "hooks"];
const EXCLUDE = [
  path.join("app", "system", "styleguide"),
  path.join("lib", "styleguide.ts"), // this parser's own regexes aren't usage
  path.join("lib", "system.ts"),
];

/** Comments don't count — a token named in prose is neither used nor broken. */
function stripComments(text: string, isCss: boolean): string {
  let out = text.replace(/\/\*[\s\S]*?\*\//g, " ");
  if (!isCss) out = out.replace(/^\s*\/\/.*$/gm, " ");
  return out;
}

function scanFiles(): { file: string; text: string }[] {
  const out: { file: string; text: string }[] = [];
  const walk = (dir: string) => {
    if (!fs.existsSync(dir)) return;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.name.startsWith(".") || entry.name === "node_modules") continue;
      const full = path.join(dir, entry.name);
      const rel = path.relative(process.cwd(), full);
      if (EXCLUDE.some((e) => rel.startsWith(e))) continue;
      if (entry.isDirectory()) walk(full);
      else if (/\.(tsx|ts|css)$/.test(entry.name))
        out.push({ file: rel, text: stripComments(fs.readFileSync(full, "utf-8"), rel.endsWith(".css")) });
    }
  };
  for (const d of SCAN_DIRS) walk(path.join(process.cwd(), d));
  return out;
}

let healthCache: TokenHealth | null = null;

export function getTokenHealth(): TokenHealth {
  if (healthCache) return healthCache;
  const data = getStyleguide();
  const files = scanFiles();

  const defined = new Set<string>();
  for (const s of [...data.root, ...data.theme]) for (const t of s.tokens) defined.add(t.name);

  // Every var(--x) reference, everywhere — with globals.css's own
  // definitions masked out so a token's declaration isn't its own usage.
  const refs = new Map<string, Set<string>>(); // name -> files
  const unguarded = new Set<string>(); // names referenced ≥once with NO fallback
  for (const { file, text } of files) {
    const scannable = file === path.join("app", "globals.css")
      ? text.replace(/^\s*--[\w-]+\s*:[^;]*;/gm, (decl) => decl.replace(/var\(/g, "ref("))
      : text;
    for (const m of scannable.matchAll(/var\((--[\w-]+)\s*([,)])/g)) {
      if (!refs.has(m[1])) refs.set(m[1], new Set());
      refs.get(m[1])!.add(file);
      if (m[2] === ")") unguarded.add(m[1]);
    }
  }

  // Definitions outside :root are real too: component-scoped custom
  // properties in any CSS selector, style={{ "--x": … }} inline, and
  // el.style.setProperty("--x", …).
  const inlineDefs = new Set<string>();
  for (const { file, text } of files) {
    for (const m of text.matchAll(/["'](--[\w-]+)["']\s*[:,]/g)) inlineDefs.add(m[1]);
    if (file.endsWith(".css")) {
      for (const m of text.matchAll(/(--[\w-]+)\s*:/g)) inlineDefs.add(m[1]);
    }
  }

  // @theme references keep a :root token alive (it's public Tailwind API).
  const themeTargets = new Set<string>();
  for (const s of data.theme)
    for (const t of s.tokens)
      for (const m of t.raw.matchAll(/var\((--[\w-]+)/g)) themeTargets.add(m[1]);

  // globals.css-internal chains: --a: var(--b) keeps --b alive when --a is a
  // semantic alias — but only transitively from a token that IS used. To stay
  // honest without over-engineering, treat any var() target inside globals'
  // :root/dark blocks as a reference (the dark safety-net repoints alone
  // never save a token, since they redefine rather than reference).
  const rootTargets = new Set<string>();
  for (const s of data.root)
    for (const t of s.tokens)
      for (const m of t.raw.matchAll(/var\((--[\w-]+)/g)) rootTargets.add(m[1]);

  const orphans: string[] = [];
  for (const s of data.root) {
    for (const t of s.tokens) {
      const referenced = refs.has(t.name) || themeTargets.has(t.name) || rootTargets.has(t.name);
      if (!referenced) orphans.push(t.name);
    }
  }

  const undefinedRefs = [...refs.entries()]
    .filter(([name]) => !defined.has(name) && !inlineDefs.has(name) && !name.startsWith("--tw-"))
    .map(([name, fileSet]) => ({
      name,
      count: fileSet.size,
      files: [...fileSet].sort(),
      guarded: !unguarded.has(name),
    }))
    .sort((a, b) => Number(a.guarded) - Number(b.guarded) || b.count - a.count);

  healthCache = { defined: defined.size, orphans, undefinedRefs };
  return healthCache;
}

/* ── Tailwind utility names ─────────────────────────────────────────────
   The @theme layer is what makes tokens typeable as utilities; these two
   helpers turn a theme token into the class a developer writes, and map a
   :root token back to its utility via the theme alias that targets it. */

export function utilityFor(themeToken: string): string {
  const rules: [RegExp, (s: string) => string][] = [
    [/^--color-fg-(.+)/, (s) => `text-fg-${s}`],
    [/^--color-edge-(.+)/, (s) => `border-edge-${s}`],
    [/^--color-(.+)/, (s) => `bg-${s}`],
    [/^--spacing-(.+)/, (s) => `gap-${s} · p-${s}`],
    [/^--radius-(.+)/, (s) => `rounded-${s}`],
    [/^--shadow-(.+)/, (s) => `shadow-${s}`],
    [/^--text-(.+)/, (s) => `text-${s}`],
    [/^--font-weight-(.+)/, (s) => `font-${s}`],
    [/^--font-(.+)/, (s) => `font-${s}`],
    [/^--leading-(.+)/, (s) => `leading-${s}`],
    [/^--tracking-(.+)/, (s) => `tracking-${s}`],
    [/^--breakpoint-(.+)/, (s) => `${s}:*`],
    [/^--container-(.+)/, (s) => `max-w-${s}`],
  ];
  for (const [re, fn] of rules) {
    const m = themeToken.match(re);
    if (m) return fn(m[1]);
  }
  return themeToken;
}

/** :root token name → the Tailwind utility exposed for it (via @theme). */
export function utilityByRootToken(): Map<string, string> {
  const data = getStyleguide();
  const map = new Map<string, string>();
  for (const s of data.theme) {
    for (const t of s.tokens) {
      if (t.target && t.target !== t.name && !map.has(t.target)) {
        map.set(t.target, utilityFor(t.name));
      }
    }
  }
  return map;
}

/* ── Component inventory (derived from the shared component dirs) ───── */

export function getComponentInventory(): ComponentGroup[] {
  const groups: ComponentGroup[] = [];
  for (const dir of ["ui", "overlays", "layout"]) {
    const full = path.join(process.cwd(), "components", dir);
    if (!fs.existsSync(full)) continue;
    const components = fs
      .readdirSync(full)
      .filter((f) => f.endsWith(".tsx"))
      .map((f) => ({ name: f.replace(/\.tsx$/, ""), file: `components/${dir}/${f}` }))
      .sort((a, b) => a.name.localeCompare(b.name));
    groups.push({ dir, components });
  }
  return groups;
}
