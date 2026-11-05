import { useEffect, useState } from "react";

export type ThemePref = "light" | "dark" | "system";
export const THEME_KEY = "rms-theme";

/**
 * Runs inline in <head> before the page paints, so a dark-mode user never sees
 * a white flash. Keep it tiny and dependency-free.
 */
export const THEME_BOOT_SCRIPT = `(function(){try{var p=localStorage.getItem("${THEME_KEY}")||"light";var d=p==="dark"||(p==="system"&&matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.classList.toggle("dark",d);}catch(e){}})();`;

export function readThemePref(): ThemePref {
  try {
    const v = localStorage.getItem(THEME_KEY);
    return v === "dark" || v === "system" ? v : "light";
  } catch {
    return "light";
  }
}

export function resolveDark(pref: ThemePref, systemDark: boolean): boolean {
  return pref === "dark" || (pref === "system" && systemDark);
}

export function applyTheme(pref: ThemePref) {
  const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  document.documentElement.classList.toggle("dark", resolveDark(pref, systemDark));
}

/** Current preference + setter; follows the OS live when set to "system". */
export function useTheme() {
  const [pref, setPref] = useState<ThemePref>("light");
  useEffect(() => setPref(readThemePref()), []);
  useEffect(() => {
    applyTheme(pref);
    if (pref !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => applyTheme("system");
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [pref]);
  return {
    pref,
    setPref: (next: ThemePref) => {
      try {
        localStorage.setItem(THEME_KEY, next);
      } catch {
        /* private mode: still apply for this visit */
      }
      setPref(next);
    },
  };
}
