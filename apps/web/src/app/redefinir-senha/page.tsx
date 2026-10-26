import { CoreForm } from "@/components/core-form";
import Link from "next/link";
export default function Page() {
  return (
    <>
      <h1>Definir nova senha</h1>
      <p className="lead">
        Ao concluir, todas as sessões anteriores serão encerradas.
      </p>
      <CoreForm
        endpoint="/api/auth/reset"
        label="Redefinir senha"
        tokenFromFragment
        fields={[
          {
            name: "password",
            label: "Nova senha",
            type: "password",
            min: 12,
            max: 128,
            autoComplete: "new-password",
          },
        ]}
      />
      <Link className="button" href="/login">
        Voltar ao login
      </Link>
    </>
  );
}
