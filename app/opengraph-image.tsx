import { ImageResponse } from "next/og";
import { PROJECT_NAME, PROJECT_DESCRIPTION } from "@/lib/project";

/**
 * Link-preview image, generated at build from lib/project.ts — so it always
 * shows the CURRENT project name instead of going stale like a hand-exported
 * PNG. Generated rather than hand-exported is worth keeping through any
 * redesign: a card that reads its own source cannot go stale.
 *
 * The starter card is a plain name-and-description layout carrying the starter
 * mark. The kickoff is where the mark becomes yours (KICKOFF.md → "Make the
 * identity yours"); whether this CARD should show something of the product
 * rather than describe it is a separate design call, and a better one to make
 * once you have a product to show.
 *
 * Colours are literals, not tokens: this renders through Satori, outside the
 * CSS pipeline, so it can't read globals.css custom properties.
 */

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = PROJECT_NAME;

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          background: "#f1f3f5",
          padding: "80px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
          {/* The mark is drawn as SVG rather than as a text glyph: Satori would
              try to fetch a font over the network for that character at build
              time, which fails offline and in CI. Shapes need no font.

              Same path data as components/ui/Mark.tsx and app/icon.svg — three
              renderers, one shape. The brand colour is a literal because Satori
              has no CSS, so no custom property resolves here. The centre needs
              no colour at all: tile and diamond are one path with fillRule
              evenodd, so the cutout is real and this card's background shows
              through it. */}
          <svg width="72" height="72" viewBox="0 0 32 32">
            <path
              d="M7 0H25A7 7 0 0 1 32 7V25A7 7 0 0 1 25 32H7A7 7 0 0 1 0 25V7A7 7 0 0 1 7 0Z M16 7.5L24.5 16L16 24.5L7.5 16Z"
              fillRule="evenodd"
              fill="#4338ca"
            />
          </svg>
          <div style={{ fontSize: "64px", fontWeight: 700, color: "#21262e" }}>{PROJECT_NAME}</div>
        </div>
        <div style={{ marginTop: "28px", fontSize: "30px", color: "#8892a0", maxWidth: "900px" }}>
          {PROJECT_DESCRIPTION}
        </div>
      </div>
    ),
    size
  );
}
