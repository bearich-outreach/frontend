"use client";

import { useEffect, useState } from "react";
import { MoonIcon, SunIcon } from "@radix-ui/react-icons";

export function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  }

  if (compact) {
    return (
      <button
        onClick={toggle}
        className="flex items-center justify-center size-9 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/70 transition-colors"
        aria-label="Toggle tema"
      >
        {dark ? <SunIcon /> : <MoonIcon />}
      </button>
    );
  }

  return (
    <button
      onClick={toggle}
      className="flex w-full items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-zinc-400 hover:text-white hover:bg-zinc-800/70 transition-colors"
      aria-label="Toggle tema"
    >
      {dark ? <SunIcon /> : <MoonIcon />}
      {dark ? "Mode terang" : "Mode gelap"}
    </button>
  );
}