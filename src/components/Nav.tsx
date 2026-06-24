"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const nav = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/colaboradores", label: "Colaboradores" },
  { href: "/processos", label: "Processos" },
  { href: "/grafo", label: "Mapa" },
  { href: "/simulacao", label: "Simulação" },
  { href: "/reconciliacao", label: "Reconciliação" },
  { href: "/analise", label: "Análise IA" },
];

export function Nav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Navegação principal" className="flex gap-1 text-sm font-medium">
      {nav.map((item) => {
        const ativo = pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={ativo ? "page" : undefined}
            className={`rounded-lg px-3 py-2 transition-colors ${
              ativo
                ? "bg-brand-light text-brand"
                : "text-muted hover:bg-subtle hover:text-ink"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
