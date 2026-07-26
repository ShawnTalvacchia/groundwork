/**
 * Project identity — the one home for the project's public-facing name.
 *
 * Set these at kickoff. They feed, in one edit:
 *   - the browser tab / metadata title      (app/layout.tsx)
 *   - the /system header wordmark           (app/system/nav.tsx)
 *   - the generated link-preview image      (app/opengraph-image.tsx)
 *
 * Why a constant and not a parsed doc: the derived-never-authored law governs
 * the /system *content* pages, which render from `docs/`. Chrome and branding
 * aren't doc content, and parsing a display name out of prose would be fragile.
 * What still applies is "one home, many references" — so this is the home, and
 * nothing else hard-codes the name.
 */

/** Display name. Any casing/punctuation — it's rendered verbatim.
 *  Deliberately a placeholder, NOT "Groundwork": this value belongs to the
 *  project built from the template, and the kickoff's first job is to
 *  overwrite it. A value that looks unfinished is the point. */
export const PROJECT_NAME = "Your Project";

/** One line, used as the metadata description and on the link preview. */
export const PROJECT_DESCRIPTION =
  "Built with Groundwork — a work model, a doc shelf, and a dashboard derived from them.";
