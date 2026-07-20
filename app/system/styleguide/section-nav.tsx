"use client";

import { usePathname, useRouter } from "next/navigation";
import { PillToggle } from "@/components/ui/PillToggle";

/**
 * The styleguide's four sections, switched from the page body — not the
 * chrome. Pills (the shared PillToggle), not a TabBar: this switcher sits a
 * layer below the chrome's subtabs, and an underline row here read as a
 * third tab bar of the same kind. Pills keep the depth legible.
 *
 * Sections are real routes, so each is deep-linkable and prerendered.
 */

const SECTIONS = [
  { value: "/system/styleguide", label: "Colors" },
  { value: "/system/styleguide/typography", label: "Typography" },
  { value: "/system/styleguide/layout", label: "Layout" },
  { value: "/system/styleguide/components", label: "Components" },
];

export function StyleguideSectionNav() {
  const pathname = usePathname() ?? SECTIONS[0].value;
  const router = useRouter();
  const active =
    SECTIONS.find((s) => (s.value === SECTIONS[0].value ? pathname === s.value : pathname.startsWith(s.value)))
      ?.value ?? SECTIONS[0].value;

  return (
    <PillToggle
      options={SECTIONS}
      selected={active}
      onToggle={(value) => value !== active && router.push(value)}
      ariaLabel="Styleguide section"
    />
  );
}
