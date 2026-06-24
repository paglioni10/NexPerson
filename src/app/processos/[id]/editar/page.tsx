import { notFound } from "next/navigation";
import { PageHeader } from "@/components/ui";
import { getProcesso } from "@/lib/repo";
import { ProcessoForm } from "../../ProcessoForm";

export const dynamic = "force-dynamic";

export default async function EditarProcessoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const processo = await getProcesso(Number(id));
  if (!processo) notFound();

  return (
    <div>
      <PageHeader title={`Editar, ${processo.nome}`} />
      <ProcessoForm processo={processo} />
    </div>
  );
}
