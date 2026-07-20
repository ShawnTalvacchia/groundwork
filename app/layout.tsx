import type { Metadata } from "next";
import "./globals.css";
import { ThemeWatcher } from "@/components/ui/ThemeWatcher";

/**
 * Set data-theme before first paint (no flash). Resolves the stored theme
 * *preference* (light / dark / system): `system` follows the OS
 * `prefers-color-scheme`; anything unset defaults to LIGHT. Mirrors
 * `resolveTheme` in `lib/theme.ts`; the live OS-follow (once System is picked)
 * is kept in sync by `<ThemeWatcher>`. Runs synchronously in <head>.
 */
const THEME_INIT = `(function(){try{var p=localStorage.getItem('theme-pref');if(p!=='dark'&&p!=='light'&&p!=='system'){p='light';}var t=p==='system'?(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'):p;document.documentElement.setAttribute('data-theme',t);}catch(e){document.documentElement.setAttribute('data-theme','light');}})();`;

export const metadata: Metadata = {
  title: "System Template",
  description: "A project-operating-system template with a derived /system dashboard.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT }} />
      </head>
      <body>
        {/* App-global: keeps the `system` theme preference following the OS live. */}
        <ThemeWatcher />
        {children}
      </body>
    </html>
  );
}
