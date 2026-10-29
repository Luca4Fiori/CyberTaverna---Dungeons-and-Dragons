# CyberTaverna — CT RPG

Plataforma RPG em pt-BR em desenvolvimento. O núcleo de contas e campanhas funciona com PostgreSQL: cadastro, login/logout, perfil, recuperação via SMTP configurado, campanhas, convites, fichas básicas e sala compartilhada de preparação. A mesa virtual e a sincronização de jogo ainda não estão implementadas. Não há contas padrão nem seed de produção. Consulte [roadmap](docs/ROADMAP.md).

## Instalação local (PowerShell)

Requisitos: Node.js 22.12+, npm, Docker Desktop com engine Linux. Para E2E, Microsoft Edge instalado.

```powershell
npm ci
# Apenas na primeira instalação; preserve sua configuração existente:
Copy-Item .env.example .env
npm run services:up
npm run db:generate
npm run db:deploy
npm run devn
```

Abra http://localhost:3000, cadastre duas contas e entre em perfis de navegador separados. O mestre cria uma campanha e um convite; o jogador abre o convite depois do login, cria sua ficha em Personagens; o mestre acessa a mesma ficha. Em Sessões, o mestre cria uma sala e ambos registram sua participação. O jogador seleciona uma ficha própria. Atualizar a página recupera o estado persistido; não há indicador de presença online.

PostgreSQL local usa 127.0.0.1:5433 para não interferir com outro banco existente na porta 5432. `POSTGRES_PORT` e `DATABASE_URL` precisam concordar. Web lê o `.env` raiz pelo lançador `scripts/web.mjs`. Saúde do processo: `/api/health/live`; conexão real com banco: `/api/health/ready`. Realtime: localhost:3001, ainda recusa conexões de jogo.

## Validação

```powershell
npm run db:validate
npm run db:test:prepare
docker compose --profile mail up -d --wait
npm run typecheck
npm run lint
npm test
npm run test:e2e
npm run format:check
```

Testes usam exclusivamente `ct_rpg_test` local, criado/migrado por `db:test:prepare`. Fixtures possuem identificadores únicos e são removidas ao terminar. E2E compila e executa o build de produção em localhost:3100, em desktop/mobile, usando Mailpit local (SMTP 1025; consulta 8025) para verificar recuperação sem enviar email externo. `npm run build` gera web/realtime; depois use `npm run start:web` e `npm run start:realtime` separadamente.

Novas migrações: `npm run db:migrate -- --name nome`. Migrações existentes: `npm run db:deploy`. `services:down` preserva volume; não use `down -v` para dados que deseja manter.

## Ambiente e segurança

Ativas: `DATABASE_URL`, `POSTGRES_PORT`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`, `APP_URL`, `WEB_ORIGIN`, `REALTIME_PORT`. Recuperação requer `SMTP_URL` e `MAIL_FROM`; sem provedor, retorna indisponibilidade, sem simular envio. Para experimentar localmente, configure `SMTP_URL=smtp://localhost:1025` e um remetente de teste após iniciar Mailpit. Em produção, SMTP externo exige TLS e APP_URL exige HTTPS.

Sessões usam tokens aleatórios opacos e hash no banco, sem SESSION_SECRET. Cookies HttpOnly/SameSite e Secure em HTTPS; senhas Argon2id; validação de origem/JSON, limite de corpo e rate limit PostgreSQL. Credenciais do exemplo são apenas locais. `NEXT_PUBLIC_REALTIME_URL`, `SESSION_SECRET`, armazenamento e S3 permanecem reservados, não habilitam funcionalidades.

## Organização e documentação

`apps/web`: Next/React; `apps/realtime`: Socket.IO; `packages/domain`: serviços transacionais e autorização; `packages/contracts`: Zod; `packages/database`: Prisma/migrações; `packages/rules`: cálculos; `tests`: unitários, PostgreSQL, realtime e E2E.

[Arquitetura](docs/ARQUITETURA.md) · [Banco](docs/BANCO_DE_DADOS.md) · [Permissões](docs/PERMISSOES.md) · [API](docs/API.md) · [Tempo real](docs/TEMPO_REAL.md) · [Roadmap](docs/ROADMAP.md) · [Requisitos](docs/REQUISITOS.md) · [Decisões](docs/DECISOES.md).

## Produção futura

Domínio planejado: https://ct.dungeonsanddragons.com.br. Sem publicação, alteração de DNS ou hospedagem. Faltam revisão operacional, privacidade/termos, backups com restauração, observabilidade, primeiro administrador e infraestrutura TLS. Não há cadastro público de administrador. Não usar esta instalação como serviço público antes desses trabalhos.

## Criação guiada e navegação contextual (28/10/2026)

Dentro da campanha, abra a aba **Personagens → Criar personagem nesta campanha**. O criador oferece identidade, catálogo de origens, atributos/defesa e revisão. Há modo manual para escolhas próprias e edição do mestre. A área geral Personagens reúne as fichas do usuário com link para a campanha. A sala sugere fichas autorizadas, mantém a escolha registrada e permite criar outra com retorno à sessão.

Após atualizar, execute `npm run db:generate`, `npm run db:deploy` e `npm run db:test:prepare`. A migração de catálogo é aditiva; não altera vínculos ou nomes antigos. Catálogo e limites estão em [CATALOGO_SRD.md](docs/CATALOGO_SRD.md). Selecionar classe/espécie/antecedente não aplica habilidades, magias ou bônus automaticamente. O multiplayer em tempo real permanece pendente.

## Catálogo e multiclasse (29/10/2026)

Fichas suportam distribuição relacional de classes e subclasses, total calculado, requisitos e ajustes autorizados pelo mestre. No criador, use **Distribuir níveis por classe** e **Adicionar outra classe**. Filtros pesquisam opções por nome em português/inglês, fonte e edição. Referências comerciais não aplicam habilidades automaticamente.

Após atualizar: `npm run db:generate` e `npm run db:deploy`. A quinta migração preserva as fichas existentes. Consulte [modelo, compatibilidade e fontes](docs/MULTICLASSE.md). Não há novas variáveis de ambiente.
