# Permissões

A identidade global não concede papel de mestre. A sessão válida, suspensão, associação à campanha e ação são verificadas pelo servidor em cada operação.

| Recurso atual                     | Mestre da campanha                             | Jogador membro                   | Não membro |
| --------------------------------- | ---------------------------------------------- | -------------------------------- | ---------- |
| Campanha e lista de participantes | Ler/editar/arquivar                            | Ler                              | Negado     |
| Criar/listar/revogar convites     | Sim                                            | Não                              | Não        |
| Fichas                            | Ler/criar/editar todas, transferir para membro | Próprias, conforme configuração  | Negado     |
| Configurações de fichas           | Sim                                            | Não                              | Não        |
| Criar sessão/alterar estado (API) | Sim                                            | Não                              | Não        |
| Sala e participantes registrados  | Ler/participar                                 | Ler/participar com ficha própria | Negado     |

Um usuário pode ser GM em A e PLAYER em B. Conhecer um ID não concede acesso. Jogadores não recebem fichas de outros jogadores; na sala recebem somente identificação do personagem e nome do participante. Cadastro aceita apenas campos permitidos, cria USER e rejeita globalRole. ADMIN não ganha acesso implícito a campanhas privadas. Painel administrativo ainda pendente.

Arquivamento mantém consulta e bloqueia escrita de fichas, convites e sessões; reativação não restaura convites revogados. Configurações podem bloquear criação/edição de fichas para jogadores, sem restringir intervenção do mestre. Não existe delegação individual de ficha a outro jogador nesta etapa. Transferência de dono só para membro, pelo mestre, e remove associação da ficha das participações antigas.

Tokens de autenticação, recuperação e convites persistem apenas em hash. Mutação exige origem exata APP_URL e JSON, possui limite de corpo e rate limit. Recuperação é única e expira; redefine senha e revoga sessões. Cadastro público nunca promove administrador.

Testes cobrem expiração, suspensão, logout, recuperação concorrente, convites concorrentes, papéis cruzados, IDOR de fichas/salas, proprietário, configurações, versão concorrente e arquivamento. Realtime permanece fechado com AUTH_NOT_IMPLEMENTED. Políticas puras de movimento já têm testes, mas nenhum movimento de token está disponível.

## Navegação e catálogo (28/10/2026)

A listagem geral agrega apenas fichas cujo ownerId pertence à sessão autenticada. A aba da campanha continua mostrando todas as fichas ao mestre e somente as próprias ao jogador. Busca de fichas elegíveis usa os mesmos escopos, validada em cada consulta. A criação associa pela rota; não aceita campaignId no payload. Identificadores do catálogo não concedem autorização nem mudam proprietário. Edição de conteúdo personalizado segue as permissões existentes; nenhuma promoção de papel foi adicionada.

## Exceções de multiclasse

Somente GM da campanha pode criar/alterar multiclassAdjustment. A justificativa para dispensar requisitos exige pelo menos 10 caracteres e é registrada no histórico com o autor. Jogador mantém aprovação apenas quando a distribuição e os atributos que a fundamentam não mudam; não consegue aprovar nova exceção. Limites de níveis e vínculo classe/subclasse são invariantes. Nenhuma mudança nas permissões de proprietário, isolamento, versão esperada ou bloqueio por arquivamento.

## Textos narrativos

Description, personality, ideals, bonds, flaws e backstory seguem exatamente a autorização da ficha: mestre da campanha e proprietário autorizado; usuários de outras campanhas não podem consultar ou modificar. Não existe publicação automática da história no diário ou sessão. Edições são versionadas e auditadas, inclusive alterações pelo mestre.
