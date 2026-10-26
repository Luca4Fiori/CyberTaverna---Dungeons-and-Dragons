import Link from "next/link";
import { CoreForm } from "@/components/core-form";
export default function Page() {
  return (
    <>
      <p className="eyebrow">BEM-VINDO DE VOLTA</p>
      <h1>Entrar na taverna</h1>
      <p className="lead">
        Use seu email e senha. Se acabou de criar sua conta, você já pode
        entrar.
      </p>
      <CoreForm
        endpoint="/api/auth/login"
        label="Entrar"
        redirectTo="/dashboard"
        fields={[
          {
            name: "email",
            label: "Email",
            type: "email",
            autoComplete: "email",
          },
          {
            name: "password",
            label: "Senha",
            type: "password",
            max: 128,
            autoComplete: "current-password",
          },
        ]}
      />
      <div className="inline-links">
        <Link href="/cadastro">Criar conta</Link>
        <Link href="/recuperar-senha">Esqueci minha senha</Link>
      </div>
    </>
  );
}
