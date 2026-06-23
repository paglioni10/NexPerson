import Link from "next/link";
import { notFound } from "next/navigation";
import { CriticidadeBadge } from "@/components/CriticidadeBadge";
import { PageHeader } from "@/components/ui";
import { nivelLabel } from "@/lib/enums";
import {
  getAtividade,
  getNivelMinimoCapaz,
  getProcesso,
  getVinculos,
} from "@/lib/repo";
import { VinculosEditor } from "./VinculosEditor";

export const dynamic = "force-dynamic";

export default async function VinculosPage({
  params,
}: {
  params: Promise<{ id: string; aid: string }>;
}) {
  const { id, aid } = await params;
  const processoId = Number(id);
  const atividadeId = Number(aid);

  const [processo, atividade, nivelMin, vinculos] = await Promise.all([
    getProcesso(processoId),
    getAtividade(atividadeId),
    getNivelMinimoCapaz(),
    getVinculos(atividadeId),
  ]);
  if (!processo || !atividade) notFound();

  return (
    <div className="space-y-6">
      <div className="text-sm text-faint">
        <Link href="/processos" className="hover:underline">
          Processos
        </Link>{" "}
        /{" "}
        <Link href={`/processos/${processoId}`} className="hover:underline">
          {processo.nome}
        </Link>
      </div>

      <PageHeader
        title={atividade.nome}
        description="Defina capacidade (nível) e designação (papel) — são independentes."
        action={<CriticidadeBadge criticidade={atividade.criticidade} />}
      />

      <p className="rounded-lg bg-brand-light/60 px-4 py-3 text-sm text-brand-dark">
        <strong>Executor capaz</strong> = colaborador ativo com nível ≥{" "}
        <strong>{nivelLabel(nivelMin)}</strong>. Um backup sem capacidade real é
        marcado como <strong>falso backup</strong>.
      </p>

      <VinculosEditor
        atividadeId={atividadeId}
        processoId={processoId}
        nivelMinimoCapaz={nivelMin}
        vinculos={vinculos}
      />
    </div>
  );
}
