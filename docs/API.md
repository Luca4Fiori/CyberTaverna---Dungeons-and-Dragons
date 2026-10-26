# API

## Disponível

| Método | Rota                    | Resposta                                                          |
| ------ | ----------------------- | ----------------------------------------------------------------- |
| GET    | web `/api/health/live`  | 200 `{ "status": "ok", "service": "web", "stage": "foundation" }` |
| GET    | realtime `/health/live` | 200 com service realtime e multiplayer false                      |

Saúde indica processo ativo; não é readiness do banco. Outras rotas HTTP do realtime retornam 404. Páginas públicas: `/`, `/campanhas`, `/personagens`, `/biblioteca`, `/preferencias`, `/status`, `/atribuicoes`.

## Planejado — não implementado

Etapa 1: `/api/auth/register`, `/api/auth/login`, `/api/auth/logout`, `/api/me`; `/api/campaigns`, `/api/campaigns/:id/members`, `/api/campaigns/:id/invites`, `/api/invites/accept`; personagens, sessões, mapas, tokens e rolagens sob a campanha.

Validar Zod no servidor, rejeitar campos desconhecidos, obter actor da sessão. Contrato futuro de erro `{ error: { code, message, requestId } }`, nunca stack trace. Códigos 400 validação, 401 sem sessão, 403 proibido, 404 recurso indisponível, 409 conflito de versão, 429 limite. Listas terão cursor e limite máximo 100. Mutação deverá receber versão esperada quando editável concorrentemente.

Credenciais, recuperação de senha e uploads ainda não têm endpoints. Não encaminhar dados reais aos caminhos planejados.
