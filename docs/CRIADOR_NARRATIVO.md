# Assistente e narrativa — 29/10/2026

## Experiência de criação e edição

O assistente tem sete etapas: Identidade; Espécie e antecedente; Classes e subclasses; Atributos e defesas; História e personalidade; Recursos e habilidades; Revisão final. Apenas a etapa ativa é montada. Anterior/Continuar preservam os valores no estado do formulário. A revisão permite voltar diretamente a qualquer etapa anterior para corrigir informações.

POST/PATCH só acontece ao confirmar **Salvar personagem**, na revisão. Não existe rascunho automático. Recarregar ou fechar uma ficha nova antes de salvar pode perder o preenchimento; navegar entre etapas não perde escolhas. Fichas existentes abrem no mesmo assistente, com os dados carregados do banco e controle de versão preservado.

Identidade aceita nome, experiência, responsável quando mestre e URL HTTPS opcional de imagem. A imagem é um link informado pelo usuário; não há upload, armazenamento nem download da imagem pelo servidor.

## Narrativa independente do antecedente

| Campo da API/PostgreSQL | Rótulo                            | Limite            |
| ----------------------- | --------------------------------- | ----------------- |
| description             | Descrição física e comportamental | 5.000 caracteres  |
| personality             | Personalidade                     | 5.000 caracteres  |
| ideals                  | Ideais                            | 5.000 caracteres  |
| bonds                   | Vínculos                          | 5.000 caracteres  |
| flaws                   | Fraquezas                         | 5.000 caracteres  |
| backstory               | História do personagem            | 20.000 caracteres |

Todos são opcionais no contrato, com string vazia por padrão no banco. São colunas TEXT independentes de backgroundId/backgroundName. Parágrafos e quebras de linha são preservados. Textareas amplas têm redimensionamento vertical, crescimento até uma altura confortável e rolagem para textos longos. O contador informa o limite; não há limite de poucas linhas.

Não são aplicados atributos, talentos, magias ou habilidades a partir da narrativa. A etapa Recursos mostra apenas PV, PV temporários e CA já implementados e informa quais recursos futuros ainda estão indisponíveis.

## Segurança, persistência e compatibilidade

Migração `202610290003_character_narrative` acrescenta seis colunas sem remover ou reclassificar fichas, classes, antecedentes, donos, campanhas ou participações. Caso exista texto em biography, introduzido na migração de identidade anterior, ele é copiado para backstory; a coluna antiga é preservada para compatibilidade. O assistente passa a editar os seis campos separados.

Clientes que omitem campos narrativos em PATCH preservam os valores existentes. Enviar string vazia limpa explicitamente o campo. O serviço transacional, expectedVersion, histórico, arquivamento e autorização existentes continuam aplicáveis: mestre da campanha consulta/edita; jogador acessa apenas suas fichas autorizadas; terceiros não recebem os textos.

Textos são tratados como texto simples, sem interpretar HTML ou Markdown. React escapa sua exibição; não se usa dangerouslySetInnerHTML. Conteúdo semelhante a tags pode ser armazenado literalmente sem criar elementos ou executar código. Não há processamento de comandos, SQL concatenado ou execução de scripts a partir desses campos.

Zod valida limites por campo. Apenas POST/PATCH de fichas aceitam corpo de até **256 KiB**, medido durante a leitura, para comportar textos UTF-8. Os demais endpoints continuam com **16 KiB**. Origem, tipo JSON, autenticação, autorização e rate limiting permanecem ativos.

## Classes e subclasses

Cada classe possui cartão com nome, subclasse, edição e nível; somente um cartão fica expandido para edição. Filtros de edição/fonte e configurações de regras ficam em opções avançadas. Seleções indicam SRD, referência externa ou personalizada. A progressão opcional usa uma seleção de classe por nível, substituindo texto separado por vírgulas. Alterar a ordem redistribui os níveis; alterar quantidades ou adicionar/remover classes limpa a sequência, com aviso visível. Não inferimos ordem histórica de fichas antigas.

Investigação do caso Monge 4: nome manual sem classId não tem vínculo automático ao catálogo; filtros locais de fonte/edição também podiam sobreviver à troca de classe. Agora a UI explica o vínculo manual, oferece seleção explícita, mantém limpar filtros e reinicia os filtros de subclasse quando a classe muda. Monge SRD nível 4 inclui Guerreiro da Mão Aberta e as referências elegíveis, sem exigir que edição da subclasse seja igual à da classe. A validação de compatibilidade do servidor permanece em vigor.

## Fora deste incremento

Catálogo PostgreSQL e importador JSON/CSV, solicitados anteriormente, ficaram pendentes após a prioridade explícita no redesign narrativo. O catálogo continua estático com IDs preservados. Não foram implementados recursos fictícios, automação de habilidades, inventário, upload, colaboração em tempo real ou novas regras de RPG.
