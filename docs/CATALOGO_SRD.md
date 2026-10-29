# Catálogo de criação — SRD 5.2.1

## Fonte e licença

Fonte oficial consultada em **28/10/2026**: [página SRD](https://www.dndbeyond.com/srd) e [PDF inglês 5.2.1](https://media.dndbeyond.com/compendium-images/srd/5.2/SRD_CC_v5.2.1.pdf), sob [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/legalcode).

This work includes material from the System Reference Document 5.2.1 (“SRD 5.2.1”) by Wizards of the Coast LLC, available at https://www.dndbeyond.com/srd. The SRD 5.2.1 is licensed under the Creative Commons Attribution 4.0 International License, available at https://creativecommons.org/licenses/by/4.0/legalcode.

Os nomes em português e as descrições breves são adaptações feitas para o CyberTaverna a partir da fonte inglesa, não uma tradução oficial. Não copiamos traduções de terceiros. As descrições são resumos de orientação, sem reproduzir textos completos de habilidades ou livros fora do SRD. Esta adaptação do catálogo mantém atribuição CC BY 4.0. Não há afiliação ou endosso oficial.

## Cobertura inicial

`packages/catalog/src/index.ts` contém IDs estáveis com prefixo `srd521-`, nome em português, nome original, descrição própria, página e metadados da fonte/licença em cada opção.

- 12 classes: Bárbaro, Bardo, Clérigo, Druida, Guerreiro, Monge, Paladino, Patrulheiro, Ladino, Feiticeiro, Bruxo e Mago (p. 28–82).
- 9 espécies: Draconato, Anão, Elfo, Gnomo, Golias, Halfling, Humano, Orc e Tiefling (p. 84–86).
- 4 antecedentes: Acólito, Criminoso, Sábio e Soldado (p. 83).
- Uma subclasse por classe, somente as presentes no SRD: Caminho do Berserker, Colégio do Conhecimento, Domínio da Vida, Círculo da Terra, Campeão, Guerreiro da Mão Aberta, Juramento da Devoção, Caçador, Ladrão, Feitiçaria Dracônica, Patrono Ínfero e Evocador. A seleção de catálogo exige a classe correspondente e nível 3 ou superior. Páginas individuais ficam em cada registro.

A expansão de 29/10/2026 acrescenta referências de nomes e fontes de livros comerciais, sem suas regras, conforme [MULTICLASSE.md](MULTICLASSE.md). Antecedente/subclasse podem ficar sem escolha nesta entrega progressiva. Classe e espécie são obrigatórias, com alternativa personalizada. Personalizações não recebem ID nem atribuição de origem SRD; a pessoa deve ter direito de usar seu conteúdo.

## Separação de responsabilidades

- Catálogo: dados de referência e busca sem acentos; nenhum efeito aplicado à ficha.
- Contratos Zod: formatos, limites e números válidos.
- Domínio: autorização e validação de IDs, nome correspondente e disponibilidade da subclasse.
- Motor de regras: modificadores e proficiência em `packages/rules`; não depende da UI.
- Interface: quatro etapas, revisão, modo manual e feedback de gravação.

Ainda não automatizados: bônus de antecedentes, talentos, linhagens, habilidades, proficiências, magias, PV, CA, inventário e evolução automática. Os atributos são valores finais informados pelo usuário. Desde 29/10/2026, a subclasse é validada pelo nível de sua classe, e a distribuição multiclasse é persistida separadamente. Não interpretar uma seleção no catálogo como implementação dessas regras.

## Compatibilidade e migração

Migração `202610280001_character_catalog` apenas acrescenta colunas opcionais de IDs e nomes com valores vazios iniciais. Não altera IDs de fichas, campaignId, ownerId, atributos, histórico ou participações. Nomes antigos permanecem texto manual; nenhum vínculo é inferido por semelhança de nome. A associação à campanha continua vindo da rota autorizada, não do corpo da requisição.

PATCH antigo que omite os novos campos os preserva. Para mudar livremente um nome associado ao catálogo, envie o respectivo ID como null (a UI faz isso no modo manual); o servidor rejeita rótulos falsificados. Dados novos entram no histórico versionado já existente. Não foram modificadas migrações antigas.
