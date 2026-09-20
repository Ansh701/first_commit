"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem("insips-theme") as
        | "light"
        | "dark"
        | null;
      const domTheme = document.documentElement.dataset.theme as
        | "light"
        | "dark"
        | undefined;
      const next = stored ?? domTheme ?? "light";
      setTheme(next);
      document.documentElement.dataset.theme = next;
    } catch {
      const next = document.documentElement.dataset.theme === "dark" ? "dark" : "light";
      setTheme(next);
    }
  }, []);

  function toggle() {
    const current = document.documentElement.dataset.theme === "dark" ? "dark" : "light";
    const next = current === "light" ? "dark" : "light";
    setTheme(next);
    try {
      window.localStorage.setItem("insips-theme", next);
    } catch {
      // Theme remains active for the current session when storage is unavailable.
    }
    document.documentElement.dataset.theme = next;
  }

  return (
    <button
      className="icon-button"
      onClick={toggle}
      type="button"
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} theme`}
    >
      {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
    </button>
  );
}
