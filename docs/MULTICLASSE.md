# Catálogo versionado e multiclasse — 29/10/2026

## Escopo entregue

Cada ficha tem um ou mais vínculos `CharacterClass`. A classe, sua subclasse e seus níveis permanecem juntos. O nível total é a soma e a proficiência usa esse total. As fontes da classe e da subclasse são independentes: Monge SRD 2024 pode ter Warrior of Mercy PHB 2024; Patrulheiro SRD 2024 pode apontar para Swarmkeeper Tasha 2020.

`packages/catalog/src/library.ts` reúne fontes e registros tipados de classe, subclasse, espécie, antecedente, habilidade, talento e magia. As três últimas categorias têm estrutura preparada, mas ainda não contêm registros implementados. Cada opção referencia nome, edição, versão, licença, condição de uso e URL da fonte. IDs versionados são imutáveis; mudanças de edição recebem novos IDs. O catálogo é versionado no código e separado do motor de regras. Não há importação de APIs privadas nem scraping.

## Fontes e disponibilidade

| Fonte                                                  | Uso nesta entrega                                                                              | Condição                                                                                        |
| ------------------------------------------------------ | ---------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| SRD 5.2.1, regras 2024                                 | 12 classes, 12 subclasses, 9 espécies e 4 antecedentes; resumos próprios; cálculos básicos     | Documento integral redistribuível sob CC BY 4.0; implementação parcial, não biblioteca integral |
| Player’s Handbook 2024                                 | Warrior of Mercy                                                                               | Somente nome, origem e vínculo com Monge; regras externas                                       |
| Tasha’s Cauldron of Everything 2020, regras 2014       | Swarmkeeper e Way of Mercy (distinta da revisão de 2024)                                       | Somente referências; regras externas                                                            |
| Mordenkainen Presents: Monsters of the Multiverse 2022 | Shadar-kai dessa versão específica                                                             | Somente referência; não confundir com a versão de 2018                                          |
| Sword Coast Adventurer’s Guide 2015                    | Mercenary Veteran                                                                              | Somente referência; adaptação manual                                                            |
| Conteúdo personalizado                                 | Nomes manuais na ficha; regras da classe identificadas como personalizadas ou edição declarada | Conteúdo do usuário, sem presumir licença de redistribuição                                     |

Fontes primárias consultadas: [SRD oficial](https://www.dndbeyond.com/srd), [PDF SRD 5.2.1](https://media.dndbeyond.com/compendium-images/srd/5.2/SRD_CC_v5.2.1.pdf), [atualizações do PHB 2024](https://www.dndbeyond.com/posts/1810-updates-in-the-players-handbook-2024), [sumário de Tasha](https://www.dndbeyond.com/sources/dnd/tcoe), [sumário de Monsters of the Multiverse](https://www.dndbeyond.com/sources/dnd/motm), [referência pública de antecedentes SCAG](https://www.dndbeyond.com/posts/783-heroic-chronicle-sword-coast-and-the-north).

A atribuição CC BY do SRD permanece em `CATALOGO_SRD.md` e `/atribuicoes`. As traduções de nomes são próprias, não oficiais. Nenhuma dessas referências concede acesso aos livros ou significa que suas regras foram implementadas. Reprodução de textos proprietários ou integração a serviços licenciados exige autorização e contrato apropriados; nenhuma integração desse tipo foi criada.

## Regras e autorização

- Um vínculo por classe, níveis inteiros de 1 a 20, total máximo 20. Total recebido no campo legado é substituído pela soma validada pelo servidor.
- Pré-requisitos do SRD 5.2.1, pp. 24–25: atributos primários de todas as classes devem atingir 13 em multiclasse. Guerreiro aceita Força **ou** Destreza; Monge e Patrulheiro exigem Destreza **e** Sabedoria; Paladino exige Força **e** Carisma. Classe única não recebe essa restrição.
- Subclasse registrada deve pertencer à classe selecionada e estar liberada pelo nível **daquela classe**, nunca pelo total. Classes SRD são da versão 2024. Referências anteriores não são renomeadas como revisões de 2024.
- Swarmkeeper permanece opção anterior com aviso de adaptação manual. Way of Mercy 2020, que tem revisão cadastrada, exige ajuste do mestre para uso com Monge 2024. Isso não automatiza a adaptação de habilidades.
- `multiclassAdjustment`: somente o mestre pode conceder/alterar, com justificativa mínima de 10 caracteres quando houver exceção. Autor, versão, antes/depois e justificativa ficam no histórico transacional. Jogadores podem manter uma exceção ao editar nome/PV; mudanças de atributos ou distribuição que ainda precisem de exceção exigem nova aprovação do mestre. Limites numéricos e associação classe/subclasse não são dispensados.
- `acquisitionLevels`: sequência opcional. Vazia significa ordem histórica desconhecida. Quando fornecida, todas as classes precisam cobrir exatamente os níveis de 1 até o total, sem repetição, e a quantidade de entradas de cada vínculo deve coincidir com seu nível. Não reconstruímos a ordem das fichas antigas.
- Personagem continua pertencendo à campanha e ao participante autorizados. Não há concessão global de poderes de mestre. Versão esperada, bloqueio por campanha, permissões de edição e isolamento existentes permanecem ativos.

## Persistência e compatibilidade de API

Migração `202610290001_multiclass`: adiciona tabela com chave `(characterId, position)`, vínculo com exclusão em cascata e restrições de níveis/posição; acrescenta justificativa à ficha; copia cada ficha existente para um vínculo único. Não apaga campos, atributos, histórico, participações, donos ou campanhas e não infere IDs pelo nome.

Os campos escalares antigos permanecem projeções para compatibilidade: `className/classId/subclassName/subclassId` representam o primeiro vínculo, `level` o total. Leituras detalhadas calculam o total pelos vínculos. Clientes atualizados devem usar `classes` para representar todas as classes. Atualizações antigas ainda funcionam para fichas simples; omitir `classes` numa ficha multiclasse retorna 409, evitando apagar silenciosamente a distribuição.

POST/PATCH de `/api/campaigns/:campaignId/characters` e `/api/campaigns/:campaignId/characters/:id` aceitam `classes` (array não vazio) e `multiclassAdjustment`. Cada item contém `classId`, `className`, `subclassId`, `subclassName`, `level`, `rulesVersion`, `sourceId`, `subclassSourceId` e `acquisitionLevels`. Fontes de opções registradas são determinadas pelo servidor. IDs de classe/subclasse são opcionais para conteúdo manual. PATCH continua exigindo `expectedVersion`. IDs/posição internos e metadados da resposta não devem ser enviados no corpo.

Exemplo executável exclusivamente em testes: `tests/fixtures/swarm.ts`. Não foi criado personagem fictício no banco de uso real.

## Limitações explícitas

Não há concessão automática de habilidades, talentos, magias, proficiências ou recursos de classe, nem agregação de espaços de magia, Ataque Extra, defesas alternativas ou evolução por XP. A disponibilidade da subclasse é validada por nível, mas sua mecânica continua manual. Antecedentes anteriores não concedem automaticamente atributos ou talentos de origem; combine a adaptação com o mestre e registre valores finais. Ainda faltam editor de biblioteca homebrew compartilhada, histórico de atributos por nível, ampliação das regras de compatibilidade e automação de progressão. O catálogo não pretende validar todo personagem D&D.

## Verificação local

`npm run db:generate`, `npm run db:test:prepare`, `npm test`, `npm run typecheck`, `npm run lint`, `npm run test:e2e` e `npm run db:validate`.

`node scripts/verify-multiclass-migration.mjs` aplica migrações apenas ao banco local `ct_rpg`, compara identidade/campos/vínculos/versão antes e depois sem imprimir dados pessoais e verifica que nenhuma ficha ficou sem classe. Não é uma ferramenta de backup nem substitui backups antes de uma implantação real.
