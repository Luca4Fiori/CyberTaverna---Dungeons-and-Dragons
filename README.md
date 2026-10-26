# CT RPG

Fundação de uma plataforma VTT em pt-BR. **ETAPA 0: não há autenticação, partidas multiplayer ou CRUD de campanhas disponíveis.** Não há dados de produção nem seed fictício. Consulte [roadmap](docs/ROADMAP.md).

## Pré-requisitos

Node.js 22.12+ (linha 22 LTS), npm 10+, Docker Desktop com engine Linux iniciado e Docker Compose. Para E2E, Microsoft Edge instalado; pode-se trocar o canal no playwright.config.ts por Chromium instalado com Playwright.

## Instalação (PowerShell, na raiz)

```powershell
npm ci
Copy-Item .env.example .env
npm run services:up
npm run db:generate
npm run db:deploy
npm run dev
```

Web: http://localhost:3000. Serviço persistente Socket.IO: http://localhost:3001. Saúde: `/api/health/live` na web e `/health/live` no realtime. As verificações de liveness não certificam conectividade com o banco.

As páginas da fundação podem ser abertas sem PostgreSQL. Persistência deve ser verificada com a migração antes da etapa 1. Nenhuma tela atual grava dados no banco. `.env` é lido pelo Prisma e pelo processo realtime; ao adicionar código servidor Next com variáveis, carregar explicitamente o arquivo raiz ou configurar variáveis no processo de implantação. Nunca expor segredos com prefixo NEXT_PUBLIC.

## Comandos

```powershell
npm run db:validate
npm run typecheck
npm run lint
npm test
npm run test:e2e
npm run build
npm run format:check
```

Após o build, executar `npm run start:web` e `npm run start:realtime` em terminais separados. `npm run db:migrate -- --name nome_da_mudanca` cria novas migrações durante desenvolvimento. `db:deploy` aplica migrações versionadas. `services:down` preserva o volume; nunca usar `down -v` se precisar dos dados.

## Organização

- `apps/web`: Next.js App Router, React, Tailwind e Lucide.
- `apps/realtime`: processo Node/Socket.IO separado, sem salas abertas nesta etapa.
- `packages/database`: Prisma, migrações e fábrica de conexão PostgreSQL.
- `packages/contracts`: validação Zod compartilhada.
- `packages/domain`: políticas puras de autorização.
- `packages/rules`: cálculos básicos independentes da interface.
- `tests`: unitários, integração Socket.IO e E2E.

## Ambiente

`.env.example` documenta todas as variáveis. Ativas: `DATABASE_URL`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`, `WEB_ORIGIN`, `REALTIME_PORT`. As demais são reservadas: APP_URL, NEXT_PUBLIC_REALTIME_URL, SESSION_SECRET, STORAGE_DRIVER, STORAGE_LOCAL_PATH, S3_*, SMTP_URL e MAIL_FROM. Não existe integração de upload ou envio de email nesta etapa. Credenciais locais do exemplo não devem ser usadas em produção.

## Documentação

[Requisitos](docs/REQUISITOS.md) · [Arquitetura](docs/ARQUITETURA.md) · [Banco](docs/BANCO_DE_DADOS.md) · [Permissões](docs/PERMISSOES.md) · [API](docs/API.md) · [Tempo real](docs/TEMPO_REAL.md) · [Roadmap](docs/ROADMAP.md) · [Decisões](docs/DECISOES.md).

## Produção futura

Endereço planejado: `https://ct.dungeonsanddragons.com.br`. Nenhum DNS, hospedagem ou publicação foi alterado. Requer HTTPS, proxy WebSocket, origens explícitas, banco privado, armazenamento privado, backups testados, gestão de segredos e revisão dos termos antes de usuários reais. O realtime escuta loopback nesta etapa; ajustar bind apenas com a política de rede da implantação. Autenticação e primeiro administrador serão implementados na etapa 1/4; não há cadastro de administrador nem conta padrão.
