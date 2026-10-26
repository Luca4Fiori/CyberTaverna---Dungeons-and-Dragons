import Link from "next/link";
import { CoreForm } from "@/components/core-form";
export default function Page() {
  return (
    <>
      <p className="eyebrow">SEU PRIMEIRO CAPÍTULO</p>
      <h1>Criar conta</h1>
      <p className="lead">
        Use uma senha única com pelo menos 12 caracteres. O papel de mestre será
        definido nas campanhas que você criar.
      </p>
      <CoreForm
        endpoint="/api/auth/register"
        label="Criar minha conta"
        redirectTo="/login"
        fields={[
          {
            name: "displayName",
            label: "Nome de exibição",
            min: 2,
            max: 80,
            autoComplete: "nickname",
          },
          {
            name: "email",
            label: "Email",
            type: "email",
            max: 254,
            autoComplete: "email",
          },
          {
            name: "password",
            label: "Senha",
            type: "password",
            min: 12,
            max: 128,
            autoComplete: "new-password",
          },
        ]}
      />
      <Link className="button" href="/login">
        Já tenho uma conta
      </Link>
    </>
  );
}
