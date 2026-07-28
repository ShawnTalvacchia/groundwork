import fs from "node:fs";
import path from "node:path";

// Reads the project's own docs/ tree at build time. The /system pages render
// exclusively from what these parsers return — derived, never authored
// (see docs/implementation/system-surface.md). Every parser here adapts to
// the docs' existing formats (§N sections, P##/V# tables, FC items); the
// formats never bend to the parsers.

// Which doc tree to render. Defaults to this project's own `docs/`. Set
// DOCS_ROOT to point a deployment at a different tree — the mechanism behind
// "two deployments of one repo" (implementation/shipping.md → Where the record
// lives), where a public deploy and a private one render different records
// from the same codebase. Relative paths resolve from the project root.
//
// Written as an explicit ternary on purpose. The inline form
// `path.resolve(cwd, process.env.DOCS_ROOT || "docs")` builds fine but poisons
// Next's build trace: unable to resolve the env var statically, the tracer
// emits a bogus dependency that lands on `.next/lock`, and deploy platforms
// that stat every traced file fail with ENOENT after a successful build. The
// ternary keeps the default branch statically resolvable.
const DOCS_DIR = process.env.DOCS_ROOT
  ? path.resolve(process.cwd(), process.env.DOCS_ROOT)
  : path.join(process.cwd(), "docs");

/* ── Tiers ─────────────────────────────────────────────────────────── */

export type Tier = "bedrock" | "commitments" | "working" | "surface";

export const TIER_ORDER: Tier[] = ["surface", "working", "commitments", "bedrock"];

/** Short labels for tier badges. Everything else about a tier — what lives
 *  there, what it takes to change, when to re-check it, and its stale threshold — is
 *  parsed from CONTRIBUTING (see getTiers). */
export const TIER_META: Record<Tier, { label: string }> = {
  bedrock: { label: "Bedrock" },
  commitments: { label: "Commitments" },
  working: { label: "Working" },
  surface: { label: "Surface" },
};

/* ── Shared helpers ────────────────────────────────────────────────── */

interface Frontmatter {
  [key: string]: string;
}

function parseFrontmatter(raw: string): { fm: Frontmatter; body: string } {
  if (!raw.startsWith("---")) return { fm: {}, body: raw };
  const end = raw.indexOf("\n---", 3);
  if (end === -1) return { fm: {}, body: raw };
  const fm: Frontmatter = {};
  for (const line of raw.slice(3, end).split("\n")) {
    const m = line.match(/^([\w-]+):\s*(.*)$/);
    if (m) fm[m[1]] = m[2].replace(/^["']|["']$/g, "").trim();
  }
  return { fm, body: raw.slice(end + 4) };
}

function firstHeading(body: string): string | null {
  const m = body.match(/^# (.+)$/m);
  return m ? m[1].trim() : null;
}

/** Strips inline markdown for plain-text list surfaces. */
export function stripMd(s: string): string {
  return s
    .replace(/\[\[([^\]|]+)(\|[^\]]+)?\]\]/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/~~([^~]+)~~/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .trim();
}

function readDoc(relPath: string): { fm: Frontmatter; body: string } | null {
  const p = path.join(DOCS_DIR, relPath);
  if (!fs.existsSync(p)) return null;
  const { fm, body } = parseFrontmatter(fs.readFileSync(p, "utf-8"));
  // Parser markers (<!-- PARSED by … -->) and any other HTML comments are
  // editor-facing only — strip before parsing so they can't become a lede,
  // a field value, or a list item. (Rendering already hides them: the doc
  // and board renderers pass skipHtml.)
  return { fm, body: body.replace(/<!--[\s\S]*?-->/g, "") };
}

export function daysSince(isoDate: string | null): number | null {
  if (!isoDate) return null;
  const m = isoDate.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return null;
  const then = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return Math.floor((Date.now() - then.getTime()) / 86_400_000);
}

/* ── The doc registry (everything live under docs/) ────────────────── */

export interface SystemDoc {
  title: string;
  relPath: string; // e.g. "strategy/Product Vision.md"
  dir: string; // top-level bucket, e.g. "strategy", "features", "" for root
  status: string | null;
  tier: Tier | null;
  category: string | null;
  lastReviewed: string | null;
  readWhen: string | null;
  featureStatus: string | null;
  featureKind: string | null; // product | demo
  area: string | null; // funnel area: community | trust | care | shelter | identity
  summary: string | null; // one-line thesis from frontmatter
  routes: string[];
  /** Days past its tier's staleness heuristic; null when fresh or exempt. */
  staleDays: number | null;
}

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith(".") || entry.name === "archive") continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    // README.md files are folder guides (navigation scaffolding), not parsed
    // registry docs — skip them so they don't need doc frontmatter.
    else if (entry.name.endsWith(".md") && !entry.name.startsWith("_") && entry.name !== "README.md")
      out.push(full);
  }
  return out;
}

export function getAllDocs(): SystemDoc[] {
  const limits = staleLimits();
  return walk(DOCS_DIR)
    .map((full) => {
      const relPath = path.relative(DOCS_DIR, full);
      const { fm, body } = parseFrontmatter(fs.readFileSync(full, "utf-8"));
      const tier = (["bedrock", "commitments", "working", "surface"].includes(fm.tier ?? "")
        ? fm.tier
        : null) as Tier | null;
      const lastReviewed = fm["last-reviewed"] ?? null;
      const limit = tier ? limits[tier] ?? null : null;
      const age = daysSince(lastReviewed);
      const staleDays = limit !== null && age !== null && age > limit ? age - limit : null;
      return {
        title: stripMd(firstHeading(body) ?? path.basename(relPath, ".md")),
        relPath,
        dir: relPath.includes(path.sep) ? relPath.split(path.sep)[0] : "",
        status: fm.status ?? null,
        tier,
        category: fm.category ?? null,
        lastReviewed,
        readWhen: fm["read-when"] ?? null,
        featureStatus: fm["feature-status"] ?? null,
        featureKind: fm["feature-kind"] ?? null,
        area: fm.area ?? null,
        summary: fm.summary ?? null,
        routes: fm.routes ? fm.routes.split(",").map((r) => r.trim()) : [],
        staleDays,
      };
    })
    .sort((a, b) => a.relPath.localeCompare(b.relPath));
}

/** Every .md path under docs/ including the archive — used to prerender the
 *  doc detail pages so no fs read happens at request time. */
export function getAllDocPaths(): string[] {
  const out: string[] = [];
  const walkAll = (dir: string) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.name.startsWith(".")) continue;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walkAll(full);
      else if (entry.name.endsWith(".md")) out.push(path.relative(DOCS_DIR, full));
    }
  };
  walkAll(DOCS_DIR);
  return out;
}

/* ── The system, parsed from CONTRIBUTING.md ──────────────────────────
   Method renders these — the rules ARE the page, not a link to a wall of
   text. Derived, never authored: change CONTRIBUTING, the page follows. */

/** The system's terms, parsed from CONTRIBUTING.md § Glossary. */
export interface GlossaryTerm {
  term: string;
  def: string;
}

export function getGlossary(): GlossaryTerm[] {
  const parsed = readDoc("CONTRIBUTING.md");
  if (!parsed) return [];
  const section = sectionOf(parsed.body, "Glossary");
  const terms: GlossaryTerm[] = [];
  const re = /^- \*\*(.+?)\*\* — (.+)$/gm;
  let m;
  while ((m = re.exec(section))) terms.push({ term: m[1], def: stripMd(m[2]) });
  return terms;
}

export interface WorkMode {
  num: number;
  key: BoardMode;
  label: string; // "Product"
  tagline: string; // "building the product"
  purpose: string; // markdown kept — render with MdInline
  /** The three touch bands — they gate pens, not eyes (reading is never gated). */
  homeGround: string; // edit freely, per the board
  careful: string; // update deliberately when the work bears on it
  gated: string; // another mode's ground — suggest, don't edit
  open: string[];
  during: string;
  close: string[];
}

export interface WorkModel {
  lede: string;
  sharedRules: string[];
  modes: WorkMode[];
}

/** Numbered list items directly under a `**Label:**` heading line. */
function numberedUnder(body: string, label: string): string[] {
  const start = body.search(new RegExp(`^\\*\\*${label}:\\*\\*\\s*$`, "m"));
  if (start === -1) return [];
  const rest = body.slice(start);
  const block = rest.slice(rest.indexOf("\n") + 1).split(/\n\n(?=\*\*)/)[0];
  return (block.match(/^\d+\.\s+.*$/gm) ?? []).map((l) => l.replace(/^\d+\.\s+/, "").trim());
}

const MODE_KEYS: Record<number, BoardMode> = { 1: "product", 2: "system", 3: "side" };

export function getWorkModel(): WorkModel {
  const parsed = readDoc("CONTRIBUTING.md");
  if (!parsed) return { lede: "", sharedRules: [], modes: [] };
  const section = sectionOf(parsed.body, "The Work Model — every phase runs in one of three modes");
  const lede = section.trim().split("\n\n")[0] ?? "";
  const sharedBlock = section.split(/\*\*Rules shared by all modes:\*\*/)[1]?.split(/^### /m)[0] ?? "";
  const sharedRules = (sharedBlock.match(/^- .*$/gm) ?? []).map((b) => b.slice(2).trim());

  const modes: WorkMode[] = [];
  for (const block of section.split(/^### /m).slice(1)) {
    const header = block.slice(0, block.indexOf("\n"));
    const hm = header.match(/^Mode (\d+) · (.+?) — (.+)$/);
    if (!hm) continue;
    const body = block.slice(block.indexOf("\n") + 1);
    const num = Number(hm[1]);
    modes.push({
      num,
      key: MODE_KEYS[num] ?? "product",
      label: hm[2].trim(),
      tagline: hm[3].trim(),
      purpose: boldField(body, "Purpose"),
      homeGround: boldField(body, "Home ground"),
      careful: boldField(body, "Careful"),
      gated: boldField(body, "Gated"),
      open: numberedUnder(body, "Opening ritual"),
      during: boldField(body, "During"),
      close: numberedUnder(body, "Closing ritual"),
    });
  }
  return { lede, sharedRules, modes };
}

export interface TrackerRow {
  name: string;
  holds: string;
  unit: string;
  exit: string;
}

export interface TrackerModel {
  lede: string;
  trackers: TrackerRow[];
  flow: string[];
  sharedRule: string;
}

/** CONTRIBUTING § The Planning Trackers — the table + the flow bullets. */
export function getTrackerModel(): TrackerModel {
  const parsed = readDoc("CONTRIBUTING.md");
  if (!parsed) return { lede: "", trackers: [], flow: [], sharedRule: "" };
  const section = sectionOf(parsed.body, "The Planning Trackers");
  const lede = section.trim().split("\n\n")[0] ?? "";
  const trackers: TrackerRow[] = [];
  const re = /^\| `?([\w .&'-]+?)\.md`? \| (.*?) \| (.*?) \| (.*?) \|\s*$/gm;
  let m;
  while ((m = re.exec(section))) {
    trackers.push({ name: m[1].trim(), holds: m[2].trim(), unit: m[3].trim(), exit: m[4].trim() });
  }
  const flowBlock = section.split(/\*\*How work flows[^*]*\*\*/)[1]?.split(/\*\*Shared rule/)[0] ?? "";
  const flow = (flowBlock.match(/^- .*$/gm) ?? []).map((b) => b.slice(2).trim());
  const sharedRule = section.match(/\*\*Shared rule — prune on resolve\.\*\*\s*([\s\S]*?)(?=\n\n|$)/)?.[1].trim() ?? "";
  return { lede, trackers, flow, sharedRule };
}

export interface TierRow {
  key: Tier;
  label: string;
  lives: string; // markdown kept
  toChange: string;
  recheck: string;
  staleAfterDays: number | null;
}

/** CONTRIBUTING § Doc Tiers & Review Physics — the tier table, in the order
 *  the table lists them (most-guarded first). The `Stale after` cell is the
 *  one number staleness computes from: the doc IS the threshold, so a table
 *  edit moves the flags in the same commit. */
export function getTiers(): TierRow[] {
  const parsed = readDoc("CONTRIBUTING.md");
  if (!parsed) return [];
  const section = sectionOf(parsed.body, "Doc Tiers & Review Physics");
  const rows: TierRow[] = [];
  const re = /^\| \*\*(\w+)\*\* \| (.*?) \| (.*?) \| (.*?) \| (.*?) \|\s*$/gm;
  let m;
  while ((m = re.exec(section))) {
    const key = m[1] as Tier;
    if (!TIER_ORDER.includes(key)) continue; // skips the header + divider rows
    rows.push({
      key,
      label: TIER_META[key].label,
      lives: m[2].trim(),
      toChange: m[3].trim(),
      recheck: m[4].trim(),
      staleAfterDays: Number(m[5].match(/(\d+)\s*days?/)?.[1]) || null,
    });
  }
  return rows;
}

/** Stale thresholds by tier, from the same table the Tiers page renders. */
function staleLimits(): Partial<Record<Tier, number | null>> {
  return Object.fromEntries(getTiers().map((t) => [t.key, t.staleAfterDays]));
}

export interface TierPhysics {
  readIsNotReview: string;
  stamping: string;
  noBedrockClock: string;
  sinking: string;
  challenge: string;
  antiStuck: string;
}

/** CONTRIBUTING § Doc Tiers & Review Physics — the prose beside the table. */
export function getTierPhysics(): TierPhysics {
  const empty = { readIsNotReview: "", stamping: "", noBedrockClock: "", sinking: "", challenge: "", antiStuck: "" };
  const parsed = readDoc("CONTRIBUTING.md");
  if (!parsed) return empty;
  const section = sectionOf(parsed.body, "Doc Tiers & Review Physics");
  const field = (label: string) =>
    section.match(new RegExp(`\\*\\*${label}[^*]*\\*\\*\\s*([\\s\\S]*?)(?=\\n\\n|$)`))?.[1].trim() ?? "";
  return {
    readIsNotReview: field("Read is not review"),
    stamping: field("Stamping"),
    noBedrockClock: field("No clock on bedrock"),
    sinking: field("Sinking"),
    challenge: field("Structured challenge"),
    antiStuck: section.match(/^Tiers govern.*$/m)?.[0] ?? "",
  };
}

/** Reads any doc under docs/ (archive included) — used by the doc detail page.
 *  CLAUDE.md is the one special case outside docs/ (repo root). */
export function getDocByPath(relPath: string): { doc: SystemDoc; body: string } | null {
  const full =
    relPath === "CLAUDE.md"
      ? path.join(process.cwd(), "CLAUDE.md")
      : path.normalize(path.join(DOCS_DIR, relPath));
  if (relPath !== "CLAUDE.md" && (!full.startsWith(DOCS_DIR + path.sep) || !full.endsWith(".md"))) return null;
  if (!fs.existsSync(full)) return null;
  const { fm, body } = parseFrontmatter(fs.readFileSync(full, "utf-8"));
  const rel = relPath === "CLAUDE.md" ? "CLAUDE.md" : path.relative(DOCS_DIR, full);
  const tier = (["bedrock", "commitments", "working", "surface"].includes(fm.tier ?? "")
    ? fm.tier
    : null) as Tier | null;
  return {
    doc: {
      title: stripMd(firstHeading(body) ?? path.basename(rel, ".md")),
      relPath: rel,
      dir: rel.includes(path.sep) ? rel.split(path.sep)[0] : "",
      status: fm.status ?? null,
      tier,
      category: fm.category ?? null,
      lastReviewed: fm["last-reviewed"] ?? null,
      readWhen: fm["read-when"] ?? null,
      featureStatus: fm["feature-status"] ?? null,
      featureKind: fm["feature-kind"] ?? null,
      area: fm.area ?? null,
      summary: fm.summary ?? null,
      routes: fm.routes ? fm.routes.split(",").map((r) => r.trim()) : [],
      staleDays: null,
    },
    body,
  };
}

/* ── Open Questions (planning/Open Questions & Assumptions Log.md) ──
   `## N. Topic` sections, each holding `### The question?` entries with
   `**Area:** … **Opened:** … **Priority:** …` / `**Thinking:**` /
   `**Resolves when:**`.

   Everything in the file is open — resolved questions are deleted, not
   marked. So the parser can't miscount: no "Open:" marker to find, no
   Resolved block to accidentally read as open (both of which it did before
   2026-07-17), and no nested bullets to silently drop. */

export interface OpenQuestion {
  question: string;
  area: string | null;
  opened: string | null;
  priority: string | null;
  thinking: string; // markdown kept
  resolvesWhen: string;
}

export interface OpenQuestionTopic {
  num: number;
  title: string;
  assumption: string | null;
  questions: OpenQuestion[];
}

const QUESTIONS_PATH = "planning/Open Questions & Assumptions Log.md";

export function getOpenQuestions(): OpenQuestionTopic[] {
  const parsed = readDoc(QUESTIONS_PATH);
  if (!parsed) return [];
  // Drop the preamble (everything before the first topic's ---).
  const topics: OpenQuestionTopic[] = [];
  for (const section of parsed.body.split(/^## /m).slice(1)) {
    const header = section.slice(0, section.indexOf("\n"));
    const m = header.match(/^(\d+)\.\s+(.*)$/);
    if (!m) continue; // skips "Format" and other non-topic headings
    const body = section.slice(section.indexOf("\n") + 1);
    const assumption = boldField(body, "Assumption");
    const questions: OpenQuestion[] = [];
    for (const q of body.split(/^### /m).slice(1)) {
      const qTitle = q.slice(0, q.indexOf("\n")).trim();
      const qBody = q.slice(q.indexOf("\n") + 1);
      const meta = (label: string) =>
        qBody.match(new RegExp(`\\*\\*${label}:\\*\\*\\s*([^·\\n]+)`))?.[1].trim() ?? null;
      questions.push({
        question: qTitle,
        area: meta("Area"),
        opened: meta("Opened"),
        priority: meta("Priority"),
        thinking: boldField(qBody, "Thinking"),
        resolvesWhen: boldField(qBody, "Resolves when"),
      });
    }
    topics.push({
      num: Number(m[1]),
      title: m[2].trim(),
      assumption: assumption ? stripMd(assumption) : null,
      questions,
    });
  }
  return topics;
}

/* ── Punch list (planning/punch-list.md) ─────────────────────────────
   A single `| P## | description | category | area | refs | added |` table. */

export interface PunchItem {
  id: string;
  description: string; // markdown kept — render with MdInline/stripMd
  category: string;
  area: string;
  refs: string;
  added: string;
}

export function getPunchItems(): PunchItem[] {
  const parsed = readDoc("planning/punch-list.md");
  if (!parsed) return [];
  const items: PunchItem[] = [];
  const re = /^\| (P\d+\w*) \| (.*?) \| (.*?) \| (.*?) \| (.*?) \| (.*?) \|\s*$/gm;
  let m;
  while ((m = re.exec(parsed.body))) {
    items.push({ id: m[1], description: m[2], category: m[3], area: m[4], refs: m[5], added: m[6] });
  }
  return items;
}

/* ── Future considerations (planning/Future Considerations.md) ───────
   `## FCn. Title` sections with bold `**Trigger:** / **Context:** /
   **Effort:** / **Refs:** / **Added:**` fields. */

export interface FutureItem {
  id: string; // "FC17"
  num: number;
  title: string;
  trigger: string;
  context: string; // first paragraph only
  effort: string;
  added: string;
}

function boldField(body: string, label: string): string {
  // `**Label:** text…` to the end of its paragraph — or to the next bold
  // label on a new line, since consecutive fields aren't blank-separated.
  const re = new RegExp(`\\*\\*${label}:\\*\\*\\s*([\\s\\S]*?)(?=\\n\\*\\*|\\n\\n|$)`);
  return body.match(re)?.[1].trim() ?? "";
}

export function getFutureItems(): FutureItem[] {
  const parsed = readDoc("planning/Future Considerations.md");
  if (!parsed) return [];
  const items: FutureItem[] = [];
  const sections = parsed.body.split(/^## /m).slice(1);
  for (const section of sections) {
    const header = section.slice(0, section.indexOf("\n"));
    const m = header.match(/^FC(\d+)\.\s+(.*)$/);
    if (!m) continue;
    const bodyText = section.slice(section.indexOf("\n") + 1);
    items.push({
      id: `FC${m[1]}`,
      num: Number(m[1]),
      title: m[2].trim(),
      trigger: stripMd(boldField(bodyText, "Trigger")),
      context: stripMd(boldField(bodyText, "Context").split("\n\n")[0] ?? ""),
      effort: stripMd(boldField(bodyText, "Effort")),
      added: stripMd(boldField(bodyText, "Added")),
    });
  }
  return items.sort((a, b) => a.num - b.num);
}

/* ── Roadmap (ROADMAP.md) ────────────────────────────────────────────
   Sections: Principles / Where We Are / What's Next (phase table) /
   Key Considerations / Beyond the Demo. */

export interface RoadmapPhase {
  name: string;
  phaseStatus: string; // "queued", "paused — …"
  goal: string; // markdown kept
  refs: string;
}

export interface KeyConsideration {
  title: string;
  text: string;
}

export interface Roadmap {
  goal: string;
  whereWeAre: string[]; // markdown paragraphs
  phases: RoadmapPhase[];
  validationHorizon: string;
  runningAlongside: string[];
  keyConsiderations: KeyConsideration[];
  beyondDemo: string[];
}

function sectionOf(body: string, heading: string): string {
  const re = new RegExp(`^## ${heading}\\s*$`, "m");
  const m = re.exec(body);
  if (!m) return "";
  const rest = body.slice(m.index + m[0].length);
  const next = rest.search(/^## /m);
  return next === -1 ? rest : rest.slice(0, next);
}

export function getRoadmap(): Roadmap {
  const parsed = readDoc("ROADMAP.md");
  const body = parsed?.body ?? "";
  const goal = body.match(/^\*\*Goal:\*\*\s*(.+)$/m)?.[1] ?? "";

  const where = sectionOf(body, "Where We Are")
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter((p) => p && !p.startsWith("---"));

  const nextSection = sectionOf(body, "What's Next");
  const phases: RoadmapPhase[] = [];
  const rowRe = /^\| (.*?) \| (.*?) \| (.*?) \|\s*$/gm;
  let m;
  while ((m = rowRe.exec(nextSection))) {
    if (m[1].startsWith("Phase") || m[1].startsWith("---") || /^-+$/.test(m[1])) continue;
    const cell = m[1];
    const name = cell.match(/\*\*(.+?)\*\*/)?.[1] ?? stripMd(cell);
    // Status appears as `**Name** — *queued*` or `**Name** *(paused — …)*`.
    const status = cell.match(/—\s*\*([^*]+)\*/)?.[1] ?? cell.match(/\*\(([^)]+)\)\*/)?.[1] ?? "";
    phases.push({ name: stripMd(name), phaseStatus: status.trim(), goal: m[2], refs: stripMd(m[3]) });
  }

  const validationHorizon = nextSection.match(/\*\*The validation horizon\.\*\*\s*([\s\S]*?)(?=\n\n)/)?.[1] ?? "";

  const runningBlock = nextSection.split(/\*\*Running alongside[^*]*\*\*/)[1] ?? "";
  const runningAlongside = (runningBlock.match(/^- .*$/gm) ?? []).map((b) => b.slice(2).trim());

  const considerations: KeyConsideration[] = [];
  for (const p of sectionOf(body, "Key Considerations").split(/\n\n+/)) {
    const cm = p.trim().match(/^\*\*(.+?)\*\*\s*([\s\S]*)$/);
    if (cm) considerations.push({ title: cm[1].replace(/\.$/, ""), text: cm[2].trim() });
  }

  const beyondDemo = (sectionOf(body, "Beyond the Demo").match(/^- .*$/gm) ?? []).map((b) =>
    stripMd(b.slice(2))
  );

  return { goal, whereWeAre: where, phases, validationHorizon, runningAlongside, keyConsiderations: considerations, beyondDemo };
}

/* ── Seeds (planning/queued/*.md) ────────────────────────────────────
   One seed per queued ROADMAP row, any mode — the accumulation space
   between "queued" and "board opens" (notes and pointers, never tasks).
   The frontmatter + first paragraph feed the roadmap cards; the full seed
   renders through the doc reader. Deleted at phase open. */

export interface QueuedSeed {
  relPath: string; // "planning/queued/performance-speed-pass.md"
  phase: string; // must match the ROADMAP row name exactly
  mode: BoardMode; // badges the roadmap card
  queued: string | null;
  priority: string | null;
  /** First body paragraph — the card's condensed description. */
  lede: string;
  noteCount: number;
}

export function getQueuedSeeds(): QueuedSeed[] {
  const dir = path.join(DOCS_DIR, "planning", "queued");
  if (!fs.existsSync(dir)) return [];
  const seeds: QueuedSeed[] = [];
  for (const f of fs.readdirSync(dir)) {
    if (!f.endsWith(".md") || f.startsWith("_")) continue;
    const parsed = readDoc(path.join("planning", "queued", f));
    if (!parsed) continue;
    const paragraphs = parsed.body
      .replace(/^# .*$/m, "")
      .split(/\n\n+/)
      .map((p) => p.trim())
      .filter((p) => p && !p.startsWith("#"));
    const notes = sectionOf(parsed.body, "Notes & finds");
    seeds.push({
      relPath: path.join("planning", "queued", f),
      phase: parsed.fm.phase ?? f.replace(/\.md$/, ""),
      mode: resolveMode(parsed.fm.mode),
      queued: parsed.fm.queued ?? null,
      priority: parsed.fm.priority ?? null,
      lede: paragraphs[0] ?? "",
      noteCount: (notes.match(/^- /gm) ?? []).length,
    });
  }
  return seeds;
}

/* ── Decisions log (decisions.md) ────────────────────────────────────
   `## YYYY-MM-DD · Title` entries (date prefix may be a range) with
   `**What:** / **Why:** / **Where:**` fields. */

export interface Decision {
  date: string;
  title: string;
  what: string;
  why: string;
  where: string;
}

export function getDecisions(): Decision[] {
  const parsed = readDoc("decisions.md");
  if (!parsed) return [];
  const entriesBlock = parsed.body.split(/^## Entries\s*$/m)[1] ?? parsed.body;
  const decisions: Decision[] = [];
  const sections = entriesBlock.split(/^## /m).slice(1);
  for (const section of sections) {
    const header = section.slice(0, section.indexOf("\n"));
    const hm = header.match(/^(.+?)\s+·\s+(.+)$/);
    if (!hm) continue;
    const bodyText = section.slice(section.indexOf("\n") + 1);
    const field = (label: string) =>
      bodyText.match(new RegExp(`\\*\\*${label}[^:]*:\\*\\*\\s*([\\s\\S]*?)(?=\\n\\*\\*|\\n\\n|$)`))?.[1].trim() ?? "";
    decisions.push({
      date: hm[1].trim(),
      title: hm[2].trim(),
      what: field("What"),
      why: field("Why"),
      where: field("Where"),
    });
  }
  return decisions;
}

/* ── Active phase (docs/phases/*.md, templates excluded) ─────────────
   No board = between phases. Heavy (product) boards use `## Workstream X —
   name` sections whose tasks are either Status-column table rows (the
   template's style) or legacy `- [ ]`/`- [x]` checkboxes; countWorkstreamTasks
   reads both. Light (system/side/kickoff) boards have no workstreams — their
   `## Items` checkboxes are counted directly, excluding the closing checklist
   (the same way a product board's Closing Checklist doesn't count toward
   build progress). Either way a board reports honest done/total. */

// Status-cell vocabulary in workstream task tables (| Task | … | Status |).
// `done` counts complete; open work counts toward the total; out-of-scope
// rows don't count at all. Normalized by lowercasing + stripping separators
// so "in_progress" / "in progress" / "in-progress" all match.
const TASK_STATUS_DONE = new Set(["done", "complete", "✅"]);
const TASK_STATUS_OPEN = new Set(["todo", "inprogress", "wip", "blocked"]);
const TASK_STATUS_EXCLUDED = new Set(["deferred", "cut", "wontdo", "na"]);

/** Count done/total across one `## Workstream` section body, reading both
 *  Status-column table rows and legacy checkbox tasks. */
function countWorkstreamTasks(section: string): { done: number; total: number } {
  let done = 0;
  let total = 0;

  // Legacy checkbox tasks.
  const boxDone = (section.match(/^\s*- \[x\]/gim) ?? []).length;
  const boxOpen = (section.match(/^\s*- \[ \]/gm) ?? []).length;
  done += boxDone;
  total += boxDone + boxOpen;

  // Table task rows — the Status cell is last. A row whose last cell isn't a
  // known status keyword (the header, the |---| separator, a non-task data
  // table) is silently skipped, so only real task rows count.
  for (const line of section.split("\n")) {
    const m = line.match(/^\s*\|(.+)\|\s*$/);
    if (!m) continue;
    const cells = m[1].split("|").map((c) => c.trim());
    const status = cells[cells.length - 1].toLowerCase().replace(/[\s_-]/g, "");
    if (TASK_STATUS_DONE.has(status)) {
      done++;
      total++;
    } else if (TASK_STATUS_OPEN.has(status)) {
      total++;
    }
    // header ("status"), separator ("---"), excluded, and non-task rows: skip.
  }

  return { done, total };
}

export interface Workstream {
  title: string;
  done: number;
  total: number;
}

export type BoardMode = "product" | "system" | "side";

/** Short labels for board badges. Everything else about a mode — purpose,
 *  touch bands, rituals — is parsed from CONTRIBUTING (see getWorkModel). */
export const MODE_META: Record<BoardMode, { label: string }> = {
  product: { label: "Product" },
  system: { label: "System" },
  side: { label: "Side" },
};

/** Frontmatter `mode:` → BoardMode. Boards/seeds written before 2026-07-20
 *  may carry the legacy value "phase", which reads as "product". */
function resolveMode(raw: string | undefined): BoardMode {
  return raw === "system" || raw === "side" ? raw : "product";
}

/**
 * The phase's own name, for surfaces that show a board in one line.
 *
 * A board's h1 carries mold scaffolding around the name, and each mold puts
 * the name somewhere different:
 *
 *   product  `# Checkout v1`
 *   system   `# System Work — Restructure the trackers (ACTIVE)`
 *   side     `# Sweep — P87 · P88 — opened 2026-07-28`
 *
 * So strip the scaffolding. Splitting on the first em dash instead reads the
 * mold's prefix as the name on every system board.
 */
export function boardName(title: string): string {
  return title
    .replace(/\s*\((?:ACTIVE|PAUSED)\)\s*$/i, "")
    .replace(/\s+—\s+opened\s+\d{4}-\d{2}-\d{2}\s*$/i, "")
    .replace(/^System Work\s+—\s+/i, "")
    .trim();
}

export interface ActivePhase {
  slug: string;
  title: string;
  mode: BoardMode;
  workstreams: Workstream[];
  done: number;
  total: number;
  hasWalkthrough: boolean;
  /** The board in full — Work renders it here; it isn't a doc-page pointer. */
  body: string;
}

/** All open boards — at most one per mode (Work Model concurrency rule).
 *  Product phase sorts first. Empty array = fully between boards. */
export function getActiveBoards(): ActivePhase[] {
  const dir = path.join(DOCS_DIR, "phases");
  if (!fs.existsSync(dir)) return [];
  const files = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md") && !f.startsWith("_") && !f.endsWith("-walkthrough.md"));
  const boards: ActivePhase[] = [];
  for (const file of files) {
    const parsed = parseFrontmatter(fs.readFileSync(path.join(dir, file), "utf-8"));
    const workstreams: Workstream[] = [];
    for (const section of parsed.body.split(/^## /m).slice(1)) {
      const header = section.slice(0, section.indexOf("\n")).trim();
      if (!/^Workstream/i.test(header)) continue;
      const { done, total } = countWorkstreamTasks(section);
      workstreams.push({ title: header, done, total });
    }
    let done = workstreams.reduce((n, w) => n + w.done, 0);
    let total = workstreams.reduce((n, w) => n + w.total, 0);
    // Light board (no workstreams): count its `## Items` checkboxes directly,
    // skipping the closing checklist (`## Close…`) so progress reflects the
    // work, not the close ritual — mirrors heavy boards, whose Closing
    // Checklist doesn't count either.
    if (workstreams.length === 0) {
      for (const section of parsed.body.split(/^## /m).slice(1)) {
        const header = section.slice(0, section.indexOf("\n")).trim();
        if (/^clos/i.test(header)) continue;
        const c = countWorkstreamTasks(section);
        done += c.done;
        total += c.total;
      }
    }
    const slug = file.replace(/\.md$/, "");
    const mode: BoardMode = resolveMode(parsed.fm.mode);
    boards.push({
      slug,
      title: stripMd(firstHeading(parsed.body) ?? slug),
      mode,
      workstreams,
      done,
      total,
      hasWalkthrough: fs.existsSync(path.join(dir, `${slug}-walkthrough.md`)),
      body: parsed.body,
    });
  }
  return boards.sort((a, b) => (a.mode === "product" ? -1 : 0) - (b.mode === "product" ? -1 : 0));
}

/* ── Shipped timeline (docs/archive/phases/*.md) ─────────────────────
   Modern boards open with a close-banner blockquote summarizing what
   shipped; walkthrough siblings are skipped. Sorted newest first by
   last-reviewed (the close sweep bumps it). */

export interface ArchivedPhase {
  slug: string;
  title: string;
  banner: string | null; // markdown kept
  lastReviewed: string | null;
  hasWalkthrough: boolean;
}

export function getArchivedPhases(): ArchivedPhase[] {
  const dir = path.join(DOCS_DIR, "archive", "phases");
  if (!fs.existsSync(dir)) return [];
  const files = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md") && !f.startsWith("_") && f !== "README.md");
  const walkthroughs = new Set(files.filter((f) => f.endsWith("-walkthrough.md")));
  const phases: ArchivedPhase[] = [];
  for (const file of files) {
    if (walkthroughs.has(file)) continue;
    const { fm, body } = parseFrontmatter(fs.readFileSync(path.join(dir, file), "utf-8"));
    const afterTitle = body.slice(body.search(/^# /m));
    const bannerLines: string[] = [];
    for (const line of afterTitle.split("\n").slice(1)) {
      if (line.startsWith(">")) bannerLines.push(line.replace(/^>\s?/, ""));
      else if (bannerLines.length > 0) break;
      else if (line.trim() !== "") break;
    }
    const slug = file.replace(/\.md$/, "");
    phases.push({
      slug,
      title: stripMd(firstHeading(body) ?? slug),
      banner: bannerLines.length ? bannerLines.join(" ").trim() : null,
      lastReviewed: fm["last-reviewed"] ?? null,
      hasWalkthrough: walkthroughs.has(`${slug}-walkthrough.md`),
    });
  }
  return phases.sort((a, b) => (b.lastReviewed ?? "").localeCompare(a.lastReviewed ?? ""));
}
