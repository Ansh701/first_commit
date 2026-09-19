"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const stored = window.localStorage.getItem("insips-theme") as
      | "light"
      | "dark"
      | null;
    const workspaceRoute = /^\/(app|review|csr)(\/|$)/.test(
      window.location.pathname,
    );
    const next = stored ?? (workspaceRoute ? "dark" : "light");
    setTheme(next);
    document.documentElement.dataset.theme = next;
  }, []);

  function toggle() {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    window.localStorage.setItem("insips-theme", next);
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
