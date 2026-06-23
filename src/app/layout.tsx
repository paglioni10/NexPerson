import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";
import "./globals.css";

const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope" });

export const metadata: Metadata = {
  title: "NexPerson — Mapa de Dependência Humana",
  description: "Transformando conhecimento em continuidade.",
};

const nav = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/colaboradores", label: "Colaboradores" },
  { href: "/processos", label: "Processos" },
  { href: "/grafo", label: "Mapa" },
  { href: "/simulacao", label: "Simulação" },
  { href: "/reconciliacao", label: "Reconciliação" },
];

// Aplica o tema salvo antes da primeira pintura (evita "flash" de tema errado).
const temaScript = `(function(){try{var t=localStorage.getItem('tema')||'light';document.documentElement.setAttribute('data-theme',t);}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={manrope.variable} data-theme="light" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: temaScript }} />
      </head>
      <body className="min-h-screen font-sans antialiased">
        <a href="#conteudo" className="skip-link">
          Pular para o conteúdo
        </a>
        <header className="border-b border-line bg-card">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
            <Link href="/dashboard" className="flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand font-bold text-white">
                N
              </span>
              <span className="text-lg font-bold tracking-tight text-ink">
                Nex<span className="text-brand">Person</span>
              </span>
            </Link>
            <div className="flex items-center gap-4">
              <nav aria-label="Navegação principal" className="flex gap-1 text-sm font-medium">
                {nav.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="rounded-md px-3 py-2 text-muted transition-colors hover:bg-subtle hover:text-ink"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
              <ThemeToggle />
            </div>
          </div>
        </header>
        <main id="conteudo" className="mx-auto max-w-6xl px-6 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
