export default function Page() {
  return (
    <article className="prose">
      <p className="eyebrow">CONSTRUÇÃO TRANSPARENTE</p>
      <h1>Estado do projeto</h1>
      <p>
        Contas com sessões autenticadas, perfis, criação, edição e arquivamento
        de campanhas, convites e permissões por campanha estão implementados no
        PostgreSQL. Fichas básicas com atributos calculados e sala de preparação
        compartilhada também estão disponíveis. Recuperação de senha depende de
        SMTP configurado. O serviço de tempo real continua bloqueado; a mesa
        virtual ainda não foi iniciada.
      </p>
      <h2>Próximos capítulos</h2>
      <ol>
        <li>
          Restante do sistema inicial: mesa PixiJS, dados e sincronização, após
          validação do núcleo de usuários e campanhas.
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
