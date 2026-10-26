import type { Metadata } from "next";
import Link from "next/link";
import {
  Compass,
  Snowflake,
  BookOpen,
  Users,
  ScrollText,
  Settings2,
} from "lucide-react";
import "./globals.css";
import { VisualPreferences } from "@/components/visual-preferences";
export const metadata: Metadata = {
  title: { default: "CT RPG • Sua próxima história", template: "%s | CT RPG" },
  description: "Uma nova casa para suas aventuras de RPG de mesa.",
};
const navigation = [
  { href: "/dashboard", label: "Minha conta", icon: Users },
  { href: "/", label: "Visão geral", icon: Compass },
  { href: "/campanhas", label: "Campanhas", icon: Users },
  { href: "/personagens", label: "Personagens", icon: ScrollText },
  { href: "/biblioteca", label: "Biblioteca", icon: BookOpen },
  { href: "/preferencias", label: "Preferências", icon: Settings2 },
];
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body>
        <VisualPreferences />
        <a className="skip-link" href="#conteudo">
          Pular para o conteúdo
        </a>
        <aside className="sidebar">
          <Link href="/" className="brand">
            <Snowflake size={34} />
            <span>
              CT <b>RPG</b>
              <small>O início de uma lenda</small>
            </span>
          </Link>
          <p className="nav-label">SEU UNIVERSO</p>
          <nav aria-label="Navegação principal">
            {navigation.map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href}>
                <Icon size={19} />
                {label}
              </Link>
            ))}
          </nav>
          <div className="sidebar-note">
            <span className="status-dot" /> Núcleo de usuários e campanhas
            <p>
              Um mundo de possibilidades.
              <br />
              Uma etapa de cada vez.
            </p>
          </div>
          <Link className="license-link" href="/atribuicoes">
            Termos e atribuições ↗
          </Link>
        </aside>
        <div className="workspace">
          <header className="topbar">
            <span>SEU PONTO DE ENCONTRO À BEIRA DO IMPOSSÍVEL</span>
            <span className="badge">ETAPA 1 · NÚCLEO</span>
          </header>
          <main id="conteudo">{children}</main>
          <footer>
            CT RPG <span>Feito para histórias compartilhadas.</span>
            <Link href="/status">Estado do projeto</Link>
          </footer>
        </div>
      </body>
    </html>
  );
}
