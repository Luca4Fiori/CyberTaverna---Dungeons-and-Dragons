import { viewer } from "@/server/viewer";
import { CoreForm } from "@/components/core-form";
export default async function Page() {
  await viewer();
  return (
    <>
      <h1>Criar campanha</h1>
      <p className="lead">Você será o mestre desta campanha.</p>
      <CoreForm
        endpoint="/api/campaigns"
        label="Criar campanha"
        resultRoute="campaign"
        fields={[
          { name: "name", label: "Nome da campanha", min: 2, max: 120 },
          {
            name: "description",
            label: "Descrição",
            type: "textarea",
            max: 10000,
          },
        ]}
      />
    </>
  );
}
