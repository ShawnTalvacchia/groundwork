import { NextResponse, type NextRequest } from "next/server";

/**
 * The /system gate — the two-audience rule enforced in code.
 *
 * A Groundwork project has two audiences: the product (public, indexed) and
 * the record (strategy, decisions, open questions, boards). `/system` is the
 * record. `robots: noindex` keeps it out of search results; it is NOT access
 * control, so this gate is what actually keeps it private.
 *
 * Four states, by environment:
 *
 *   development                  → open, always. Zero setup.
 *   SYSTEM_GATE=off              → open, explicitly. The choice is on the record.
 *   SYSTEM_PASSWORD=<secret>     → password form, then an HttpOnly cookie.
 *   production, neither set      → BLOCKED, with a page naming both vars.
 *
 * The last one is the point: public-by-choice replaces public-by-forgetting.
 * A deploy that forgets to decide fails closed and says so, instead of quietly
 * publishing the strategy shelf.
 *
 * Alternatives (host password protection, an identity provider, a second
 * private deployment) and when to prefer them:
 * `docs/implementation/system-surface.md` → The gate.
 */

const COOKIE = "system-gate";

/** Constant-time-ish compare — avoids leaking the secret's length via timing. */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/** The cookie value is derived from the secret, so rotating the password
 *  invalidates every existing session without a session store. */
async function tokenFor(secret: string): Promise<string> {
  const data = new TextEncoder().encode(`groundwork-system-gate:${secret}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function page(title: string, body: string, status: number): NextResponse {
  return new NextResponse(
    `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex">
<title>${title}</title>
<style>
  :root { color-scheme: light dark; }
  body { margin:0; min-height:100vh; display:flex; align-items:center; justify-content:center;
         background:#f1f3f5; color:#21262e; font:16px/1.55 ui-sans-serif,system-ui,sans-serif; padding:24px; }
  main { max-width:34rem; width:100%; background:#fff; border:1px solid #e2e5e9;
         border-radius:12px; padding:28px 32px; }
  h1 { margin:0 0 4px; font-size:1.15rem; }
  p { margin:0 0 16px; color:#555f6d; font-size:.9rem; }
  code { background:#f1f3f5; border-radius:4px; padding:1px 5px; font-size:.85em; }
  form { display:flex; gap:8px; }
  input { flex:1; padding:9px 12px; border:1px solid #d5dae0; border-radius:8px; font-size:.9rem; }
  button { padding:9px 18px; border:0; border-radius:8px; background:#4338ca; color:#fff;
           font-weight:600; font-size:.9rem; cursor:pointer; }
  @media (prefers-color-scheme: dark) {
    body { background:#131519; color:#edeff2; }
    main { background:#1c1f24; border-color:#343941; }
    p { color:#9aa3af; } code { background:#24282e; }
    input { background:#131519; border-color:#343941; color:#edeff2; }
  }
</style></head><body><main>${body}</main></body></html>`,
    { status, headers: { "content-type": "text/html; charset=utf-8" } }
  );
}

export async function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  if (!pathname.startsWith("/system")) return NextResponse.next();

  // Dev is always open: the gate must never be setup friction locally.
  if (process.env.NODE_ENV !== "production") return NextResponse.next();

  if (process.env.SYSTEM_GATE === "off") return NextResponse.next();

  const secret = process.env.SYSTEM_PASSWORD;

  // Fail closed. A production deploy that set neither variable never decided,
  // and the safe reading of "didn't decide" is "don't publish the record."
  if (!secret) {
    return page(
      "System locked",
      `<h1>The record is locked</h1>
       <p>This deployment set neither <code>SYSTEM_PASSWORD</code> nor <code>SYSTEM_GATE</code>,
          so <code>/system</code> stays closed by default — it renders your strategy, decisions,
          and open questions.</p>
       <p>Set <code>SYSTEM_PASSWORD</code> to gate it behind a password, or
          <code>SYSTEM_GATE=off</code> to make it deliberately public. The product itself is
          unaffected either way.</p>`,
      503
    );
  }

  const expected = await tokenFor(secret);

  if (request.cookies.get(COOKIE)?.value === expected) return NextResponse.next();

  const attempt = searchParams.get("k");
  if (attempt && safeEqual(attempt, secret)) {
    // Redirect to the clean URL so the secret doesn't linger in history.
    const url = request.nextUrl.clone();
    url.searchParams.delete("k");
    const res = NextResponse.redirect(url);
    res.cookies.set(COOKIE, expected, {
      httpOnly: true,
      sameSite: "lax",
      secure: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
    return res;
  }

  return page(
    "System",
    `<h1>This project's record is private</h1>
     <p>${attempt ? "That password didn't match. " : ""}The product is public; these pages are the
        team's working record.</p>
     <form method="get"><input type="password" name="k" placeholder="Password" autofocus
       aria-label="Password"><button type="submit">Unlock</button></form>`,
    attempt ? 401 : 200
  );
}

export const config = {
  matcher: "/system/:path*",
};
