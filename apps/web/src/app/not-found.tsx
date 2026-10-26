import Link from "next/link";
export default function NotFound() {
  return (
    <section className="empty-state">
      <h1>Caminho não encontrado</h1>
      <p>Esta página não existe na versão atual.</p>
      <Link className="button" href="/">
        Voltar à taverna
      </Link>
    </section>
  );
}
