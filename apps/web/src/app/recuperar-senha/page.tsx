import { CoreForm } from "@/components/core-form";
export default function Page() {
  return (
    <>
      <p className="eyebrow">RECUPERAR ACESSO</p>
      <h1>Esqueceu sua senha?</h1>
      <p className="lead">
        Enviaremos um link de uso único, válido por 30 minutos, se existir uma
        conta ativa com o email informado. O envio depende de um provedor SMTP
        configurado.
      </p>
      <CoreForm
        endpoint="/api/auth/forgot"
        label="Solicitar recuperação"
        fields={[
          {
            name: "email",
            label: "Email",
            type: "email",
            autoComplete: "email",
          },
        ]}
      />
    </>
  );
}
