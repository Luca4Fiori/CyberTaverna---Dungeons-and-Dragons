# Decisões técnicas

## ADR 001 — Monorepo simples

Um package.json e lockfile, separação apps/packages, sem orquestrador adicional. Evita dependências estruturais prematuras; migrar a workspaces quando publicação independente justificar. Todos os processos usam o mesmo grafo instalado.

## ADR 002 — Web e realtime separados

Next.js atende web/REST; Socket.IO vive em processo Node persistente. Evita depender de funções efêmeras para WebSocket. Etapa 0 bloqueia conexões até autenticação real; não existe modo anônimo inseguro de demonstração.

## ADR 003 — Relacional e controle de concorrência

PostgreSQL 17, Prisma 7 com adapter pg. FKs compostas para isolamento referencial e versão em entidades concorrentes. JSON somente para deltas/ajustes flexíveis. Migrations SQL versionadas; mudanças futuras incrementais.

## ADR 004 — Dependências por necessidade

Next 16/React 19/Tailwind 4/Zod 4/Socket.IO 4, versões exatas no manifesto e lockfile. PixiJS, S3 SDK, hash de senhas, PDF e Three.js somente quando seus fluxos forem implementados. Nenhum botão de CRUD simulado.

## ADR 005 — Conteúdo e visual originais

Paleta fornecida, paisagem geométrica em CSS, fontes do sistema. Não importar aventuras ou traduções sem licença. SRD será catalogado com atribuição por conteúdo. Campanha de Tiamat não altera regras centrais.

## ADR 006 — Compatibilidade de lint

ESLint 9.39.5 está fixado porque os plugins transitivos do eslint-config-next 16.4.3 ainda declaram compatibilidade até ESLint 9. A versão 10 gerou peers inválidos e foi descartada. O npm avisa que a linha 9 saiu de suporte; acompanhar a atualização dos plugins antes de migrar. A auditoria do grafo instalado não reportou vulnerabilidades. Vitest foi atualizado para 5.0.5 após alertas na linha 3.

## Referências consultadas

- https://nextjs.org/docs/app/getting-started/installation
- https://www.prisma.io/docs/orm/v7/reference/prisma-config-reference
- https://docs.prisma.io/docs/orm/v7/core-concepts/supported-databases/database-drivers
- https://socket.io/docs/v4/server-initialization/
- https://socket.io/docs/v4/handling-cors/
- https://www.dndbeyond.com/srd

Consulta em 26/10/2026; versões efetivas registradas pelo npm no package-lock.json. Domínio planejado não é prova de controle ou autorização de marca.
