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
