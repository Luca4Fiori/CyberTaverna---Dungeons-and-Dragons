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

## ADR 007 — Fichas básicas e sala de preparação (27/10/2026)

Preservar autenticação/campanhas existentes e reutilizar associação por campanha. Fichas normalizadas, versão otimista e histórico dentro da transação; locks da campanha evitam corrida com arquivamento/permissões. Classe/espécie são texto manual: sem importar catálogos proprietários ou automatizar evolução incompleta. Sala mantém participação relacional, não simula presença online. Magias/inventário/habilidades serão módulos adicionais.

## ADR 008 — Validação no Windows

Carregar dotenv dentro de scripts/web.mjs, sem -r/--env-file herdados pelo Next em NODE_OPTIONS. E2E usa build de produção, PostgreSQL isolado e Mailpit local para recuperação. O servidor de desenvolvimento não é usado como evidência de comportamento do build final.

## ADR 009 — Catálogo e criação contextual (28/10/2026)

Preservar campanha e proprietário de todas as fichas. Criar sempre sob rota de campanha autorizada; área geral somente agrega fichas do proprietário. Seleção de sessão consulta nomes elegíveis com limite de 20 por busca, sem enviar fichas de terceiros ao jogador.

Catálogo estático versionado separado de `packages/rules`, com IDs, fonte e licença. Persistir referências opcionais e rótulos para suportar migração aditiva e conteúdo manual. Não inferir IDs para valores legados. IDs conhecidos exigem nome correspondente; subclasses exigem classe e nível compatíveis. Modo manual remove o ID da opção alterada, preservando intervenção do mestre e histórico. Futuros módulos aplicarão efeitos explicitamente, sem prometer cálculos ainda não implementados.

Não houve migração de associação de personagens: campaignId e ownerId já eram relacionais. A migração nova apenas adiciona campos de origem. Teste executa o SQL real sobre cópia temporária de registro antigo, sem escrever na tabela pública.

## 29/10/2026 — Classes relacionais e referências licenciadas

Manter colunas antigas como projeções evita remoção de dados e quebra abrupta de clientes. CharacterClass passa a representar a distribuição real; cliente antigo não pode salvar ficha multiclasse sem enviar essa distribuição. IDs de catálogo são versionados e nunca inferidos pelo nome. Catálogo permanece estático, revisável e independente das regras; fontes comerciais são apenas metadados, sem APIs privadas. Compatibilidade de opções antigas é explícita e parcial, não uma promessa de conversão automática. Exceções são decisões do mestre registradas no histórico; nenhuma habilidade proprietária é simulada.

## 29/10/2026 — Sete etapas e narrativa separada

A nova orientação priorizou narrativa e redesign; a importação persistente do catálogo foi adiada. Separar estado do formulário da etapa montada mantém escolhas sem apresentar todas as seções. A revisão é o único ponto de gravação, sem rascunho implícito. Textos narrativos são colunas próprias e não geram efeitos mecânicos. Limites de 5.000/20.000 caracteres e corpo de 256 KiB em fichas permitem histórias extensas mantendo limites verificáveis. HTML é exibido como texto, sem conteúdo rico executável.
