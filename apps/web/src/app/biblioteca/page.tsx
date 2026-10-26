import { ModulePage } from "@/components/module-page";
export default function Page() {
  return (
    <ModulePage
      title="Biblioteca de regras"
      description="Conhecimento para explorar novos caminhos."
      stage="ETAPA 2"
      items={[
        "Conteúdos licenciados do SRD 5.2.1",
        "Pesquisa e filtros por categoria",
        "Origem e atribuição de cada conteúdo",
      ]}
    />
  );
}
