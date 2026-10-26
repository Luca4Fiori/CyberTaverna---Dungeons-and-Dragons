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

FKs compostas garantem que dono de ficha, controlador de token e autor de nota pertençam à mesma campanha; tokens pertencem a mapas da mesma campanha. Remover um membro com conteúdo dependente exige transferência/remoção explícita em transação. Não confundir essa integridade com autorização: toda consulta também deverá filtrar campanha e participante. Nenhum RLS configurado nesta etapa.

Índices cobrem participação por usuário, convites, agenda, visibilidade de tokens e auditoria cronológica. Checks SQL complementam limites numéricos e códigos de atributos. Email deverá ser normalizado pelo serviço na etapa 1 antes da gravação; índice único atual é sensível a maiúsculas.

Arquivar campanha será a operação usual; exclusão física futura exige autorização e confirmação, e cascata remove os filhos. AuditLog mantém referências nulas após exclusão de campanha/usuário; metadados devem ser minimizados para não reter dados sensíveis. Histórico guarda deltas em JSON, não a sessão inteira.

Criação da campanha e primeiro membro GM serão atômicas. O serviço deverá impedir remoção do último GM. Uso de convite terá incremento condicional e inclusão de membro na mesma transação; expiração/limite não são garantidos apenas pela interface.

Entidades ainda não modeladas: inventário, magias, habilidades, camadas, objetos, encontros, participantes, iniciativa, NPCs, criaturas, dados, chat, eventos, conteúdos SRD/homebrew, notificações e denúncias. Serão adicionadas por migrações nas etapas correspondentes, com relações e isolamento próprios. Dados flexíveis limitados a ajustes e deltas; nunca substituir toda a sessão por JSON.
