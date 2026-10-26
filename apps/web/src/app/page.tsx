import Link from "next/link";
import {
  ArrowUpRight,
  Map,
  Shield,
  Sparkles,
  Sword,
  BookOpen,
  Radio,
} from "lucide-react";
export default function HomePage() {
  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">BEM-VINDO À TAVERNA</p>
          <h1>
            Toda lenda começa
            <br />
            com um encontro.
          </h1>
        </div>
        <span className="edition">SEU MUNDO. SUAS HISTÓRIAS.</span>
      </div>
      <section className="hero" aria-labelledby="hero-title">
        <div className="mountains" aria-hidden="true">
          <div className="moon" />
          <div className="mountain back" />
          <div className="mountain front" />
          <div className="tower" />
          <div className="hero-grid" />
        </div>
        <div className="hero-copy">
          <p className="eyebrow">ALÉM DAS TERRAS CONGELADAS</p>
          <h2 id="hero-title">
            A próxima aventura
            <br />
            está no horizonte.
          </h2>
          <p>
            Reúna seu grupo. Dê vida aos seus personagens.
            <br />
            Construa mundos que só vocês podem imaginar.
          </p>
          <Link className="button primary" href="/campanhas">
            Explorar campanhas <ArrowUpRight size={18} />
          </Link>
        </div>
        <span className="hero-caption">
          <Sparkles size={14} /> Um novo espaço para o seu grupo
        </span>
      </section>
      <div className="section-heading">
        <h2>Prepare sua jornada</h2>
        <span>As ferramentas do seu universo</span>
      </div>
      <div className="cards">
        {[
          {
            href: "/campanhas",
            icon: Map,
            tag: "01 / MUNDOS",
            title: "Suas campanhas",
            copy: "Histórias independentes, reunidas em um só lugar.",
          },
          {
            href: "/personagens",
            icon: Sword,
            tag: "02 / HERÓIS",
            title: "Seus personagens",
            copy: "Cada escolha é um novo capítulo na sua história.",
          },
          {
            href: "/biblioteca",
            icon: BookOpen,
            tag: "03 / CONHECIMENTO",
            title: "Biblioteca de regras",
            copy: "Uma futura referência para suas próximas decisões.",
          },
        ].map(({ href, icon: Icon, tag, title, copy }) => (
          <Link className="feature-card" key={href} href={href}>
            <div className="card-top">
              <Icon size={25} />
              <ArrowUpRight size={18} />
            </div>
            <p className="eyebrow">{tag}</p>
            <h3>{title}</h3>
            <p>{copy}</p>
            <span className="small-tag">{href === "/campanhas" ? "Disponível" : "Em preparação"}</span>
          </Link>
        ))}
      </div>
      <section className="foundation">
        <Shield size={25} />
        <div>
          <h3>Construindo uma base para grandes histórias</h3>
          <p>
            Contas, perfis e campanhas já estão disponíveis. A mesa virtual e
            as partidas online fazem parte das próximas entregas.
          </p>
        </div>
        <Link href="/status">
          Ver progresso <Radio size={16} />
        </Link>
      </section>
    </>
  );
}
