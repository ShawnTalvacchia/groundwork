import { ImageResponse } from "next/og";
import { PROJECT_NAME, PROJECT_DESCRIPTION } from "@/lib/project";

/**
 * Link-preview image, generated at build from lib/project.ts — so it always
 * shows the CURRENT project name instead of going stale like a hand-exported
 * PNG. Generic by design; replace with real artwork when the project has a
 * visual identity (see the punch list).
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
          {/* The mark is drawn as SVG, not the ◆ character: Satori would try to
              fetch a font over the network for that glyph at build time, which
              fails offline and in CI. Shapes need no font. */}
          <svg width="72" height="72" viewBox="0 0 32 32">
            <rect width="32" height="32" rx="7" fill="#4338ca" />
            <path d="M16 7.5 24.5 16 16 24.5 7.5 16Z" fill="#ffffff" />
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
