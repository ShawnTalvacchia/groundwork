import { redirect } from "next/navigation";

// The Tokens tab dissolved in the derivation rebuild (2026-07-17): its color
// half lives on Colors (semantic families), the rest became Layout.
export default function TokensRedirect() {
  redirect("/system/styleguide/layout");
}
