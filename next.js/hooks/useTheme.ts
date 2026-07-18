"use client";

import { useEffect, useState, useCallback } from "react";
import { accentColors, bgThemes, AccentColor, BgTheme } from "@/lib/constants";

export type ThemeMode = "light" | "dark" | "auto";

function safeParse<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const v = localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function useTheme() {
  const [accent, setAccentState] = useState<AccentColor>(accentColors[0]);
  const [bg, setBgState] = useState<BgTheme>(bgThemes[0]);
  const [mode, setModeState] = useState<ThemeMode>("light");
  const [isDark, setIsDark] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setAccentState(safeParse("trakr_theme", accentColors[0]));
    setBgState(safeParse("trakr_bg", bgThemes[0]));
    const storedDark = localStorage.getItem("trakr_dark");
    setModeState(storedDark === "dark" || storedDark === "light" || storedDark === "auto" ? (storedDark as ThemeMode) : "light");
    setHydrated(true);
  }, []);

  const resolveIsDark = useCallback((m: ThemeMode) => {
    if (m === "dark") return true;
    if (m === "light") return false;
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  }, []);

  const apply = useCallback(
    (a: AccentColor, b: BgTheme, m: ThemeMode) => {
      const dark = resolveIsDark(m);
      setIsDark(dark);
      const r = document.documentElement.style;
      r.setProperty("--accent", a.value);
      r.setProperty("--accent-hover", a.hover);
      const p = dark ? b.dark : b.light;
      r.setProperty("--bg", p.bg);
      r.setProperty("--bg-top", p.bg);
      r.setProperty("--card", p.card);
      r.setProperty("--border", p.border);
      r.setProperty("--done-bg", p.doneBg);
      r.setProperty("--done-text", p.doneTxt);
      r.setProperty("--input-bg", p.inputBg);
      r.setProperty("--text-muted", p.txtMuted);
      r.setProperty("--text", p.txt);
      document.documentElement.classList.toggle("dark", dark);
    },
    [resolveIsDark]
  );

  useEffect(() => {
    if (!hydrated) return;
    apply(accent, bg, mode);
    localStorage.setItem("trakr_theme", JSON.stringify(accent));
    localStorage.setItem("trakr_bg", JSON.stringify(bg));
    localStorage.setItem("trakr_dark", mode);
  }, [accent, bg, mode, hydrated, apply]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      if (mode === "auto") apply(accent, bg, mode);
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [mode, accent, bg, apply]);

  return {
    accent,
    bg,
    mode,
    isDark,
    setAccent: setAccentState,
    setBg: setBgState,
    setMode: setModeState,
  };
}
