# Tempo real

## Fundação executável

Socket.IO 4 em serviço Node separado. Origem exata em WEB_ORIGIN; verificação de Origin também no handshake WebSocket, limite de payload 16 KiB, cliente embutido desativado, encerramento gracioso. Todas as conexões recebem AUTH_NOT_IMPLEMENTED. Testes exercitam saúde e rejeição de autenticação/origem. Sem broadcast, salas ou persistência ativa.

## Protocolo previsto

Salas internas `campaign:<id>:session:<id>`, entrada após sessão autenticada e associação verificada. Sala não é autorização suficiente. Cada evento valida payload, suspensão, associação, recurso e ação, com rate limit por usuário/conexão.

Eventos futuros: `session:join`, `session:leave`, `session:state`, `token:move`, `character:update`, `character:hp`, `dice:roll`, `map:change`, `object:create`, `object:remove`, `effect:update`, `chat:message`. Schemas de entrada de sessão e movimento já existem; ainda não são handlers expostos.

Acknowledgement futuro `{ ok, version, error? }`; atualizar banco em transação antes do ack e emissão. Movimento usa expectedVersion; alteração concorrente retorna conflito e snapshot autorizado. Cliente pode interpolar localmente, mas deve reconciliar com estado oficial. Reconexão refaz autenticação e recupera snapshot persistido, não depende de eventos perdidos.

Dados secretos exigem projeção por destinatário ou canais privados, não broadcast irrestrito. Rolagens oficiais usarão node:crypto.randomInt no servidor e registro transacional; públicas, privadas e GM terão políticas distintas. Implementar limites e idempotência antes de permitir eventos de jogo.
