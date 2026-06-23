"use client";

import { useEffect, useState } from "react";

const TEMAS: [string, string][] = [
  ["light", "Claro"],
  ["dark", "Escuro"],
  ["hc", "Alto contraste"],
];

export function ThemeToggle() {
  const [tema, setTema] = useState("light");

  useEffect(() => {
    setTema(document.documentElement.getAttribute("data-theme") || "light");
  }, []);

  const aplicar = (t: string) => {
    setTema(t);
    try {
      localStorage.setItem("tema", t);
    } catch {}
    document.documentElement.setAttribute("data-theme", t);
  };

  return (
    <label className="flex items-center gap-2 text-sm text-muted">
      <span className="sr-only">Tema de cores</span>
      <select
        aria-label="Tema de cores"
        value={tema}
        onChange={(e) => aplicar(e.target.value)}
        className="rounded-md border border-line bg-card px-2 py-1.5 text-sm text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand-light"
      >
        {TEMAS.map(([v, l]) => (
          <option key={v} value={v}>
            {l}
          </option>
        ))}
      </select>
    </label>
  );
}
