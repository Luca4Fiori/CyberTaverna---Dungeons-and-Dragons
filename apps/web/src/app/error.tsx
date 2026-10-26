"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <section className="empty-state">
      <h1>Não foi possível carregar</h1>
      <p>Verifique se o banco está disponível e tente novamente.</p>
      <button className="button" onClick={reset}>
        Tentar novamente
      </button>
    </section>
  );
}
