import Link from "next/link";
import { Compass } from "lucide-react";
export function ModulePage({
  title,
  description,
  stage,
  items,
}: {
  title: string;
  description: string;
  stage: string;
  items: string[];
}) {
  return (
    <>
      <p className="eyebrow">CT RPG / {stage}</p>
      <h1>{title}</h1>
      <p className="lead">{description}</p>
      <section className="empty-state">
        <Compass size={48} />
        <h2>O próximo capítulo está em preparação</h2>
        <p>
          Este módulo ainda não está implementado. Nenhum dado de campanha ou
          personagem é exibido nesta etapa.
        </p>
        <ul>
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <Link className="button" href="/status">
          Consultar o estado do projeto
        </Link>
      </section>
    </>
  );
}
