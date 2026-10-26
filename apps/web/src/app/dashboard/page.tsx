import Link from "next/link";
import { viewer } from "@/server/viewer";
import { CoreForm } from "@/components/core-form";
export default async function Page() {
  const { user } = await viewer();
  return (
    <>
      <p className="eyebrow">SUA CONTA</p>
      <h1>Bem-vindo, {user.displayName}</h1>
      <p className="lead">
        Você pode ser mestre em uma campanha e jogador em outra. Os acessos são
        independentes.
      </p>
      <div className="inline-links">
        <Link className="button" href="/campanhas">
          Minhas campanhas
        </Link>
        <Link className="button" href="/perfil">
          Editar perfil
        </Link>
        <Link className="button" href="/convites">
          Aceitar convite
        </Link>
      </div>
      <CoreForm
        endpoint="/api/auth/logout"
        label="Sair da conta"
        redirectTo="/login"
      />
    </>
  );
}
