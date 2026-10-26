# Entrega da fundação

Todos os arquivos são novos; o diretório inicial estava vazio e não era um repositório Git. Não houve publicação, alteração de DNS ou infraestrutura externa. `.env` local foi criado a partir do exemplo e é ignorado pelo Git.

## Arquivos e diretórios

| Área         | Arquivos                                                                                                                                                                                                                |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Raiz         | package.json, package-lock.json, .gitignore, .env.example, compose.yaml, tsconfig.base.json, prisma.config.ts, eslint.config.mjs, .prettierrc.json, .prettierignore, vitest.config.mts, playwright.config.ts, README.md |
| Web          | apps/web/next.config.ts, next-env.d.ts, postcss.config.mjs, tsconfig.json                                                                                                                                               |
| Interface    | apps/web/src/app/layout.tsx, globals.css, page.tsx, not-found.tsx; páginas campanhas, personagens, biblioteca, preferencias, status e atribuicoes; api/health/live/route.ts                                             |
| Componentes  | apps/web/src/components/module-page.tsx e visual-preferences.tsx                                                                                                                                                        |
| Realtime     | apps/realtime/src/index.ts, server.ts e tsconfig.json                                                                                                                                                                   |
| Banco        | packages/database/prisma/schema.prisma, migrations/migration_lock.toml, migrations/202610260001_foundation/migration.sql; packages/database/src/index.ts                                                                |
| Domínio      | packages/contracts/src/index.ts, packages/domain/src/permissions.ts, packages/rules/src/index.ts                                                                                                                        |
| Testes       | tests/unit/foundation.test.ts, tests/integration/realtime.test.ts, tests/e2e/navigation.spec.ts                                                                                                                         |
| Documentação | REQUISITOS.md, ARQUITETURA.md, BANCO_DE_DADOS.md, PERMISSOES.md, API.md, TEMPO_REAL.md, ROADMAP.md, DECISOES.md, ENTREGA_ETAPA_0.md                                                                                     |

Dependências, cliente Prisma, builds e relatórios são gerados localmente e ignorados. O histórico Git ainda precisa ser iniciado pelo responsável; nenhuma alteração foi commitada.

## Implementação real versus preparação

Funcionam: navegação, layout responsivo, preferências visuais locais, páginas de estado/licenças, endpoint de saúde web, processo realtime compilado com rejeição de conexões, contratos Zod, políticas puras e cálculos básicos testados. Banco modelado com migração, ainda sem PostgreSQL executado nesta máquina.

Não funcionam ainda: cadastro/login/perfil autenticado, CRUD de campanhas/fichas, convites, upload, PixiJS, dados oficiais, salas e sincronização multiplayer. As telas identificam explicitamente o estado pendente. Nada foi substituído por registros de produção simulados.

Consulte README para comandos/variáveis e ROADMAP para resultados de verificação e pendências de todas as etapas.
