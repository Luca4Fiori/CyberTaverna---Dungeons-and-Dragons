# Permissões

## Implementado

Funções puras `canManageCampaign` e `canMoveToken`, cobertas por testes de isolamento. Ainda não estão ligadas a CRUD, pois CRUD não existe. Realtime bloqueia todas as conexões com AUTH_NOT_IMPLEMENTED.

## Contrato para implementação

| Ação                            | Administrador global            | GM da campanha            | Jogador membro       |
| ------------------------------- | ------------------------------- | ------------------------- | -------------------- |
| Contas, suspensão, moderação    | Sim, com auditoria              | Não                       | Não                  |
| Configurar campanha e membros   | Sem acesso implícito a segredos | Sim                       | Não                  |
| Editar fichas                   | Sem acesso implícito            | Todas da campanha         | Própria se permitido |
| Mover token                     | Sem acesso implícito            | Todos da campanha         | Somente controlados  |
| Notas secretas                  | Sem acesso implícito            | Conforme autoria/política | Não                  |
| Regras públicas e mapa liberado | Sim                             | Sim                       | Sim                  |

Não existe papel global de mestre. Requisições devem consultar sessão válida, suspensão, associação e ação. IDs fornecidos pelo cliente não concedem autoridade. Objetos invisíveis e notas privadas são filtrados no servidor antes de serializar; nunca enviar todos os objetos para esconder no cliente.

Mutação autenticada por cookie verificará origem e proteção CSRF; logins/convites/uploads terão rate limit. Admin não será aceito em payload público; provisionamento futuro por comando local explícito com auditoria e sem senha padrão. Testes futuros cobrirão IDOR, expiração, usuário suspenso, revogação e privilégios cruzados.
