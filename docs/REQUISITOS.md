# Requisitos do CT RPG

Fonte: prompt mestre do projeto recebido em 26/10/2026. Escopo final preservado; a entrega inicial cobre somente fundação. Interface pt-BR; produção pretendida ct.dungeonsanddragons.com.br sem acesso presumido.

## Funcionais

- Usuários: cadastro, login, perfil, sessões seguras, recuperação condicionada a SMTP; administrador global separado dos papéis GM/PLAYER por campanha.
- Campanhas independentes: criar/editar/arquivar/excluir, capa, membros e permissões, convites expirados/revogáveis/limitados, configurações e regras próprias; exemplo original temático de Tiamat sem acoplamento ao núcleo.
- Sessões: título, descrição, agenda UTC, estado, participantes, mapa, notas e histórico.
- Fichas: nome/imagem, classe/subclasse/espécie/antecedente, nível/XP, atributos/modificadores, proficiências/perícias/salvaguardas, CA/iniciativa/deslocamento, PV/temporários/dados de vida, idiomas, recursos, habilidades, magias, equipamentos/inventário/moedas e narrativa. Edição autorizada por mestre e jogador, cálculos, ajustes caseiros, evolução e histórico.
- PDF: exportar e importar somente modelos documentados, informar campos desconhecidos.
- Mesa PixiJS/WebGL: upload/cenas, grade/escala/alinhamento, zoom/pan, camadas/visibilidade, troca de mapas/autosave, desenho/medição/marcadores/áreas/névoa. Tokens de personagem/NPC/monstro/objeto, imagem/nome/posição/tamanho/rotação/condições/permissões/ficha; seleção múltipla, arrastar, portas/baús/armadilhas configuráveis.
- Entradas: mouse, teclado, menus contextuais, scroll, toque e pinça com prevenção de movimentos acidentais.
- Tempo real: salas isoladas, entrada/saída, fichas/PV, tokens, mapas/objetos/efeitos, mensagens/dados/estado. Autenticação/autorização por evento, reconexão, snapshot, conflitos, rate limit e persistência.
- Dados: d4/d6/d8/d10/d12/d20/d100, múltiplos/modificadores/vantagem/desvantagem, histórico público/privado/GM, integração com testes e ataques, resultado oficial gerado no servidor.
- Combate: encontros, participantes, iniciativa, rodadas/turnos, PV, condições, efeitos/recursos, criaturas, registro e intervenção manual.
- Biblioteca: classes/subclasses/espécies/antecedentes/magias/itens/equipamentos/monstros/condições/regras, pesquisa/filtros/detalhes/referências e conteúdo próprio. SRD 5.2.1 CC BY 4.0, origem/licença por item, traduções verificadas, denúncia de homebrew.
- Comunicação: chat de sessão/remetentes/histórico/privadas, notas privadas, diário, eventos, resumos e agenda.
- Administração: usuários/suspensão, campanhas, denúncias/moderação, conteúdos globais, arquivos/limites, relatórios/configurações e auditoria; provisionamento seguro do primeiro admin.
- Imersão: transições/neve/gelo/luz/magia/movimento/habilidades/dados; camadas independentes, redução de movimento, qualidade e desligamento. Futuro Three.js, iluminação dinâmica, áudio/clima/elementos animados.

## Não funcionais

Next.js/React/TypeScript strict/Tailwind/Lucide; Node/Zod/Socket.IO; PostgreSQL/Prisma/migrações; S3 e armazenamento local; componentes acessíveis e responsivos. Servidor autoriza toda ação e filtra segredos. CSRF/XSS, limites de arquivo, validação de conteúdo, erros consistentes, CORS restrito, segredos externos, auditoria, paginação. Testes unitários/integração/E2E, lint/formatação, Docker, backups/restauração, monitoramento e documentação.

## Navegação alvo

Públicas: inicial/login/cadastro/recuperação/termos. Usuário: dashboard/perfil/campanhas/criação/detalhes/convites/personagens/criação/ficha/biblioteca. Sessão: mesa/dados/encontros/chat/diário. Mestre: painel/configurações/jogadores/NPCs/mapas/homebrew. Admin: dashboard/usuários/denúncias/configurações. Podem ser abas consolidadas, mantendo todos os fluxos.
