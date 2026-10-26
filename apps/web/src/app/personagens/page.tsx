import { ModulePage } from "@/components/module-page";
export default function Page() {
  return (
    <ModulePage
      title="Seus personagens"
      description="Dê forma ao próximo herói da sua história."
      stage="ETAPAS 1 E 2"
      items={[
        "Fichas básicas persistidas na etapa 1",
        "Magias, inventário e evolução na etapa 2",
        "Importação e exportação PDF na etapa 4",
      ]}
    />
  );
}
