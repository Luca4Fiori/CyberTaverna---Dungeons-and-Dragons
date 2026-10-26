export default function Page() {
  return (
    <article className="prose">
      <p className="eyebrow">CONSTRUÇÃO TRANSPARENTE</p>
      <h1>Estado do projeto</h1>
      <p>
        A fundação inclui navegação, preferências locais, esquema relacional,
        contratos de validação e um serviço de tempo real que bloqueia conexões
        até a implementação da autenticação.
      </p>
      <h2>Próximos capítulos</h2>
      <ol>
        <li>
          Sistema inicial: contas, campanhas, convites, fichas básicas, mesa
          PixiJS, dados e sincronização.
        </li>
        <li>
          Sistema de RPG: fichas completas, regras, biblioteca, inventário e
          encontros.
        </li>
        <li>Mesa avançada: desenho, camadas, névoa, visibilidade e toque.</li>
        <li>
          Recursos completos: PDFs, homebrew, mensagens, diário, agenda e
          administração.
        </li>
        <li>Produção: segurança, desempenho, backups e monitoramento.</li>
      </ol>
      <p>
        O estado das verificações e os critérios de aceitação estão documentados
        em docs/ROADMAP.md. Não há contas ou campanhas de demonstração
        apresentadas como dados reais.
      </p>
    </article>
  );
}
