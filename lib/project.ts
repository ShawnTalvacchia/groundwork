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

/** Display name. Any casing/punctuation — it's rendered verbatim. */
export const PROJECT_NAME = "System Template";

/** One line, used as the metadata description and on the link preview. */
export const PROJECT_DESCRIPTION =
  "A project-operating-system template with a derived /system dashboard.";
