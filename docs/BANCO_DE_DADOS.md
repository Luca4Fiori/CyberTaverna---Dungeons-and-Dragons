# Banco de dados

Esquema em `packages/database/prisma/schema.prisma`. IDs UUID, instantes timestamptz UTC, exibição futura por Intl.DateTimeFormat com fuso do perfil (padrão America/Sao_Paulo).

| Entidade                       | Relação e responsabilidade                             |
| ------------------------------ | ------------------------------------------------------ |
| User / UserProfile             | Identidade, papel global, suspensão, preferências      |
| Session                        | Sessão de autenticação, hash do token, expiração       |
| Campaign / CampaignSettings    | Campanha, arquivo lógico, políticas e ajustes homebrew |
| CampaignMember                 | Chave composta campanha/usuário; GM ou PLAYER          |
| CampaignInvite                 | Hash único, prazo, revogação, limite e contagem        |
| Character / CharacterAttribute | Ficha básica e atributos normalizados                  |
| CharacterHistory               | Histórico versionado por ficha                         |
| GameSession                    | Sessão de jogo, agenda e estado; diferente de Session  |
| BattleMap / Token              | Cena, posições, controle, visibilidade e versão        |
| CampaignNote                   | Nota privada por padrão, autor membro                  |
| UploadedAsset                  | Metadados e chave de objeto, sem binários no banco     |
| AuditLog                       | Ações administrativas e de campanha                    |

FKs compostas garantem que dono de ficha, controlador de token e autor de nota pertençam à mesma campanha; tokens pertencem a mapas da mesma campanha. Remover um membro com conteúdo dependente exige transferência/remoção explícita em transação. Não confundir essa integridade com autorização: as consultas dos serviços filtram campanha e participante. Nenhum RLS configurado nesta etapa.

Índices cobrem participação por usuário, convites, agenda, visibilidade de tokens e auditoria cronológica. Checks SQL complementam limites numéricos e códigos de atributos. Email é normalizado pelo serviço antes da gravação; índice único atual é sensível a maiúsculas.

Arquivar campanha é a operação usual; exclusão física futura exige autorização e confirmação, e cascata remove os filhos. AuditLog mantém referências nulas após exclusão de campanha/usuário; metadados devem ser minimizados para não reter dados sensíveis. Histórico guarda deltas em JSON, não a sessão inteira.

Criação da campanha e primeiro membro GM são atômicas. O serviço deverá impedir remoção do último GM. Uso de convite tem validação de limite e inclusão de membro na mesma transação; expiração/limite não são garantidos apenas pela interface.

Entidades ainda não modeladas: inventário, magias, habilidades, camadas, objetos, encontros, participantes de encontro, iniciativa, NPCs, criaturas, dados, chat, eventos, conteúdos SRD/homebrew, notificações e denúncias. Serão adicionadas por migrações nas etapas correspondentes, com relações e isolamento próprios. Dados flexíveis limitados a ajustes e deltas; nunca substituir toda a sessão por JSON.

## Migrações e núcleo implementado em 27/10/2026

As migrações foundation, auth_recovery e characters_and_session_lobby estão aplicadas em ct_rpg e ct_rpg_test. PasswordResetToken armazena hash/expiração/consumo; RateLimitBucket mantém contadores atômicos. Character inclui classe e espécie textuais, seis CharacterAttribute e histórico versionado. GameSessionParticipant usa chave campanha/sessão/usuário e FKs compostas para sessão, membro e personagem da mesma campanha. A participação é persistida, não um indicador de conexão.

Email é normalizado no serviço; campanha e primeiro GM são criados atomicamente. Aceite de convite bloqueia a linha de campanha, valida expiração/revogação/usos e grava membro/contador em transação. Arquivamento já está disponível e revoga convites. Exclusão e remoção/transferência de membros ainda não são APIs públicas.

Edições de ficha exigem expectedVersion, incrementam versão e registram antes/depois no histórico na mesma transação. Campos classe/espécie vazios preservam registros legados até preenchimento. Inventário, magias e habilidades continuam pendentes como entidades próprias. Participantes de sessão já estão modelados; participantes de encontros ainda não.

## Migração character_catalog — 28/10/2026

Character recebe classId, speciesId, backgroundId e subclassId opcionais (IDs do catálogo versionado), backgroundName e subclassName com padrão vazio. São referências validadas pelo domínio a dados de código, não FKs para tabelas inexistentes. Rótulos e relações antigos são mantidos integralmente. Migração aditiva testada em tabela temporária de PostgreSQL; sem reset ou alteração de migrações anteriores.

## Migração 202610290001_multiclass

`CharacterClass` tem chave composta characterId/position, FK Character com CASCADE, classe/subclasse, nível, versão de regras, fontes separadas e array opcional de níveis de aquisição. CHECKs limitam posição e nível. `Character.multiclassAdjustment` guarda a justificativa atual; aprovação e alterações são preservadas no histórico versionado com actorId. Migração copia cada ficha para um vínculo, preservando colunas antigas, dono, campanha e referências de sessão. Soma, identidade de catálogo e requisitos são validados no serviço, sob bloqueio transacional da campanha. [Contrato e limitações](MULTICLASSE.md).
