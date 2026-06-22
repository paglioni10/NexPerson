import { notFound } from "next/navigation";
import { PageHeader } from "@/components/ui";
import { getColaborador } from "@/lib/repo";
import { ColaboradorForm } from "../ColaboradorForm";

export const dynamic = "force-dynamic";

export default async function EditarColaboradorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const colaborador = await getColaborador(Number(id));
  if (!colaborador) notFound();

  return (
    <div>
      <PageHeader title={`Editar — ${colaborador.nome}`} />
      <ColaboradorForm colaborador={colaborador} />
    </div>
  );
}
