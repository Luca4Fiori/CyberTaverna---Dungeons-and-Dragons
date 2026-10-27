# API atual

Base `/api`, JSON, sem cache de respostas privadas. Mutações exigem `Origin` igual a APP_URL, Content-Type JSON e corpo até 16 KiB. Sessão por cookie HttpOnly; não enviar token no JSON. Erros `{ error: { code, message } }` (podem incluir requestId), sem stack. 400 validação, 401 sessão inválida, 403 proibido, 404 recurso indisponível, 409 conflito/arquivamento, 429 limite, 503 integração ausente.

| Método    | Caminho                                 | Contrato resumido                                                 |
| --------- | --------------------------------------- | ----------------------------------------------------------------- |
| GET       | /health/live, /health/ready             | Processo; readiness consulta PostgreSQL                           |
| POST      | /auth/register                          | email, password, displayName; cria USER                           |
| POST      | /auth/login                             | email, password; cookie de sessão                                 |
| POST      | /auth/logout                            | revoga sessão e cookie                                            |
| POST      | /auth/forgot                            | email; envio SMTP se configurado; resposta não revela conta       |
| POST      | /auth/reset                             | token, password; uso único, revoga sessões                        |
| GET/PATCH | /me                                     | perfil; PATCH displayName, timezone                               |
| GET/POST  | /campaigns                              | lista com page (20/página); criação name, description opcional    |
| GET/PATCH | /campaigns/:id                          | detalhes; PATCH name, description, archived                       |
| GET/POST  | /campaigns/:id/invites                  | mestre; criação expiresInHours, maxUses; token/link só na criação |
| DELETE    | /campaigns/:id/invites/:inviteId        | mestre revoga                                                     |
| POST      | /invites/accept                         | token; entra PLAYER, idempotente para membro                      |
| PATCH     | /campaigns/:id/character-settings       | mestre: playersCanCreateCharacters, playersCanEditCharacters      |
| GET/POST  | /campaigns/:id/characters               | listagem page, 20/página; criação de ficha                        |
| GET/PATCH | /campaigns/:id/characters/:characterId  | ficha autorizada; PATCH exige expectedVersion                     |
| GET/POST  | /campaigns/:id/sessions                 | até 50 sessões; mestre cria title, description opcional           |
| GET/PATCH | /campaigns/:id/sessions/:sessionId      | sala; mestre altera status PLANNED/ACTIVE/FINISHED/CANCELLED      |
| POST      | /campaigns/:id/sessions/:sessionId/join | characterId; opcional para GM; ficha própria para jogador         |

Ficha: name, className, species, level (1–20), experience, hitPoints, maxHitPoints, temporaryHitPoints, armorClass, attributes {STR,DEX,CON,INT,WIS,CHA} inteiros 1–30. PV atuais não excedem máximos. ownerId opcional, só mestre pode atribuir a outro membro. PATCH envia todos os campos editáveis e expectedVersion; resposta contém modifiers, proficiency, canEdit e version. Campos adicionais são rejeitados. Contratos exatos em packages/contracts/src/core.ts, characters.ts e game-sessions.ts.

Limites atuais: participantes da campanha/sala até 100 na consulta; seletor inicial da sala usa primeira página de 20 fichas. Não há exclusão de ficha, saída da sala, delegação individual, mapa ou eventos Socket.IO nesta entrega. IDs da campanha sempre são verificados contra a associação do usuário. Dados de fichas alheias nunca são enviados a jogadores.
