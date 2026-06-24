import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { Nav } from "@/components/Nav";
import { ThemeToggle } from "@/components/ThemeToggle";
import "./globals.css";

const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope" });

export const metadata: Metadata = {
  title: "NexPerson, Mapa de Dependência Humana",
  description: "Transformando conhecimento em continuidade.",
};

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
        <header className="sticky top-0 z-50 border-b border-line bg-card/80 backdrop-blur-md">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
            <Link href="/dashboard" className="flex items-center gap-2.5">
              <Logo size={34} />
              <span className="text-lg font-extrabold tracking-tight text-ink">
                Nex<span className="text-brand">Person</span>
              </span>
            </Link>
            <div className="flex items-center gap-4">
              <Nav />
              <ThemeToggle />
            </div>
          </div>
        </header>
        <main id="conteudo" className="mx-auto max-w-6xl px-6 py-10">
          {children}
        </main>
      </body>
    </html>
  );
}
