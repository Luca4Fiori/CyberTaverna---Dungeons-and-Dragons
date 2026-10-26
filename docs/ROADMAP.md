# Roadmap e critérios de aceitação

Legenda: [x] implementado, [ ] pendente. Verificação não executada não equivale a aprovação.

## Etapa 0 — Fundação

- [x] Inspecionar diretório (vazio, sem .git ou implementação anterior).
- [x] Arquitetura, requisitos, banco, permissões, API, tempo real e decisões documentados.
- [x] Next.js App Router, React, TS strict, Tailwind, Lucide e navegação pt-BR.
- [x] Layout responsivo, preferências visuais locais e redução de movimento.
- [x] PostgreSQL via Compose, esquema Prisma e migração inicial.
- [x] Serviço Socket.IO separado com origem restrita e bloqueio de autenticação pendente.
- [x] Scripts, variáveis de exemplo, lint, formatação, testes unitários/integração/E2E.
- [x] Validar migração em PostgreSQL local e registrar resultados finais das verificações.

Aceitação: instalar com lockfile, gerar/validar Prisma, aplicar migração, executar lint/tipos/testes/build, navegar em desktop/mobile e verificar que realtime não aceita cliente anônimo. Não inclui usuários jogando; isso pertence à etapa 1.

### Verificação em 26/10/2026

- Prisma validate e generate: aprovados; migração inicial gerada com FKs, índices e checks SQL adicionais.
- TypeScript strict, ESLint e Prettier: aprovados.
- Build Next.js de produção e compilação do realtime: aprovados.
- Vitest: 21 testes aprovados (cálculos, contratos, isolamento, saúde e rejeição de conexões). O runner emitiu aviso de encerramento tardio de servidores Vite, embora tenha retornado código zero.
- Playwright/Edge: 4 testes aprovados em desktop/mobile (navegação e preferências persistidas). Primeira execução demorou no encerramento do servidor gerenciado; repetição com servidor existente concluiu com código zero.
- Interface inicial inspecionada visualmente no navegador local.
- Repetição após validar preferências locais revelou interação antes da hidratação. Campos agora ficam desabilitados até a interface estar pronta; suíte completa repetida com um único servidor: 4/4 aprovados, código zero.
- `docker compose config --quiet`: configuração válida; não certifica engine ou banco em execução.
- Realtime compilado executado e endpoint de saúde respondeu corretamente.
- Auditoria npm após atualização de Vitest: zero vulnerabilidades reportadas; ESLint 9 tem aviso de fim de suporte, mantido por compatibilidade dos plugins Next (ADR 006).
- **Bloqueio:** Docker CLI disponível, mas engine Linux ausente/desligado (`dockerDesktopLinuxEngine`). PostgreSQL não foi iniciado; aplicação e restauração da migração não foram testadas. A etapa 0 não está integralmente aceita até essa validação.

Próxima ação: iniciar Docker Desktop/engine Linux, executar `npm run services:up` e `npm run db:deploy`, verificar tabelas e constraints; depois implementar autenticação e campanha com dois usuários reais de teste.

## Etapa 1 — Sistema funcional inicial

### Revalidação da fundação antes da Etapa 1 — 26/10/2026

Docker Desktop iniciado; engine 28.4.0. A porta 5432 pertence ao container de outro projeto (`rollod20-postgres`), preservado. Compose do CT RPG agora usa porta configurável, padrão 5433. PostgreSQL 17 saudável; conexão real e migração `202610260001_foundation` aplicadas. Typecheck, lint, 21 testes unitários/integração, 4 casos E2E desktop/mobile e build aprovados. O bloqueio de banco registrado acima é histórico e foi resolvido.

- [ ] Cadastro/login/logout/perfil/dashboard, hash de senha, sessão/CSRF/rate limit e suspensão.
- [ ] Campanhas CRUD/arquivo, membros, papel por campanha e convites atômicos.
- [ ] Fichas básicas e permissões de edição, histórico e ajustes pelo mestre.
- [ ] Upload validado local/S3, mapas e mesa PixiJS com tokens autorizados.
- [ ] Dados oficiais no servidor e histórico com visibilidades.
- [ ] Autenticação Socket.IO, salas, eventos autorizados, persistência, conflitos e ressincronização.
- [ ] Testes PostgreSQL e E2E com dois usuários, proibição de acesso entre campanhas.

Aceitação: mestre e jogador entram na mesma campanha, persistem ficha/mapa, movem somente tokens permitidos, rolam dados e recuperam estado após reconectar/reiniciar; terceiro usuário não acessa recursos secretos.

## Etapa 2 — Sistema de RPG

- [ ] Ficha completa (todos os campos de REQUISITOS), evolução/XP, recursos, inventário/moedas, magias/habilidades.
- [ ] Motor de regras SRD modular, overrides e testes de cálculos.
- [ ] Biblioteca pesquisável e filtros, referências, origem/licença e tradução verificada.
- [ ] Encontros/iniciativa/turnos/rodadas/condições/efeitos, NPCs/criaturas e histórico de sessões.

Aceitação: alterações persistidas, cálculos testados, mestre intervém manualmente, conteúdo com licença rastreável.

## Etapa 3 — Mesa avançada

- [ ] Grade/escala/alinhamento, desenho/medição/marcadores/áreas de efeito, seleção múltipla.
- [ ] Camadas, névoa, visibilidade filtrada no servidor e troca/autosave de cenas.
- [ ] Objetos configuráveis (portas/baús/armadilhas), estados e ações.
- [ ] Mouse/atalhos/contexto, toque/pinça e prevenção de movimentos acidentais.
- [ ] Efeitos ambientais independentes, qualidade e performance móvel.

Aceitação: nenhum segredo em payload de jogador, conflitos tratados, operações persistidas e acessíveis em desktop/mobile.

## Etapa 4 — Recursos completos

- [ ] PDF exportação/importação de modelos documentados, campos desconhecidos explícitos.
- [ ] Conteúdo homebrew editável e associado a campanhas, políticas e denúncia.
- [ ] Chat público/privado, notas do mestre, diário/eventos/resumos/agenda/notificações.
- [ ] Admin separado: contas/suspensão, campanhas, denúncias/moderação, conteúdo global, armazenamento/limites/relatórios/configurações/auditoria.
- [ ] Comando seguro para primeiro admin, recuperação SMTP quando configurada.
- [ ] Personalizações, neve/gelo/magia/efeitos de habilidade/dados; preparar áudio/clima/Three.js/iluminação dinâmica.

Aceitação: permissões e privacidade testadas, arquivos validados, fluxos completos persistidos e administração inacessível ao GM comum.

## Etapa 5 — Produção

- [ ] Testes completos, carga, acessibilidade, desempenho e revisão de segurança.
- [ ] Rate limits distribuídos quando necessário, observabilidade, backups e exercício de restauração.
- [ ] Retenção/privacidade/termos, segredos, políticas S3 e dependências auditadas.
- [ ] Docker de aplicação, proxy TLS/WebSocket, CI e documentação operacional.
- [ ] Configurar domínio/hospedagem somente após autorização explícita.

Aceitação: checklist de operação validado, RPO/RTO definidos e restauração demonstrada; publicação autorizada separadamente.
