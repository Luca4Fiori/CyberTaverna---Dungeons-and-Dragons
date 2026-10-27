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

- [x] Cadastro/login/logout/perfil/dashboard, hash de senha, sessão/CSRF/rate limit e bloqueio de contas suspensas (painel de suspensão ainda pendente).
- [x] Criar/consultar/editar/arquivar campanhas, papel por campanha e convites atômicos.
- [ ] Excluir campanhas e gerenciar remoção/promoção de membros.
- [x] Fichas básicas persistidas, permissões, histórico, versão esperada e edição de todos os campos pelo mestre.
- [x] Sala de preparação persistida com participação de mestre e jogador; não é mesa virtual nem presença online.
- [ ] Upload validado local/S3, mapas e mesa PixiJS com tokens autorizados.
- [ ] Dados oficiais no servidor e histórico com visibilidades.
- [ ] Autenticação Socket.IO, salas, eventos autorizados, persistência, conflitos e ressincronização.
- [x] Testes PostgreSQL e E2E do núcleo com dois usuários e proibição de acesso entre campanhas; testes de mesa/sincronização permanecem pendentes.

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
- [x] Recuperação SMTP com tokens de uso único e revogação das sessões.
- [ ] Comando seguro para primeiro administrador.
- [ ] Personalizações, neve/gelo/magia/efeitos de habilidade/dados; preparar áudio/clima/Three.js/iluminação dinâmica.

Aceitação: permissões e privacidade testadas, arquivos validados, fluxos completos persistidos e administração inacessível ao GM comum.

## Etapa 5 — Produção

- [ ] Testes completos, carga, acessibilidade, desempenho e revisão de segurança.
- [ ] Rate limits distribuídos quando necessário, observabilidade, backups e exercício de restauração.
- [ ] Retenção/privacidade/termos, segredos, políticas S3 e dependências auditadas.
- [ ] Docker de aplicação, proxy TLS/WebSocket, CI e documentação operacional.
- [ ] Configurar domínio/hospedagem somente após autorização explícita.

Aceitação: checklist de operação validado, RPO/RTO definidos e restauração demonstrada; publicação autorizada separadamente.

### Inspeção e validação — 27/10/2026

Commits examinados: fee1166 (núcleo de campanhas e serviços) e b2787f3 (estrutura inicial). Autenticação, perfil, campanhas e convites já estavam implementados e foram preservados. Documentos anteriores descreviam esses recursos como futuros; README, arquitetura, permissões, API e banco foram corrigidos.

Docker Desktop e PostgreSQL estão saudáveis. Três migrações aplicadas (foundation, auth_recovery, characters_and_session_lobby), confirmadas por consulta SQL real; 20 tabelas no schema public incluindo _prisma_migrations. Banco principal sem usuários de teste. ct_rpg_test separado para os testes; Mailpit local captura recuperação sem email externo.

Implementado neste incremento: classe/espécie manuais, nome, nível/XP, seis atributos/modificadores, PV atuais/máximos/temporários e CA; gravação e edição PostgreSQL; controles de criação/edição pelo mestre; histórico e conflito de versão; navegação de fichas e sala compartilhada. Sem catálogo proprietário ou tradução de terceiros. Atribuição SRD 5.2.1 incluída.

Validação intermediária: Prisma validate, typecheck, lint, build e 45 testes unitários/integração aprovados. Primeira rodada E2E teve 10 aprovações e dois erros de seletor no novo teste (rótulo do botão de convite); corrigidos para nova execução. Resultado final registrado abaixo.

A etapa 1 completa continua aberta: faltam arquivos, mapas/tokens, dados oficiais e sincronização Socket.IO. Este incremento não implementa a mesa virtual. Também pendentes: magias/inventário/habilidades/evolução automática, UI de histórico, delegação individual de fichas, exclusão de campanha/membros e recursos administrativos. Sala lista até 50 sessões e 100 participantes; seleção de ficha usa primeira página de 20. Recuperação externa depende de SMTP configurado; restauração de backups e produção não validadas.

### Resultado final deste incremento

- Prisma validate e três migrações aplicadas: aprovados; PostgreSQL real confirmado por SQL.
- Typecheck, ESLint e Prettier: aprovados.
- Vitest: **45/45 testes aprovados**, incluindo autenticação/recuperação, isolamento de campanhas, fichas/atributos, persistência/histórico, versão esperada, permissões do mestre/jogador, bloqueio por arquivamento e participação autorizada na sala.
- Build de produção Next.js e compilação do realtime: aprovados.
- Playwright/Edge: **12/12 casos aprovados** em desktop/mobile. Fluxo completo: contas autenticadas, campanha, convite, criação de ficha pelo jogador, edição pelo mestre, recarga com dados persistidos e registro dos dois na mesma sessão. Recuperação testada com SMTP Mailpit real.
- Os erros iniciais de teste foram corrigidos: rótulo do convite e espera pela URL da sala antes de compartilhá-la. Execução com permissões locais de processo resolveu o encerramento do servidor gerenciado no Windows; nenhum processo externo foi encerrado.
- Sem push, publicação, alteração de DNS ou infraestrutura externa.

Próximo passo recomendado: evoluir a ficha modular com inventário, recursos e magias licenciadas, ampliar testes de regras e acesso; depois integrar autenticação/salas Socket.IO reutilizando os serviços validados. Mesa virtual completa permanece fora desta tarefa.
