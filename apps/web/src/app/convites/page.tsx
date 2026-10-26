import { viewer } from "@/server/viewer";
import { CoreForm } from "@/components/core-form";
export default async function Page() {
  await viewer();
  return (
    <>
      <h1>Aceitar convite</h1>
      <p className="lead">
        Cole o código do convite ou abra o link recebido depois de entrar na sua
        conta. Você entrará como jogador, sem alterar seus papéis em outras
        campanhas.
      </p>
      <CoreForm
        endpoint="/api/invites/accept"
        label="Entrar na campanha"
        tokenFromFragment
        resultRoute="invite"
      />
    </>
  );
}
