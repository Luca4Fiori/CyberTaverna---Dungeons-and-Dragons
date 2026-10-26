import { viewer } from "@/server/viewer";
import { CoreForm } from "@/components/core-form";
export default async function Page() {
  const { user } = await viewer();
  return (
    <>
      <h1>Meu perfil</h1>
      <p className="lead">{user.email}</p>
      <CoreForm
        endpoint="/api/me"
        method="PATCH"
        label="Salvar perfil"
        fields={[
          {
            name: "displayName",
            label: "Nome de exibição",
            value: user.displayName,
            min: 2,
            max: 80,
          },
          {
            name: "timezone",
            label: "Fuso horário",
            value: user.timezone,
            max: 80,
          },
        ]}
      />
      <p className="lead">
        Use um fuso como America/Sao_Paulo. A alteração do email não está
        disponível nesta versão.
      </p>
    </>
  );
}
