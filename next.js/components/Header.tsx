"use client";

import { useEffect, useRef, useState } from "react";
import { accentColors, bgThemes, AccentColor, BgTheme } from "@/lib/constants";
import { ThemeMode } from "@/hooks/useTheme";

export default function Header({
  dateText,
  view,
  onToggleView,
  notifsOn,
  onToggleNotifs,
  accent,
  bg,
  mode,
  setAccent,
  setBg,
  setMode,
}: {
  dateText: string;
  view: "list" | "kanban";
  onToggleView: () => void;
  notifsOn: boolean;
  onToggleNotifs: () => void;
  accent: AccentColor;
  bg: BgTheme;
  mode: ThemeMode;
  setAccent: (a: AccentColor) => void;
  setBg: (b: BgTheme) => void;
  setMode: (m: ThemeMode) => void;
}) {
  const [panelOpen, setPanelOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!panelOpen) return;
    const close = () => setPanelOpen(false);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [panelOpen]);

  return (
    <header>
      <div className="logo-row">
        <div className="logo">
          Trakr<span className="logo-dot" />
        </div>
      </div>
      <div className="sub-row">
        <span className="date-text">{dateText}</span>
        <div className="header-actions">
          <button className={`hdr-btn${view === "kanban" ? " active" : ""}`} onClick={onToggleView}>
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <rect x="1.5" y="1.5" width="4" height="13" rx="1" />
              <rect x="7.5" y="1.5" width="4" height="9" rx="1" />
              <rect x="13.5" y="1.5" width="1" height="6" rx="0.5" />
            </svg>
            <span>{view === "kanban" ? "List" : "Board"}</span>
          </button>
          <button className={`hdr-btn${notifsOn ? " active" : ""}`} onClick={onToggleNotifs}>
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M8 1.5C5.5 1.5 4 3.5 4 6c0 2-1 3-1.5 3.5h11C13 9 12 8 12 6c0-2.5-1.5-4.5-4-4.5z" />
              <path d="M6.5 12.5a1.5 1.5 0 003 0" />
            </svg>
            <span>{notifsOn ? "On" : "Alerts"}</span>
          </button>
          <div className="theme-panel-wrap" ref={wrapRef}>
            <button
              className="hdr-btn"
              onClick={(e) => {
                e.stopPropagation();
                setPanelOpen((o) => !o);
              }}
            >
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="8" cy="8" r="6" />
                <path d="M8 2v2M8 12v2M2 8h2M12 8h2M4.2 4.2l1.4 1.4M10.4 10.4l1.4 1.4M11.8 4.2l-1.4 1.4M5.6 10.4l-1.4 1.4" />
              </svg>
            </button>
            <div className={`theme-panel${panelOpen ? " open" : ""}`} onClick={(e) => e.stopPropagation()}>
              <div className="theme-panel-label">Accent Color</div>
              <div className="theme-swatches">
                {accentColors.map((c) => (
                  <div
                    key={c.value}
                    className={`swatch${c.value === accent.value ? " active" : ""}`}
                    style={{ background: c.value }}
                    title={c.name}
                    onClick={() => setAccent(c)}
                  />
                ))}
              </div>
              <div className="theme-panel-label">Background</div>
              <div className="theme-swatches">
                {bgThemes.map((b) => (
                  <div
                    key={b.swatch}
                    className={`swatch${b.swatch === bg.swatch ? " active" : ""}`}
                    style={{ background: b.swatch, border: "1px solid #ccc" }}
                    title={b.name}
                    onClick={() => setBg(b)}
                  />
                ))}
              </div>
              <div className="theme-panel-label">Appearance</div>
              <div className="theme-mode-row">
                {(["light", "auto", "dark"] as ThemeMode[]).map((m) => (
                  <button
                    key={m}
                    className={`theme-mode-btn${mode === m ? " active" : ""}`}
                    onClick={() => setMode(m)}
                  >
                    {m[0].toUpperCase() + m.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
