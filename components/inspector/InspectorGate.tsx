"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import nextDynamic from "next/dynamic";

/**
 * The element inspector's entry gate — the only inspector code that ships on
 * a normal page load. Opt-in by constraint (phase board: opt-in, never
 * always-on): the mode activates when the URL carries `?inspect`, and until
 * then this renders nothing, holds no listeners, and the overlay bundle is
 * not downloaded. `next/dynamic` with `ssr: false` is what keeps the overlay
 * out of every page's JS until the flag appears.
 *
 * Exit strips the flag from the URL via history.replaceState — the Next
 * router never sees that write, so `flagged` goes stale-true until the next
 * real navigation. `exited` covers the gap: it wins over the stale flag, and
 * a fresh `?inspect` navigation resets it below.
 */

const InspectorOverlay = nextDynamic(
  () => import("./InspectorOverlay").then((m) => m.InspectorOverlay),
  { ssr: false }
);

function Gate() {
  const flagged = useSearchParams().has("inspect");
  const [exited, setExited] = useState(false);
  const [prevFlagged, setPrevFlagged] = useState(flagged);

  // Adjust-during-render (not an effect): a fresh ?inspect navigation clears
  // a previous exit, so the mode can be re-entered.
  if (flagged !== prevFlagged) {
    setPrevFlagged(flagged);
    if (flagged) setExited(false);
  }

  if (!flagged || exited) return null;

  return (
    <InspectorOverlay
      onExit={() => {
        const url = new URL(window.location.href);
        url.searchParams.delete("inspect");
        window.history.replaceState(null, "", url.toString());
        setExited(true);
      }}
    />
  );
}

export function InspectorGate() {
  // useSearchParams needs a Suspense boundary on statically rendered pages.
  return (
    <Suspense fallback={null}>
      <Gate />
    </Suspense>
  );
}
