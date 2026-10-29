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

## Incremento de experiência — 28/10/2026

Prioridade atual após avaliação manual: fluxo campanha/personagem e criador guiado. Inspecionado commit a8ffefe e preservadas alterações locais preexistentes. A solicitação anterior de multiplayer ainda não está implementada: Socket.IO continua fechado, sem presença ou sincronização.

- [x] Navegação contextual por campanha com abas Visão da campanha, Personagens e Sessões.
- [x] Criar personagem nesta campanha, associação automática pela rota e acesso direto às fichas autorizadas.
- [x] Seção geral lista fichas próprias, com campanha e paginação; não expõe fichas alheias de campanhas mestradas.
- [x] Sessão sugere fichas elegíveis, permite busca no servidor e preserva personagem já registrado. Criar a partir da sessão retorna à mesma sala, sem inscrição automática.
- [x] Criador em quatro etapas com revisão e alternativa de preenchimento manual.
- [x] Catálogo separado do motor: 12 classes, 9 espécies, 4 antecedentes e 12 subclasses SRD 5.2.1, com fontes/licença e descrições pt-BR próprias.
- [x] Subclasse de catálogo validada por classe/nível no servidor; opções personalizadas sem ID de origem.
- [x] Migração aditiva, sem reclassificar nomes antigos ou alterar associações.
- [x] Página Estado do projeto retirada do destaque principal e identificada como desenvolvimento no rodapé.
- [ ] Bônus de origens, talentos, habilidades, magias, inventário, multiclasses e evolução automática.

Validação concluída; resultados e limitações registrados abaixo.

### Resultado da validação do incremento — 28/10/2026

- Prisma generate/validate e migração character_catalog aprovados em ct_rpg e ct_rpg_test; consulta SQL confirma as quatro migrações aplicadas. Migração aditiva não reescreve associações existentes.
- **53/53 testes unitários e de integração aprovados**, incluindo catálogo/licença, busca, validação de classe/subclasse/nível, acesso cruzado, listagem própria, persistência e execução do SQL da migração sobre cópia temporária de registro legado.
- **14/14 testes E2E aprovados**, em desktop/mobile, preservando os fluxos anteriores e acrescentando seleção guiada, revisão sem gravação antecipada, associação automática, retorno à sessão, seleção persistida e edição manual.
- Typecheck, ESLint, Prettier e build web/realtime aprovados. Prettier ignora pacotes de referências externos em .agents/.claude/.windsurf, sem modificar esses arquivos preexistentes.
- Falhas encontradas e corrigidas: Mailpit local desligado (serviço iniciado); rótulos de seleção explícitos; teste antigo adaptado ao modo manual; botão de avanço separado do botão de envio para impedir salvamento antes da confirmação; teste distingue mensagem de salvamento dos outputs de modificadores.
- Capturas da revisão desktop/mobile inspecionadas. Ajustado recorte do link de pular navegação enquanto não tem foco, mantendo acesso por teclado.
- Sem push, publicação ou alteração de infraestrutura externa.

Limitações: esta é a primeira versão do criador guiado, não um validador completo de personagem D&D. Não há aplicação automática de habilidades, bônus de antecedentes, magias, inventário, linhagens, multiclasses ou evolução. Opções personalizadas mantêm o comportamento manual anterior; não implementam ainda um editor de conteúdo homebrew. Cada busca de personagem elegível retorna até 20 resultados; refine pelo nome. Sessões ainda não sincronizam em tempo real.

Próximo trabalho: retomar a integração Socket.IO de autenticação, presença, alterações de ficha e ressincronização solicitada anteriormente; ampliar regras e recursos da ficha em incrementos testáveis.

## Catálogo extensível e multiclasse — 29/10/2026

Prioridade atual solicitada: estrutura de catálogo e fichas multiclasse. Inspecionados os commits recentes (incluindo d7a3f17), contratos, serviços, migrações e documentação antes da implementação. Os resultados anteriores acima são históricos; esta seção atualiza a pendência de multiclasse, sem declarar concluída a etapa 2 ou o motor completo.

- [x] Fontes com nome, edição, versão, URL, licença e condição de conteúdo; categorias de classe, subclasse, espécie, antecedente, habilidade, talento e magia preparadas.
- [x] Preservado catálogo SRD; acrescentadas referências externas Warrior of Mercy 2024, Way of Mercy 2020, Swarmkeeper 2020, Shadar-kai 2022 e Mercenary Veteran 2015, sem textos proprietários.
- [x] Classes relacionais por personagem, com níveis, subclasse própria, versões, fontes separadas e ordem de aquisição opcional validada.
- [x] Total calculado e proficiência por total; pré-requisitos das classes SRD, distribuição válida, unicidade e disponibilidade de subclasse por nível de classe.
- [x] Ajustes de requisitos autorizados somente pelo mestre da campanha, com justificativa e histórico; jogadores não concedem exceções ou editam fichas alheias.
- [x] Migração aditiva aplicada em ct_rpg e ct_rpg_test. Verificação antes/depois confirmou a preservação da ficha real existente, seus vínculos, campos legados e versão. Nenhum personagem de exemplo foi inserido no banco de uso real.
- [x] Criador com múltiplas classes, distribuição de níveis, pesquisa pt/en, filtros por fonte/edição, avisos de referências, modo personalizado e resumo com origem das opções.
- [x] Cliente antigo impedido de apagar uma distribuição multiclasse ao omitir classes; concorrência continua protegida por expectedVersion.
- [x] Testes de classe única, multiclasse, soma, requisitos, versões, subclasses, persistência, autorização, isolamento e migração SQL.
- [x] Criação e recuperação de **Enxame da Misericórdia**: Monge 13 / Warrior of Mercy (PHB 2024), Patrulheiro 7 / Swarmkeeper (Tasha 2020), Shadar-kai (MotM 2022), Mercenary Veteran (SCAG 2015), nível total 20 e proficiência +6.

### Validação

- Docker/PostgreSQL local e Mailpit: serviços saudáveis; migrações aplicadas e Prisma generate/validate aprovados.
- Vitest: **66/66 testes unitários e de integração aprovados**, com PostgreSQL real separado para testes. Inclui regressão da comparação de exceções independente da ordem das chaves JSON.
- Playwright: **16/16 testes aprovados** em desktop e celular; fluxos anteriores preservados, novo fluxo multiclasse cria, salva, recarrega e confere as fontes. Capturas de revisão e ausência de rolagem horizontal verificadas.
- Typecheck, ESLint, Prettier e build Next.js/realtime aprovados.
- Problemas corrigidos durante a validação: rótulos acessíveis dos filtros, resumo que poderia confundir edição da classe com origem da subclasse e comparação de aprovação sensível à ordem das propriedades.
- Sem push, publicação, API privada ou alteração de infraestrutura externa.

### Pendências e próximo passo

O catálogo extensível ainda não inclui registros de habilidades/talentos/magias. Conteúdo personalizado permanece manual na ficha; falta editor de biblioteca homebrew compartilhada. Requisitos não implementados de classes manuais exigem decisão registrada do mestre em multiclasse. Não há conversão automática de antecedentes antigos, concessão automática de recursos/habilidades, agregação de espaços de magia, proficiências, inventário ou progressão completa por nível. A ordem de aquisição não reconstrói atributos históricos.

Próximo incremento recomendado: implementar recursos e progressão por classe com dados licenciados do SRD e testes de agregação multiclasse, mantendo referências externas manuais. A solicitação anterior de Socket.IO/presença continua pendente e não foi substituída por simulação. Ver [MULTICLASSE.md](MULTICLASSE.md) para contrato, fontes, compatibilidade e limites.

## Assistente de sete etapas e sistema narrativo — 29/10/2026

A orientação mais recente priorizou redesign e narrativa. O catálogo persistente/importador, solicitado antes, não foi iniciado e permanece pendente. Foram revisados o criador, contratos, migrações, multiclasse, testes e commits 19f3971/6185916; implementações anteriores e arquivos locais foram preservados.

- [x] Sete etapas independentes, com apenas uma etapa montada: Identidade; Espécie e antecedente; Classes e subclasses; Atributos e defesas; História e personalidade; Recursos e habilidades; Revisão final.
- [x] Anterior/Continuar, indicador de progresso e preservação das escolhas. Revisão com acesso direto às etapas para correção. Gravação somente na confirmação, sem rascunho implícito.
- [x] Descrição física/comportamental, personalidade, ideais, vínculos, fraquezas e história opcionais, multilinha, persistidos separadamente do antecedente.
- [x] Textareas amplas, contadores, crescimento com rolagem para textos extensos, foco e contraste visíveis. Limites: 5.000 caracteres por campo e 20.000 na história.
- [x] Migração aditiva aplicada aos bancos local e de testes; verificação confirmou preservação da ficha real existente, identidade, vínculos, campos legados e versão. Texto anterior em biography é preservado e copiado para backstory quando existente.
- [x] Permissões do mestre/proprietário, isolamento de campanhas, histórico e expectedVersion preservados. Omissão dos novos campos por cliente antigo não apaga narrativa.
- [x] Texto simples com exibição escapada; HTML armazenado como texto não cria elementos nem executa scripts. Limites Zod e corpo de 256 KiB somente para escrita de fichas; demais endpoints mantêm 16 KiB.
- [x] Cartões por classe, uma edição expandida por vez, filtros técnicos recolhidos e progressão visual por nível. Multiclasse e aprovação de exceções continuam validadas no servidor.
- [x] Caso Monge 4 coberto: vínculo manual explicado; seleção explícita de classe do catálogo libera subclasses elegíveis; filtros reiniciados ao trocar classe. SRD, referências externas e opções personalizadas diferenciadas.
- [x] Recursos apresenta apenas PV/CA e cálculos existentes, com aviso explícito das funcionalidades futuras indisponíveis.

### Resultados reais

- **74/74 testes unitários e de integração aprovados**, incluindo narrativa longa, campos opcionais, edição do mestre, acesso indevido, preservação em PATCH antigo, execução das migrações em cópia temporária, limites de texto, atributos e multiclasse.
- **20/20 E2E aprovados** em desktop/mobile: fluxos anteriores, sete etapas, voltar e corrigir, preservação de campos, Monge 4, troca de filtros, progressão visual, gravação e recarga de história extensa, HTML inerte, ausência de gravação antes da confirmação e ficha criada pelo contrato antigo. Limites de corpo (413) e de história (400) também verificados.
- Prisma generate/validate, typecheck, ESLint, Prettier e build web/realtime aprovados. Após o ajuste final de contraste das textareas, build e fluxo narrativo desktop/mobile foram novamente verificados.
- Capturas de classes e história inspecionadas; testes confirmam ausência de overflow horizontal no celular. Corrigidos rótulos acessíveis que incluíam o contador e um seletor ambíguo do teste de revisão.
- Sem push, publicação ou mudanças de infraestrutura externa.

Limitações: conteúdo ainda fica apenas no estado do formulário até salvar; recarregar uma ficha nova perde o preenchimento não confirmado. Não há editor de texto rico, upload de retratos, habilidades/magias/equipamentos automáticos ou sincronização multiplayer. Catálogo PostgreSQL, importador e biblioteca homebrew compartilhada permanecem tarefas futuras. Detalhes em [CRIADOR_NARRATIVO.md](CRIADOR_NARRATIVO.md).
