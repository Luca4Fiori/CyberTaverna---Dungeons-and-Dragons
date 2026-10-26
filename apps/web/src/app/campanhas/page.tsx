import { ModulePage } from "@/components/module-page";
export default function Page() {
  return (
    <ModulePage
      title="Suas campanhas"
      description="Muitos mundos. Um lugar para reunir seu grupo."
      stage="ETAPA 1"
      items={[
        "Criar e administrar campanhas",
        "Convidar jogadores com acesso seguro",
        "Organizar personagens e sessões",
      ]}
    />
  );
}
