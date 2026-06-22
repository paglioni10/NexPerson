import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import Link from "next/link";
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
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={manrope.variable}>
      <body className="min-h-screen font-sans antialiased">
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
            <Link href="/dashboard" className="flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand font-bold text-white">
                N
              </span>
              <span className="text-lg font-bold tracking-tight text-ink">
                Nex<span className="text-brand">Person</span>
              </span>
            </Link>
            <nav className="flex gap-1 text-sm font-medium">
              {nav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-md px-3 py-2 text-slate-600 transition-colors hover:bg-brand-light hover:text-brand-dark"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
      </body>
    </html>
  );
}
